import React, { useState, useEffect } from "react";
import { 
  CloudSun, 
  Wind, 
  Droplets, 
  CloudRain, 
  AlertTriangle, 
  CheckCircle, 
  Droplet, 
  Calculator,
  Compass,
  ArrowUpRight
} from "lucide-react";

export default function WeatherAdvisor() {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Irrigation Calculator State
  const [cropType, setCropType] = useState("Wheat");
  const [soilType, setSoilType] = useState("Clay Loam");
  const [cropAge, setCropAge] = useState("Tillering (20-40 Days)");
  const [irrigationResult, setIrrigationResult] = useState<any>(null);

  useEffect(() => {
    // Fetch advisory from server API
    fetch("/api/weather-info")
      .then(res => res.json())
      .then(data => {
        setWeatherData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading weather advisory:", err);
        setLoading(false);
      });
  }, []);

  const calculateIrrigation = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Custom smart agricultural algorithm (Module 12)
    let waterLiters = 0;
    let timing = "Early morning (before 08:00 AM)";
    let savingsTip = "";

    if (cropType === "Wheat") {
      waterLiters = soilType === "Sandy Soil" ? 450 : 350;
      savingsTip = "Wheat demands consistent dampness at jointing stage. Implement flat-bed furrow locks to avoid deep percolation waste.";
    } else if (cropType === "Rice") {
      waterLiters = soilType === "Sandy Soil" ? 1200 : 900;
      timing = "Maintain a continuous 5cm shallow standing depth.";
      savingsTip = "Utilize Alternate Wetting and Drying (AWD) cycles to reduce methane emissions and save up to 30% of baseline water volume.";
    } else {
      waterLiters = soilType === "Sandy Soil" ? 600 : 450;
      savingsTip = "Mulch plant rows with straw residues to cut down surface-water evaporation by up to 25%.";
    }

    setIrrigationResult({
      amount: `${waterLiters} Cubic Liters / Acre`,
      schedule: timing,
      tips: [
        savingsTip,
        "Water loss is highest during hot afternoons. Restrict watering to cool diurnal windows.",
        "Check soil depth: if the top 2 inches feel dry, trigger the cycle."
      ]
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Title */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">🌤 Precision Weather & Smart Irrigation</h1>
        <p className="text-xs md:text-sm text-[#556B58] dark:text-[#A4BCA7]">
          Integrate dynamic atmospheric models and calculate volumetric irrigation schedules for crop conservation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Module 4: Weather & Spray Advisory */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-card p-6 space-y-6">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-500">Atmospheric Outlook</h3>

            {loading ? (
              <div className="h-44 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E7D32]" />
              </div>
            ) : weatherData ? (
              <div className="space-y-6">
                
                {/* Weather primary row */}
                <div className="flex justify-between items-center bg-[#2E7D32]/5 p-4 rounded-2xl border border-[#2E7D32]/10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-[#0A140B] rounded-xl text-[#2E7D32] shadow-sm">
                      <CloudSun className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="font-bold text-2xl text-[#2E7D32] dark:text-[#4CAF50]">{weatherData.currentTemp}°C</span>
                      <span className="text-xs text-gray-500 block font-semibold">{weatherData.conditions}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 font-bold block">
                      District Forecast
                    </span>
                  </div>
                </div>

                {/* Sub indices */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 space-y-1">
                    <Droplets className="w-5 h-5 mx-auto text-blue-500" />
                    <span className="text-[10px] text-gray-500 block">Humidity</span>
                    <span className="font-bold text-sm">{weatherData.humidity}%</span>
                  </div>
                  <div className="p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 space-y-1">
                    <Wind className="w-5 h-5 mx-auto text-emerald-500" />
                    <span className="text-[10px] text-gray-500 block">Wind Velocity</span>
                    <span className="font-bold text-sm">{weatherData.windSpeed} km/h</span>
                  </div>
                  <div className="p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 space-y-1">
                    <CloudRain className="w-5 h-5 mx-auto text-cyan-500" />
                    <span className="text-[10px] text-gray-500 block">Rain Prob.</span>
                    <span className="font-bold text-sm">{weatherData.rainProbability}%</span>
                  </div>
                </div>

                {/* Pesticide Spraying Recommendation (Module 4 SPECIFIC) */}
                <div className={`p-4 rounded-2xl border ${weatherData.sprayingRecommendation.safe ? "bg-green-500/10 border-green-500/20 text-green-700" : "bg-red-500/10 border-red-500/20 text-red-700"}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h4 className="font-bold text-xs">Pesticide Spray Advisory: SAFE WINDOW</h4>
                  </div>
                  <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-300">
                    {weatherData.sprayingRecommendation.reason}
                  </p>
                  <span className="text-[10px] font-bold text-green-600 dark:text-green-400 block mt-2">
                    Best Application Hours: {weatherData.sprayingRecommendation.bestHours}
                  </span>
                </div>

                {/* Frost/Heat Alerts */}
                {weatherData.alerts.map((al: any, idx: number) => (
                  <div key={idx} className="flex gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400">{al.type}</h4>
                      <p className="text-[10px] text-gray-600 dark:text-gray-300 leading-normal">{al.message}</p>
                    </div>
                  </div>
                ))}

              </div>
            ) : (
              <p className="text-xs text-gray-500">Failed to load meteorological info.</p>
            )}

          </div>
        </div>

        {/* Module 12: Smart Irrigation Calculator */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-card p-6 space-y-6">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-500">Smart Water Calculator</h3>

            <form onSubmit={calculateIrrigation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500">Crop Type</label>
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="w-full bg-white/40 dark:bg-[#0A140B]/40 border border-[#2E7D32]/10 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#2E7D32] outline-none"
                  >
                    <option value="Wheat">Wheat</option>
                    <option value="Rice">Rice</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Maize">Maize/Corn</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500">Soil Quality</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full bg-white/40 dark:bg-[#0A140B]/40 border border-[#2E7D32]/10 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#2E7D32] outline-none"
                  >
                    <option value="Clay Loam">Clay Loam (Moderate Retention)</option>
                    <option value="Sandy Soil">Sandy Soil (Low Retention)</option>
                    <option value="Silt Clay">Silt Clay (High Retention)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">Crop Growth Stage</label>
                <select
                  value={cropAge}
                  onChange={(e) => setCropAge(e.target.value)}
                  className="w-full bg-white/40 dark:bg-[#0A140B]/40 border border-[#2E7D32]/10 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#2E7D32] outline-none"
                >
                  <option value="Sowing">Sowing (0-15 Days)</option>
                  <option value="Tillering (20-40 Days)">Tillering (20-40 Days)</option>
                  <option value="Jointing / Heading">Jointing / Heading (45-75 Days)</option>
                  <option value="Grain Filling">Grain Filling (80-110 Days)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#2E7D32] hover:bg-[#235F26] text-white rounded-xl py-3 text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Calculator className="w-4.5 h-4.5" /> Analyze Moisture Requirements
              </button>
            </form>

            {/* Results block */}
            {irrigationResult && (
              <div className="bg-[#2E7D32]/5 p-4 rounded-2xl border border-[#2E7D32]/10 space-y-3">
                <div className="flex justify-between items-center pb-2.5 border-b border-[#2E7D32]/10">
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-bold">Recommended Quantity</span>
                    <span className="font-extrabold text-[#2E7D32] text-sm">{irrigationResult.amount}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 block uppercase font-bold">Timing Window</span>
                    <span className="font-bold text-gray-700 dark:text-gray-200 text-xs">{irrigationResult.schedule}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#2E7D32] block uppercase tracking-widest">Savings Guidelines</span>
                  <ul className="space-y-1.5">
                    {irrigationResult.tips.map((tip: string, i: number) => (
                      <li key={i} className="text-[11px] text-gray-500 leading-relaxed flex items-start gap-1.5">
                        <Droplet className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0 mt-0.5" /> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
