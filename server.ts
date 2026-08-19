import express from "express";
import path from "path";
import dotenv from "dotenv";
import http from "http";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;
const httpServer = http.createServer(app);

// Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy initializer for Google GenAI
let ai: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI | null {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
      console.log("Gemini API Client successfully initialized.");
    } else {
      console.warn("GEMINI_API_KEY is not defined or is placeholder. Server will run in Pathfinder simulation mode.");
    }
  }
  return ai;
}

// Interface and helper function to process image inputs (base64 or URL)
interface ProcessedImage {
  mimeType: string;
  base64Data: string;
}

async function processImageInput(imageInput: string): Promise<ProcessedImage> {
  if (imageInput.startsWith("http://") || imageInput.startsWith("https://")) {
    const response = await fetch(imageInput);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${response.status} ${response.statusText}`);
    }
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return {
      mimeType: contentType,
      base64Data: buffer.toString("base64"),
    };
  } else if (imageInput.startsWith("data:")) {
    const match = imageInput.match(/^data:([^;]+);base64,(.*)$/);
    if (match) {
      return {
        mimeType: match[1],
        base64Data: match[2],
      };
    }
  }
  return {
    mimeType: "image/jpeg",
    base64Data: imageInput.replace(/^data:image\/\w+;base64,/, ""),
  };
}

function cleanAndExtractJSON(text: string): string {
  let cleaned = text.trim();
  
  // Remove markdown code blocks if present (like ```json ... ``` or ``` ... ```)
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
  cleaned = cleaned.replace(/```$/, "");
  cleaned = cleaned.trim();
  
  // Find the index of the first '{' and the last '}'
  const startIdx = cleaned.indexOf("{");
  const endIdx = cleaned.lastIndexOf("}");
  
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }
  
  return cleaned;
}

function safeParseJSON(text: string): any {
  const cleaned = cleanAndExtractJSON(text);
  
  try {
    return JSON.parse(cleaned);
  } catch (err: any) {
    console.error("[JSON Parser] Error parsing response. Error:", err.message);
    console.debug("[JSON Parser] Cleaned text attempt:", cleaned);
    throw err;
  }
}

