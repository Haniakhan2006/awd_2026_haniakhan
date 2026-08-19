import React, { useState, useEffect } from "react";
import { 
  ClipboardList, 
  Download, 
  Plus, 
  Calculator, 
  Activity, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { FarmRecordLog } from "../types";
import { db, safeAddDoc } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

interface FarmRecordsProps {
  userId: string;
}

export default function FarmRecords({ userId }: FarmRecordsProps) {
  const [records, setRecords] = useState<FarmRecordLog[]>([]);
  const [crop, setCrop] = useState("Wheat");
  const [season, setSeason] = useState("Rabi (Winter)");
  const [area, setArea] = useState("10 Acres");
  const [expenses, setExpenses] = useState("");
  const [harvest, setHarvest] = useState("");
  const [revenue, setRevenue] = useState("");

  // Crop Health Score Sliders (Module 19)
  const [diseaseLevel, setDiseaseLevel] = useState(2);
  const [weatherLevel, setWeatherLevel] = useState(3);
  const [soilLevel, setSoilLevel] = useState(8); // Nutrition level (high is good)
  const [waterLevel, setWaterLevel] = useState(9); // Irrigation level (high is good)
  const [pestLevel, setPestLevel] = useState(1);
  const [calculatedHealthScore, setCalculatedHealthScore] = useState(84);

  useEffect(() => {
    const saved = localStorage.getItem(`farm-records-${userId}`);
    if (saved) {
      setRecords(JSON.parse(saved));
    } else {
      const defaults: FarmRecordLog[] = [
        { userId, cropName: "Wheat", season: "Rabi 2025", area: "12 Acres", sowingDate: "2025-11-05", expenses: 1450, harvestAmount: 32.4, revenue: 9400, createdAt: new Date().toISOString() },
        { userId, cropName: "Cotton", season: "Kharif 2025", area: "8 Acres", sowingDate: "2025-05-12", expenses: 1800, harvestAmount: 18.2, revenue: 7800, createdAt: new Date().toISOString() }
      ];
      setRecords(defaults);
      localStorage.setItem(`farm-records-${userId}`, JSON.stringify(defaults));
    }
  }, [userId]);

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenses) return;

    const newRec: FarmRecordLog = {
      userId,
      cropName: crop,
      season,
      area,
      sowingDate: new Date().toISOString().split("T")[0],
      expenses: Number(expenses),
      harvestAmount: Number(harvest) || 0,
      revenue: Number(revenue) || 0,
      createdAt: new Date().toISOString()
    };

    const updated = [...records, newRec];
    setRecords(updated);
    localStorage.setItem(`farm-records-${userId}`, JSON.stringify(updated));

    // Sync to Firestore
    safeAddDoc("farmRecords", newRec);

    setExpenses("");
    setHarvest("");
    setRevenue("");
  };

  // Module 19: Health Score formulation
  const handleCalculateHealth = () => {
    // 100 baseline. Subtract bad indicators, add positive indicators
    // Disease: max -25. Weather: max -20. Soil: positive weight up to +25. Water: positive weight up to +25. Pests: max -20.
    const diseasePenalty = diseaseLevel * 2.5; // up to -25
    const weatherPenalty = weatherLevel * 2.0; // up to -20
    const soilScore = (soilLevel / 10) * 25; // up to 25
    const waterScore = (waterLevel / 10) * 25; // up to 25
    const pestPenalty = pestLevel * 2.0; // up to -20

    const score = Math.round(50 - diseasePenalty - weatherPenalty + soilScore + waterScore - pestPenalty);
    const finalScore = Math.min(100, Math.max(0, score));
    setCalculatedHealthScore(finalScore);
  };

  // Simulated download of reports
  const downloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Crop Name,Season,Area,Expenses ($),Harvest Yield (Tons),Revenue ($)\n";
    
    records.forEach(r => {
      csvContent += `${r.cropName},${r.season},${r.area},${r.expenses},${r.harvestAmount || 0},${r.revenue || 0}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `farm_logbook_${userId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">📝 Farm Records & Crop Health Engine</h1>
          <p className="text-xs md:text-sm text-[#556B58] dark:text-[#A4BCA7]">
            Log field expenses, record harvest weights, and calculate holistic plant vitality gauges.
          </p>
        </div>
        <button
          onClick={downloadCSV}
          className="border border-[#2E7D32]/20 hover:bg-[#2E7D32]/5 py-2 px-4 rounded-xl text-xs font-bold text-[#2E7D32] dark:text-[#4CAF50] flex items-center gap-2 transition-colors self-start"
        >
          <Download className="w-4 h-4" /> Download CSV Logbook
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Farm records logger (Module 18) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 space-y-6">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-500">Field Activity Log</h3>

            {/* List */}
            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {records.map((rec, i) => (
                <div key={i} className="p-4 bg-white/50 dark:bg-[#122214]/40 border border-black/5 dark:border-white/5 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-500 block">Crop species</span>
                    <span className="font-bold text-xs">{rec.cropName}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-500 block">Season / Area</span>
                    <span className="font-bold text-xs">{rec.season} • {rec.area}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-500 block">Expenses ($)</span>
                    <span className="font-bold text-xs text-red-500">${rec.expenses}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-500 block">Revenue ($)</span>
                    <span className="font-bold text-xs text-[#2E7D32]">${rec.revenue || "—"}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Record Form */}
            <form onSubmit={handleAddRecord} className="pt-4 border-t border-[#2E7D32]/10 space-y-4">
              <span className="text-xs font-bold text-gray-500 uppercase block">Log New Seasonal Harvest</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-semibold block">Crop</span>
                  <select 
                    value={crop} 
                    onChange={e => setCrop(e.target.value)} 
                    className="w-full bg-white/40 dark:bg-[#0A140B]/40 border border-black/10 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#2E7D32] outline-none"
                  >
                    <option value="Wheat">Wheat</option>
                    <option value="Rice">Rice</option>
                    <option value="Cotton">Cotton</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-semibold block">Season</span>
                  <input 
                    type="text" 
                    value={season} 
                    onChange={e => setSeason(e.target.value)} 
                    placeholder="e.g. Rabi 2026"
                    className="w-full bg-white/40 dark:bg-[#0A140B]/40 border border-black/10 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#2E7D32] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-semibold block">Area Sowed</span>
                  <input 
                    type="text" 
                    value={area} 
                    onChange={e => setArea(e.target.value)} 
                    placeholder="e.g. 15 Acres"
                    className="w-full bg-white/40 dark:bg-[#0A140B]/40 border border-black/10 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#2E7D32] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-semibold block">Operational Expenses ($)</span>
                  <input 
                    type="number" 
                    value={expenses} 
                    onChange={e => setExpenses(e.target.value)} 
                    placeholder="e.g. 1500"
                    className="w-full bg-white/40 dark:bg-[#0A140B]/40 border border-black/10 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#2E7D32] outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-semibold block">Harvest Amount (Tons)</span>
                  <input 
                    type="number" 
                    value={harvest} 
                    onChange={e => setHarvest(e.target.value)} 
                    placeholder="e.g. 24"
                    className="w-full bg-white/40 dark:bg-[#0A140B]/40 border border-black/10 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#2E7D32] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-semibold block">Total Revenue ($)</span>
                  <input 
                    type="number" 
                    value={revenue} 
                    onChange={e => setRevenue(e.target.value)} 
                    placeholder="e.g. 8400"
                    className="w-full bg-white/40 dark:bg-[#0A140B]/40 border border-black/10 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#2E7D32] outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#2E7D32] text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#2E7D32]/10"
              >
                <Plus className="w-4 h-4" /> Save Record Log
              </button>
            </form>
          </div>
        </div>

        {/* Right: Crop Health Score Gauge (Module 19 SPECIFIC) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 space-y-6 border border-[#2E7D32]/10 bg-gradient-to-b from-[#2E7D32]/5 to-transparent">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-500">Crop Health Score Calculator</h3>

            {/* Gauge Graphic */}
            <div className="text-center py-4 relative">
              <div className="inline-flex flex-col justify-center items-center w-36 h-36 bg-[#2E7D32]/5 rounded-full border-4 border-[#2E7D32]/15 relative shadow-inner">
                <span className="text-4xl font-extrabold text-[#2E7D32] dark:text-[#4CAF50]">{calculatedHealthScore}</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Vitality Index</span>
                
                {/* Dynamic status string */}
                <span className={`text-[9px] font-bold uppercase tracking-wider block px-2.5 py-0.5 rounded-full mt-2.5 ${
                  calculatedHealthScore >= 80 
                    ? "bg-green-500/15 text-green-600" 
                    : calculatedHealthScore >= 60 
                      ? "bg-amber-500/15 text-amber-600" 
                      : "bg-red-500/15 text-red-600"
                }`}>
                  {calculatedHealthScore >= 80 ? "Optimal Vigor" : calculatedHealthScore >= 60 ? "Moderate Stress" : "Critical Warning"}
                </span>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 pt-4 border-t border-[#2E7D32]/15">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-gray-500">
                  <span>Disease Outbreak</span>
                  <span className="text-red-500">{diseaseLevel}/10</span>
                </div>
                <input 
                  type="range" min="0" max="10" 
                  value={diseaseLevel} 
                  onChange={e => { setDiseaseLevel(Number(e.target.value)); handleCalculateHealth(); }}
                  className="w-full accent-red-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-gray-500">
                  <span>Weather Stress</span>
                  <span className="text-amber-500">{weatherLevel}/10</span>
                </div>
                <input 
                  type="range" min="0" max="10" 
                  value={weatherLevel} 
                  onChange={e => { setWeatherLevel(Number(e.target.value)); handleCalculateHealth(); }}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-gray-500">
                    <span>Soil Nutrition</span>
                    <span className="text-[#2E7D32]">{soilLevel}/10</span>
                  </div>
                  <input 
                    type="range" min="0" max="10" 
                    value={soilLevel} 
                    onChange={e => { setSoilLevel(Number(e.target.value)); handleCalculateHealth(); }}
                    className="w-full accent-[#2E7D32]"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-gray-500">
                    <span>Irrigation Level</span>
                    <span className="text-[#2E7D32]">{waterLevel}/10</span>
                  </div>
                  <input 
                    type="range" min="0" max="10" 
                    value={waterLevel} 
                    onChange={e => { setWaterLevel(Number(e.target.value)); handleCalculateHealth(); }}
                    className="w-full accent-[#2E7D32]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-gray-500">
                  <span>Pest Presence</span>
                  <span className="text-red-500">{pestLevel}/10</span>
                </div>
                <input 
                  type="range" min="0" max="10" 
                  value={pestLevel} 
                  onChange={e => { setPestLevel(Number(e.target.value)); handleCalculateHealth(); }}
                  className="w-full accent-red-400"
                />
              </div>
            </div>

            <div className="text-[11px] text-gray-500 bg-white/50 dark:bg-black/10 p-3.5 rounded-xl border border-black/5 dark:border-white/5 leading-relaxed">
              <strong>Engine Diagnosis:</strong> {calculatedHealthScore >= 80 
                ? "Your field displays highly robust cell structures. Maintain current watering schedules and skip insecticide cycles." 
                : calculatedHealthScore >= 60 
                  ? "Minor micro-stress indicated. Add organic fertilizer adjustments and apply safety watering blocks." 
                  : "Critical stress! Fungal spots or water retention deficiency has severely compromised plant metabolism. Trigger immediate pathology inspection."}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
