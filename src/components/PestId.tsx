import React, { useState } from "react";
import { 
  Bug, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Phone,
  ArrowRight
} from "lucide-react";

export default function PestId() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Sample pests
  const samples = [
    { name: "Worm Infiltration", url: "https://images.unsplash.com/photo-1543157145-f78c636d023d?w=400&q=80" },
    { name: "Leaf Aphids", url: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&q=80" }
  ];

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => setImage(r.result as string);
      r.readAsDataURL(file);
    }
  };

  const handleSample = (url: string) => {
    setImage(url);
    setResult(null);
  };

  const runAnalysis = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      const res = await fetch("/api/pest-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image })
      });

      if (!res.ok) throw new Error("Pest analysis failed.");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Title */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">🐛 AI Pest & Insect Identifier</h1>
        <p className="text-xs md:text-sm text-[#556B58] dark:text-[#A4BCA7]">
          Upload an image of an insect or pest to run automated crop infestation diagnostics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Input */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-500">Insect Specimen</h3>

            {/* Specimen Drag Area */}
            <div className="border-2 border-dashed border-[#2E7D32]/25 rounded-2xl p-6 text-center hover:bg-[#2E7D32]/5 transition-colors cursor-pointer relative overflow-hidden min-h-[160px] flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              
              {image ? (
                <div className="space-y-2 relative">
                  <img src={image} alt="insect sample" className="max-h-40 rounded-xl mx-auto object-cover" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setImage(null); }}
                    className="px-2 py-0.5 bg-red-500 text-white rounded text-[10px] font-bold"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div className="space-y-2 text-gray-400">
                  <Bug className="w-10 h-10 text-[#2E7D32] mx-auto" />
                  <p className="text-xs font-semibold">Upload insect image specimen</p>
                </div>
              )}
            </div>

            {/* Samples */}
            <div className="space-y-2">
              <span className="text-xs text-gray-400 font-bold block">Or Try Sample Specimens:</span>
              <div className="grid grid-cols-2 gap-2">
                {samples.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSample(s.url)}
                    className="p-1 border border-black/5 rounded-xl hover:bg-[#2E7D32]/5 transition-all"
                  >
                    <img src={s.url} alt="sample insect" className="h-12 w-full object-cover rounded-lg" />
                    <span className="text-[9px] font-bold block text-center mt-1">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={runAnalysis}
              disabled={!image || isAnalyzing}
              className="w-full bg-[#2E7D32] text-white py-3 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Classifying Pathogen Vector...
                </>
              ) : (
                <>
                  <Sparkles className="w-4.5 h-4.5" /> Run Insect Assessment
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-6 animate-fade-in">
              
              {/* Primary match */}
              <div className="glass-card p-6 border border-red-500/10 bg-red-500/5">
                <div className="flex justify-between items-start pb-4 border-b border-red-500/10">
                  <div>
                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider block">Pathological Specimen Identified</span>
                    <h3 className="font-extrabold text-lg text-red-600 dark:text-red-400 mt-0.5">{result.pest_name}</h3>
                    {result.scientific_name && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium italic block mt-0.5">
                        Scientific: {result.scientific_name}
                      </span>
                    )}
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-2 rounded-xl text-center border shadow-sm flex-shrink-0">
                    <span className="text-sm font-black text-red-500">{result.confidence}%</span>
                    <span className="text-[8px] text-gray-500 dark:text-gray-400 block font-bold">Accuracy</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 text-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold block">Severity Risk</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 inline-block">{result.severity}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold block">Estimated Loss</span>
                    <span className="font-bold text-xs text-red-600">{result.estimated_loss || "N/A"}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold block">Action Areas</span>
                    <span className="font-bold text-xs">{(result.organic_control?.length || 0) + (result.chemical_control?.length || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Damage Card */}
              <div className="glass-card p-6 space-y-4">
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5 text-red-500">
                  <AlertTriangle className="w-4 h-4" /> Feeding damage description
                </h4>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-semibold">
                  {result.damage}
                </p>

                {result.symptoms && result.symptoms.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Observed Symptoms:</span>
                    <ul className="space-y-1.5">
                      {result.symptoms.map((symptom: string, idx: number) => (
                        <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-red-500 font-bold">•</span> {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.reasoning && (
                  <div className="p-3.5 bg-black/5 dark:bg-white/5 border rounded-xl space-y-1.5">
                    <strong className="text-[11px] text-gray-700 dark:text-gray-300 block">Entomology Reasoning Chain:</strong>
                    {Array.isArray(result.reasoning) ? (
                      <ol className="list-decimal list-inside space-y-1 pl-1">
                        {result.reasoning.map((step: string, idx: number) => (
                          <li key={idx} className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">
                            {step}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">{result.reasoning}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Control Methods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 space-y-4 border border-[#4CAF50]/15">
                  <h4 className="font-bold text-xs uppercase text-[#2E7D32]">Biological Control</h4>
                  <ul className="space-y-2">
                    {result.organic_control?.map((oc: string, idx: number) => (
                      <li key={idx} className="text-xs text-gray-600 dark:text-gray-300 leading-normal flex items-start gap-1.5">
                        <span className="text-[#2E7D32] font-bold">✓</span> {oc}
                      </li>
                    )) || <li className="text-xs text-gray-400 italic">No specific biological control found.</li>}
                  </ul>
                </div>

                <div className="glass-card p-6 space-y-4 border border-red-500/15">
                  <h4 className="font-bold text-xs uppercase text-red-500">Systemic Chemical Block</h4>
                  <ul className="space-y-2">
                    {result.chemical_control?.map((cc: string, idx: number) => (
                      <li key={idx} className="text-xs text-gray-600 dark:text-gray-300 leading-normal flex items-start gap-1.5">
                        <span className="text-red-500 font-bold">!</span> {cc}
                      </li>
                    )) || <li className="text-xs text-gray-400 italic">No specific chemical control found.</li>}
                  </ul>
                </div>
              </div>

              {/* Additional Control & Prevention */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.control_methods && result.control_methods.length > 0 && (
                  <div className="glass-card p-6 space-y-4 border border-blue-500/15">
                    <h4 className="font-bold text-xs uppercase text-blue-600 dark:text-blue-400">Agricultural Controls</h4>
                    <ul className="space-y-2">
                      {result.control_methods.map((method: string, idx: number) => (
                        <li key={idx} className="text-xs text-gray-600 dark:text-gray-300 leading-normal flex items-start gap-1.5">
                          <span className="text-blue-500 font-bold">•</span> {method}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.prevention && result.prevention.length > 0 && (
                  <div className="glass-card p-6 space-y-4 border border-amber-500/15">
                    <h4 className="font-bold text-xs uppercase text-amber-600 dark:text-amber-400">Prevention Strategies</h4>
                    <ul className="space-y-2">
                      {result.prevention.map((prev: string, idx: number) => (
                        <li key={idx} className="text-xs text-gray-600 dark:text-gray-300 leading-normal flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">→</span> {prev}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white/40 dark:bg-[#122214]/40 border border-[#2E7D32]/10 rounded-2xl min-h-[300px]">
              <Bug className="w-14 h-14 text-gray-300 dark:text-gray-600 animate-pulse mb-4" />
              <h3 className="font-display font-bold text-base text-gray-600 dark:text-gray-300">Ready for specimen scan</h3>
              <p className="text-xs text-gray-500 max-w-sm mt-1">
                Provide an insect photo. The Gemini Multimodal engine will calculate exact taxonomic names, damage profiles, and bio-insecticide guidelines.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