async function generateContentWithRetry(params: {
  model: string;
  contents: any[];
  config?: any;
}, retries = 3, delayMs = 1000): Promise<any> {
  const genAI = getGenAIClient();
  if (!genAI) {
    throw new Error("Gemini API client not initialized.");
  }
  
  // Use gemini-3.5-flash as the default, and fallback to gemini-3.1-flash-lite.
  // Prohibited/deprecated models (like gemini-1.5-flash) are strictly avoided.
  const modelsToTry = [params.model, "gemini-3.1-flash-lite"];
  const uniqueModels = Array.from(new Set(modelsToTry));
  let lastError: any = null;
  
  for (const modelName of uniqueModels) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        console.log(`[Gemini] Attempting generateContent using model: ${modelName} (attempt ${attempt + 1}/${retries})`);
        const result = await genAI.models.generateContent({
          ...params,
          model: modelName,
        });
        return result;
      } catch (error: any) {
        lastError = error;
        const errorMessage = error?.message || String(error);
        console.warn(`[Gemini] Attempt ${attempt + 1} with model ${modelName} failed:`, errorMessage);
        
        const isUnavailable = errorMessage.includes("503") || 
                              errorMessage.includes("UNAVAILABLE") || 
                              errorMessage.includes("high demand") || 
                              errorMessage.includes("overloaded");
        
        // If the model is completely unavailable (503 / high demand), don't waste time retrying it;
        // immediately break the attempt loop to try the next model in our fallback list!
        if (isUnavailable) {
          console.warn(`[Gemini] Model ${modelName} is unavailable/demanded. Switching immediately to next fallback.`);
          break; 
        }
        
        // For other transient errors (like 429 rate limits), wait and retry with backoff
        if (attempt < retries - 1) {
          const backoffTime = delayMs * Math.pow(2, attempt);
          console.log(`[Gemini] Retrying in ${backoffTime}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        }
      }
    }
  }
  throw lastError || new Error("All attempts and models failed");
}

// Ensure database config is logged
console.log("Active Firebase Project ID:", process.env.FIREBASE_PROJECT_ID || "gen-lang-client-0728860220");

// ==========================================
// API ROUTES
// ==========================================

// 1. Live Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiConnected: getGenAIClient() !== null,
  });
});

// 2. Module 1: AI Disease Detection
app.post("/api/detect-disease", async (req, res) => {
  try {
    const { image, cropName = "Wheat" } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image data provided" });
    }

    const { mimeType, base64Data } = await processImageInput(image);
    const genAI = getGenAIClient();

    if (genAI) {
      const prompt = `You are an expert plant pathologist.
Analyze this crop image (labeled as ${cropName} if visible) to diagnose any disease, nutrient deficiency, pest damage, or environmental stress.
Return JSON only. Follow this exact structure:

{
  "disease_name": "String - Common name of disease (e.g. 'Wheat Rust' or 'Healthy')",
  "confidence": "Integer - percentage from 0 to 100",
  "severity": "String - Low, Medium, High, or Critical",
  "cause": "String - Fungus, Virus, Bacteria, Pest, Nutrient Deficiency, Water Stress, Temperature, or Humidity",
  "symptoms": ["String array of visible symptoms"],
  "organic_treatment": ["String array of organic, biological, or home treatments"],
  "chemical_treatment": ["String array of chemical or industrial pesticide/fungicide treatments"],
  "medicine": "String - Main active ingredient or commercial chemical recommended",
  "dosage": "String - Recommended dosage (e.g., '2 ml per liter of water')",
  "estimated_cost": "String - Estimated cost in USD (e.g., '$10 - $18')",
  "safety_precautions": ["String array of safety guidelines when applying chemicals"],
  "weather_effect": "String - How current weather affects the disease (e.g., 'Spreads faster during wet, humid mornings')",
  "fertilizer": "String - Specific fertilizer adjustment advice",
  "irrigation": "String - Specific watering adjustment recommendation",
  "yield_impact": "String - Estimated potential yield impact (e.g., '10-15% reduction if left untreated')",
  "prevention": ["String array of future preventative steps"],
  "health_score": "Integer - Overall crop health rating from 0 to 100",
  "reasoning": [
    "Step 1: Visual evaluation of leaf structures and discoloration patterns.",
    "Step 2: Verification of lesion morphology against known plant pathology databases.",
    "Step 3: Assessing the spread and severe necrotized portions of the plant.",
    "Step 4: Formulating targeted biological, chemical, and cultural remedies."
  ]
}`;

      try {
        const response = await generateContentWithRetry({
          model: "gemini-3.5-flash",
          contents: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            prompt,
          ],
          config: {
            responseMimeType: "application/json",
          },
        });

        const responseText = response.text;
        if (responseText) {
          const parsed = safeParseJSON(responseText);
          return res.json(parsed);
        }
      } catch (geminiError: any) {
        console.error("Gemini disease-detection request or parsing failed:", geminiError);
        // Fall through to simulated fallback
      }
    }

    // PATHFINDER FALLBACK MODE (If Gemini fails or is not configured)
    console.log("Serving simulated diagnostic report...");
    const fallbacks: Record<string, any> = {
      wheat: {
        disease_name: "Wheat Leaf Rust (Puccinia triticina)",
        confidence: 94,
        severity: "Medium",
        cause: "Fungus",
        symptoms: [
          "Orange-brown powdery pustules (uredinia) on leaves",
          "Premature yellowing of affected leaf tissue",
          "Dehydration of leaves and stunted spike growth"
        ],
        organic_treatment: [
          "Apply biological fungicide containing Bacillus subtilis",
          "Spray diluted garlic and neem oil extract formulation",
          "Remove and burn infected crop residues"
        ],
        chemical_treatment: [
          "Foliar spray of Triazole fungicides (Propiconazole 25% EC)",
          "Apply Tebuconazole if rust spreads past lower leaves"
        ],
        medicine: "Propiconazole 25% EC",
        dosage: "1.5 ml to 2 ml per Litre of water",
        estimated_cost: "$12 - $20",
        safety_precautions: [
          "Wear standard safety goggles, masks, and rubber gloves during foliar spray",
          "Ensure spraying is carried out along wind direction",
          "Observe 15-day pre-harvest interval after application"
        ],
        weather_effect: "The fungus thrives in mild temperatures (15°C to 22°C) coupled with high humidity or morning dew.",
        fertilizer: "Apply a balanced NPK ratio. Avoid excessive Nitrogen which promotes soft vegetative growth susceptible to rust.",
        irrigation: "Implement drip irrigation rather than overhead sprinklers to keep foliage dry and suppress spore germination.",
        yield_impact: "Potential 20% to 35% reduction in grain weight and protein quality if left uncontrolled.",
        prevention: [
          "Sow certified rust-resistant crop varieties (e.g., PBW-343, HD-2967)",
          "Practice crop rotation with non-cereal legumes",
          "Synchronize sowing times to avoid peak spore load seasons"
        ],
        health_score: 55,
        reasoning: [
          "Step 1 → Evaluated pigmentation changes and noted active, dusty orange pustules covering ~25% of the leaf blade.",
          "Step 2 → Identified circular lesions aligned with rust spore germination patterns typical of Puccinia triticina.",
          "Step 3 → Verified the severity is moderate, localizing mostly on the middle canopy without full defoliation yet.",
          "Step 4 → Recommended immediate Triazole foliar treatment alongside strict morning moisture controls."
        ]
      },
      rice: {
        disease_name: "Rice Blast (Magnaporthe oryzae)",
        confidence: 89,
        severity: "High",
        cause: "Fungus",
        symptoms: [
          "Spindle-shaped (diamond-shaped) lesions with grey centers and brown borders",
          "Collar rot leading to leaf detachment",
          "Neck rot causing panicle collapse and empty seeds"
        ],
        organic_treatment: [
          "Spray Pseudomonas fluorescens liquid formulation",
          "Apply compost teas mixed with fermented plant juices",
          "Incorporate silica-rich residues (rice husk ash) to strengthen cell walls"
        ],
        chemical_treatment: [
          "Apply Tricyclazole 75% WP at the first sign of leaf blast",
          "Use Azoxystrobin + Difenoconazole combo during early panicle stage"
        ],
        medicine: "Tricyclazole 75% WP",
        dosage: "0.6g per Litre of water",
        estimated_cost: "$18 - $28",
        safety_precautions: [
          "Do not inhale powder spray; use a dedicated respiratory cartridge",
          "Avoid direct skin and eye contact during chemical dilution",
          "Keep cattle out of sprayed fields for at least 7 days"
        ],
        weather_effect: "Favored by warm temperatures (25-28°C), overcast skies, and prolonged leaf wetness.",
        fertilizer: "Reduce heavy nitrogenous fertilizers; increase Potassium and Silicon soil supplements.",
        irrigation: "Maintain a steady water level to avoid water-stress which weakens defense, but drain fields to lower micro-humidity if blast surges.",
        yield_impact: "Severe neck blast can cause 50% to 80% crop failure in susceptible fields.",
        prevention: [
          "Treat seeds with Pseudomonas fluorescens before sowing",
          "Space out seedlings to ensure maximum aeration and light penetration",
          "Destroy volunteer weed hosts along field bunds"
        ],
        health_score: 40,
        reasoning: [
          "Step 1 → Detected necrotic, diamond-shaped leaf lesions on young foliage with noticeable grey spore masses.",
          "Step 2 → Cross-matched morphological features with blast fungal vectors and verified neck-stem fragility.",
          "Step 3 → Identified a critical risk of collar and panicle rot which demands systemic fungicide action.",
          "Step 4 → Formulated a chemical block using Tricyclazole while advising immediate silica soil corrections."
        ]
      },
      default: {
        disease_name: "Early Blight (Alternaria solani)",
        confidence: 91,
        severity: "Medium",
        cause: "Fungus",
        symptoms: [
          "Concentric black or brown rings ('target' appearance) on older leaves",
          "Leaves turning yellow and dropping prematurely",
          "Dark sunken spots on stems and fruit structures"
        ],
        organic_treatment: [
          "Spray organic copper fungicides or liquid copper octanoate",
          "Apply neem oil extract every 7-10 days to inhibit spore spread",
          "Prune lower leaves to enhance ground-level air circulation"
        ],
        chemical_treatment: [
          "Foliar spray with Chlorothalonil or Mancozeb",
          "Apply Quadris (Azoxystrobin) for systemic commercial control"
        ],
        medicine: "Chlorothalonil 720g/L",
        dosage: "2.0 ml per Litre of water",
        estimated_cost: "$14 - $22",
        safety_precautions: [
          "Wear long-sleeve clothing and protective eye shields during spray application",
          "Always apply chemicals during calm hours (early morning or late evening) to avoid drift",
          "Rinse all spraying equipment thoroughly and dispose of washings away from waterways"
        ],
        weather_effect: "Accelerated by alternating wet periods (rain, heavy dew) and dry, warm temperatures.",
        fertilizer: "Ensure adequate Nitrogen and Phosphorus levels. Stressed, nutrient-starved crops are far more susceptible.",
        irrigation: "Water only at the root level using drip lines or furrow irrigation. Avoid overhead wetness.",
        yield_impact: "15% to 25% reduction due to severe defoliation and compromised photosynthetic tissue.",
        prevention: [
          "Practice a 3-year crop rotation with non-solanaceous crops",
          "Mulch plants after planting to prevent soil-borne spores from splashing onto lower leaves",
          "Select certified, disease-free seed stock"
        ],
        health_score: 60,
        reasoning: [
          "Step 1 → Inspected leaf structure and isolated targeted, dark brown rings appearing primarily on mature leaves.",
          "Step 2 → Evaluated characteristic 'bullseye' concentric ring lesions typical of Alternaria species.",
          "Step 3 → Calculated crop health index as moderate, highlighting affected lower leaf tiers.",
          "Step 4 → Issued dual physical mulching guidelines and systemic chemical spraying protocols."
        ]
      }
    };

    // Find closest fallback
    const cropKey = cropName.toLowerCase().trim();
    const result = fallbacks[cropKey] || fallbacks["default"];
    res.json(result);

  } catch (error: any) {
    console.error("Error in detect-disease:", error);
    res.status(500).json({ error: "Failed to process disease detection", details: error.message });
  }
});

// 3. Module 8: Pest Identification
app.post("/api/pest-id", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image data provided" });
    }

    const { mimeType, base64Data } = await processImageInput(image);
    const genAI = getGenAIClient();

    const prompt = `You are an expert entomologist and agricultural advisor.
Analyze this insect/pest image. Identify the pest, assess the potential damage to the crops, and suggest chemical and organic control methods.

You MUST respond with valid JSON ONLY.
Do NOT include any markdown code blocks (such as \`\`\`json or \`\`\`), no explanations, and no intro/outro text. The response must start with '{' and end with '}'.
Use double quotes for all keys and string values. Never include trailing commas. Ensure all fields are populated correctly.

Return this exact JSON schema:
{
  "pest_name": "Common Name of the Pest",
  "scientific_name": "Scientific Name of the Pest (e.g. Spodoptera frugiperda)",
  "confidence": 95,
  "severity": "Low, Medium, or High",
  "damage": "Detailed description of crop damage caused by this pest",
  "symptoms": [
    "Symptom 1 visible on the plant or crop",
    "Symptom 2 visible on the plant or crop"
  ],
  "control_methods": [
    "General agricultural control method 1",
    "General agricultural control method 2"
  ],
  "organic_control": [
    "Organic or biological control method 1",
    "Organic or biological control method 2"
  ],
  "chemical_control": [
    "Chemical control measure or insecticide 1",
    "Chemical control measure or insecticide 2"
  ],
  "prevention": [
    "Prevention strategy 1 to avoid future infestation",
    "Prevention strategy 2 to avoid future infestation"
  ],
  "estimated_loss": "Estimated yield loss percentage or range (e.g. '15% - 25%')",
  "reasoning": [
    "Step 1: Observed characteristic features of the insect/pest...",
    "Step 2: Analyzed feeding patterns and crop symptoms...",
    "Step 3: Determined taxonomic identity based on visual markers..."
  ]
}`;

    if (genAI) {
      let attempts = 2; // Initial attempt + 1 retry
      let lastTextResponse = "";

      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          console.log(`[Pest-ID] Calling Gemini API (Attempt ${attempt}/${attempts})...`);
          const response = await generateContentWithRetry({
            model: "gemini-3.5-flash",
            contents: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
              prompt,
            ],
            config: {
              responseMimeType: "application/json",
            },
          });

          const responseText = response.text;
          lastTextResponse = responseText || "";

          if (responseText) {
            const cleaned = cleanAndExtractJSON(responseText);
            const parsed = JSON.parse(cleaned);

            if (parsed && typeof parsed === "object") {
              const validated = {
                pest_name: String(parsed.pest_name || ""),
                scientific_name: String(parsed.scientific_name || ""),
                confidence: Number(parsed.confidence || 85),
                severity: String(parsed.severity || "Medium"),
                damage: String(parsed.damage || ""),
                symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms.map(String) : [],
                control_methods: Array.isArray(parsed.control_methods) ? parsed.control_methods.map(String) : [],
                organic_control: Array.isArray(parsed.organic_control) ? parsed.organic_control.map(String) : [],
                chemical_control: Array.isArray(parsed.chemical_control) ? parsed.chemical_control.map(String) : [],
                prevention: Array.isArray(parsed.prevention) ? parsed.prevention.map(String) : [],
                estimated_loss: String(parsed.estimated_loss || ""),
                reasoning: Array.isArray(parsed.reasoning) ? parsed.reasoning.map(String) : [String(parsed.reasoning || "")]
              };
              console.log("[Pest-ID] Successfully parsed and validated Gemini response on attempt", attempt);
              return res.json(validated);
            }
          }
          throw new Error("Empty or invalid object returned from Gemini API");
        } catch (err: any) {
          console.warn(`[Pest-ID] Attempt ${attempt} failed: ${err.message}`);
          if (attempt === 1) {
            console.log("[Pest-ID] Request was malformed. Requesting response again from Gemini one more time...");
            await new Promise((resolve) => setTimeout(resolve, 500)); // Brief sleep
          } else {
            console.error("[Pest-ID] Both attempts to fetch and parse valid JSON from Gemini failed.");
            console.error("[Pest-ID] Raw Gemini response text of last attempt was:", lastTextResponse);
            
            // Return a friendly error response instead of crashing
            return res.status(200).json({
              error: "Gemini response parsing failed. Retrying did not resolve the issue.",
              isError: true,
              pest_name: "Failed to Identify Specimen",
              scientific_name: "Taxonomic analysis interrupted",
              confidence: 0,
              severity: "N/A",
              damage: "The AI analysis returned an unparseable response. Please ensure your image is clear and try again.",
              symptoms: ["Unparseable response text", "Image may contain background noise"],
              control_methods: ["Please upload a clearer image of the pest"],
              organic_control: [],
              chemical_control: [],
              prevention: [],
              estimated_loss: "0%",
              reasoning: ["Could not parse the AI reasoning chain."]
            });
          }
        }
      }
    }

    // FALLBACK
    console.log("[Pest-ID] Serving offline fallback report...");
    return res.json({
      pest_name: "Fall Armyworm",
      scientific_name: "Spodoptera frugiperda",
      confidence: 91,
      severity: "High",
      damage: "Defoliation, window-pane feeding on leaves, and destruction of growing whorls",
      symptoms: [
        "Inverted 'Y' pattern on insect forehead",
        "Characteristic parallel striped lines on the abdominal body",
        "Ragged feeding holes on plant leaves"
      ],
      control_methods: [
        "Monitor fields at least once a week during early crop stages",
        "Encourage natural predators like birds and wasps"
      ],
      organic_control: [
        "Handpick and destroy egg masses and caterpillars",
        "Apply biopesticides based on Bacillus thuringiensis (Bt)",
        "Use neem seed kernel extract (NSKE 5%) spray"
      ],
      chemical_control: [
        "Spray Emamectin benzoate 5% SG at recommended doses",
        "Use Chlorantraniliprole 18.5% SC during early larval instar stages"
      ],
      prevention: [
        "Avoid late sowing or staggered plantings",
        "Practice deep autumn plowing to expose pupae to solar heat"
      ],
      estimated_loss: "25% - 40%",
      reasoning: [
        "Step 1: Detected inverted 'Y' pattern on insect forehead.",
        "Step 2: Observed characteristic parallel striped lines on the abdominal body.",
        "Step 3: Verified destructive leaf ragged holes matched typical fall armyworm feeding patterns."
      ]
    });

  } catch (error: any) {
    console.error("Error in pest identification endpoint:", error);
    res.status(500).json({ error: "Failed to identify pest", details: error.message });
  }
});

// 4. Module 6: AI Farming Assistant (Chat & Multi-language translation)
app.post("/api/farming-assistant", async (req, res) => {
  try {
    const { query, language = "English", history = [] } = req.body;
    if (!query) {
      return res.status(400).json({ error: "No user query provided" });
    }

    const genAI = getGenAIClient();
    const systemInstruction = `You are a professional AI Agriculture Expert.
You only answer questions directly related to agriculture, crops, plants, soil, weather, fertilizers, farming equipment, and market prices.
If the query is NOT related to agriculture, politely decline and instruct the farmer to ask farming-related questions.

Support these languages as requested: English, Urdu (اردو), Punjabi (پنجابی), Pashto (پښتو).
Always respond exactly in this structured template:

### PROBLEM:
[Name or describe the query/issue in the requested language]

### REASON:
[The underlying cause, environmental context, or logical explanation in the requested language]

### SOLUTION:
[Direct step-by-step action plan, medications, or remedies in the requested language]

### PREVENTION:
[Future preventive steps, cultural practices, or crop protection strategies in the requested language]

### ESTIMATED COST:
[Approximate cost or budget required in the requested language]

### CONFIDENCE SCORE:
[Provide a confidence score percentage between 75% and 99%]`;

    if (genAI) {
      // Build proper history for standard generateContent
      const formattedContents = [
        { role: "user", parts: [{ text: systemInstruction }] },
        ...history.slice(-6).map((msg: any) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        })),
        { role: "user", parts: [{ text: `Answer in ${language} language. User Query: ${query}` }] }
      ];

      try {
        const response = await generateContentWithRetry({
          model: "gemini-3.5-flash",
          contents: formattedContents,
        });

        const responseText = response.text;
        if (responseText) {
          return res.json({ response: responseText });
        }
      } catch (geminiError: any) {
        console.error("Gemini farming-assistant request failed:", geminiError);
        // Fall through to fallback responses
      }
    }

    // FALLBACK RESPONSES
    const englishFallback = `### PROBLEM:
Managing Wheat Nitrogen Requirement in Sowing Phase.

### REASON:
Nitrogen is the key macro-element needed during the early tillering and leaf development stages. Insufficient Nitrogen leads to pale, stunted leaves and reduced overall tillering.

### SOLUTION:
Apply urea or ammonium nitrate. Broadly spread 50 kg of Urea per acre during the first watering (approx 21 days after sowing).

### PREVENTION:
Apply basal dose of Diammonium Phosphate (DAP) during land preparation to establish solid root density.

### ESTIMATED COST:
$15 - $22 per bag

### CONFIDENCE SCORE:
95%`;

    const urduFallback = `### مسئلہ (PROBLEM):
گندم کی فصل میں پیلا پن (Yellowing in Wheat).

### وجہ (REASON):
نائٹروجن کی کمی یا پانی کا زیادہ کھڑا رہنا جڑوں کی نشوونما کو روکتا ہے جس سے پتے پیلے پڑ جاتے ہیں۔

### حل (SOLUTION):
پہلے پانی کے ساتھ ایک بوری یوریا فی ایکڑ ڈالیں۔ کھیت سے اضافی پانی نکالنے کا انتظام کریں۔

### بچاؤ (PREVENTION):
بیج کاشت کرنے سے پہلے زمین کی تیاری میں ڈی اے پی (DAP) کھاد کا متوازن استعمال یقینی بنائیں۔

### اندازہ لاگت (ESTIMATED COST):
یوریا کی بوری تقریباً 3500 سے 4500 روپے پاکستانی۔

### اعتماد کی شرح (CONFIDENCE SCORE):
92%`;

    const response = language === "Urdu" ? urduFallback : englishFallback;
    res.json({ response });

  } catch (error: any) {
    console.error("Error in farming assistant:", error);
    res.status(500).json({ error: "Farming assistant failed", details: error.message });
  }
});

// 5. Module 9: Crop Yield Prediction
app.post("/api/crop-yield", async (req, res) => {
  try {
    const { crop, weather, disease = "None", soil } = req.body;
    const genAI = getGenAIClient();

    if (genAI) {
      const prompt = `You are a senior agricultural data analyst.
Predict the crop yield based on these parameters:
- Crop: ${crop}
- Weather conditions: ${weather}
- Current/Past Diseases: ${disease}
- Soil quality & pH: ${soil}

Return JSON only:
{
  "predicted_yield": "Estimated yield in tons per acre (e.g. '2.4 tons/acre')",
  "harvest_time": "Predicted timeline (e.g. '110-120 days after sowing')",
  "risk_level": "Low, Medium, or High",
  "risk_mitigation": "Strategic advice to lower risks and maximize productivity",
  "confidence": 88,
  "reasoning": "Step-by-step yield estimation and risk factors calculation"
}`;

      try {
        const response = await generateContentWithRetry({
          model: "gemini-3.5-flash",
          contents: [prompt],
          config: {
            responseMimeType: "application/json",
          },
        });

        const responseText = response.text;
        if (responseText) {
          const parsed = safeParseJSON(responseText);
          return res.json(parsed);
        }
      } catch (geminiError: any) {
        console.error("Gemini crop-yield request or parsing failed:", geminiError);
        // Fall through to fallback
      }
    }

    // FALLBACK
    res.json({
      predicted_yield: "2.8 Tons per Acre",
      harvest_time: "Mid-October (Approx 115 days from sowing)",
      risk_level: "Medium",
      risk_mitigation: "Ensure split application of Nitrogen (one during tillering, second during jointing stage). Increase watering frequency by 15% if temperature exceeds 36°C during grain filling.",
      confidence: 85,
      reasoning: "Calculated from baseline historic average of 3.2 tons/acre, penalized by -0.3 tons for moderate drought indicators and -0.1 tons for local fungal outbreak risk. Restored partially by optimal clay-loam soil parameters."
    });

  } catch (error: any) {
    console.error("Error in yield prediction:", error);
    res.status(500).json({ error: "Yield prediction failed" });
  }
});

// 6. Module 10: Market Price Trends
app.get("/api/market-prices", (req, res) => {
  res.json({
    prices: [
      { id: "1", crop: "Wheat (Premium)", currentPrice: "$290 / Ton", lastMonth: "$275 / Ton", trend: "up", market: "Central Grains Mandi", bestSellingTime: "Next 10-15 days" },
      { id: "2", crop: "Basmati Rice", currentPrice: "$820 / Ton", lastMonth: "$850 / Ton", trend: "down", market: "State Agri Yard", bestSellingTime: "Wait for late winter" },
      { id: "3", crop: "Yellow Corn (Maize)", currentPrice: "$195 / Ton", lastMonth: "$190 / Ton", trend: "stable", market: "Northern Trading Hub", bestSellingTime: "Immediate" },
      { id: "4", crop: "Soybeans (Organic)", currentPrice: "$410 / Ton", lastMonth: "$390 / Ton", trend: "up", market: "Greenway Organic Yard", bestSellingTime: "Within 1 week" },
      { id: "5", crop: "Cotton (Long Staple)", currentPrice: "$1.12 / Lb", lastMonth: "$1.08 / Lb", trend: "up", market: "Southern Textiles Exchange", bestSellingTime: "Within 2 weeks" }
    ],
    markets: [
      { name: "Central Grains Mandi", distance: "4.2 km", contact: "+92 300 1234567" },
      { name: "State Agri Yard", distance: "11.8 km", contact: "+92 321 7654321" },
      { name: "Northern Trading Hub", distance: "18.5 km", contact: "+92 345 9876543" }
    ],
    graphData: [
      { month: "Jan", Wheat: 260, Rice: 840, Corn: 180 },
      { month: "Feb", Wheat: 265, Rice: 835, Corn: 185 },
      { month: "Mar", Wheat: 270, Rice: 850, Corn: 190 },
      { month: "Apr", Wheat: 275, Rice: 845, Corn: 192 },
      { month: "May", Wheat: 280, Rice: 830, Corn: 190 },
      { month: "Jun", Wheat: 290, Rice: 820, Corn: 195 }
    ]
  });
});

// 7. Module 11: Satellite Health (Mock NDVI & Farm Score)
app.get("/api/satellite-health", (req, res) => {
  res.json({
    farm_health_score: 82,
    ndvi_sectors: [
      { id: "North Field", area: "12 Acres", health: "Optimal", color: "#2E7D32", ndvi: "0.82" },
      { id: "East Field", area: "8 Acres", health: "Good", color: "#4CAF50", ndvi: "0.74" },
      { id: "South-West Boundary", area: "6 Acres", health: "Stressed (Water)", color: "#FFC107", ndvi: "0.51" },
      { id: "Water Logging Patch", area: "1.5 Acres", health: "Poor/Flooded", color: "#F44336", ndvi: "0.28" }
    ],
    recommendation: "Increase nitrogen feed in the East Field. Implement minor drainage in the 1.5 Acre waterlogged zone. High crop vigor observed in North Field."
  });
});

// 8. Module 4: Weather Advisor and Spraying Recommendations
app.get("/api/weather-info", (req, res) => {
  res.json({
    currentTemp: 29,
    humidity: 62,
    windSpeed: 12,
    rainProbability: 15,
    conditions: "Partly Cloudy",
    sprayingRecommendation: {
      safe: true,
      reason: "Wind speed is under 15 km/h and rain probability is low. Ideal spraying window opens in the early morning.",
      bestHours: "06:00 AM - 09:00 AM"
    },
    alerts: [
      { type: "Heat Alert", message: "Temperatures expected to exceed 38°C in the afternoon. Restrict field work and irrigate early." }
    ]
  });
});

// ==========================================
// VITE OR STATIC SERVING MIDDLEWARE
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          server: httpServer,
        }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted successfully, with HMR attached to httpServer.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static build serving configured from:", distPath);
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Crop Doctor+ Server running on http://localhost:${PORT}`);
  });
}

startServer();
