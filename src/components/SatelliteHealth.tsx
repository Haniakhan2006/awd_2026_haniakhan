import React, { useState, useEffect } from "react";
import { 
  Radar, 
  Sparkles, 
  ShieldAlert, 
  MapPin, 
  RotateCw,
  Award,
  CircleAlert
} from "lucide-react";

export default function SatelliteHealth() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetch("/api/satellite-health")
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">🛰 Satellite Remote Sensing (NDVI)</h1>
          <p className="text-xs md:text-sm text-[#556B58] dark:text-[#A4BCA7]">
            Evaluate leaf-canopy chlorophyll density and crop transpiration index using simulated NDVI telemetry.
          </p>
        </div>
        <button
          onClick={loadData}
          className="p-2 border border-black/5 rounded-xl hover:bg-[#2E7D32]/5 transition-colors"
          title="Reload Satellite Telemetry"
        >
          <RotateCw className="w-4 h-4 text-[#2E7D32]" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Grid NDVI Map Visualization (Module 11 SPECIFIC) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-500">Live Crop Vigor Map (Mock NDVI)</h3>
              <span className="text-[10px] bg-black/60 text-white font-mono px-2 py-0.5 rounded">BAND_8A_SATELLITE</span>
            </div>

            {loading ? (
              <div className="h-56 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E7D32]" />
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Simulated map sectors grid */}
                <div className="grid grid-cols-2 gap-4">
                  {data?.ndvi_sectors.map((sec: any) => (
                    <div 
                      key={sec.id}
                      className="p-4 bg-white/50 dark:bg-black/10 rounded-2xl border border-black/5 dark:border-white/5 space-y-3 relative overflow-hidden"
                    >
                      {/* Highlighting status with matching color tab */}
                      <div className="absolute top-0 left-0 h-full w-2" style={{ backgroundColor: sec.color }} />
                      
                      <div className="pl-2 space-y-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-xs">{sec.id}</h4>
                          <span className="text-[10px] font-mono font-black" style={{ color: sec.color }}>NDVI {sec.ndvi}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 block">{sec.area} • {sec.health}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Legend map indicators */}
                <div className="grid grid-cols-4 gap-2 text-center pt-4 border-t border-black/5 dark:border-white/5 text-[10px] font-bold">
                  <div className="flex items-center gap-1.5 justify-center"><span className="w-2.5 h-2.5 bg-[#2E7D32] rounded-full inline-block" /> Green (Vigor)</div>
                  <div className="flex items-center gap-1.5 justify-center"><span className="w-2.5 h-2.5 bg-[#4CAF50] rounded-full inline-block" /> Lime (Optimal)</div>
                  <div className="flex items-center gap-1.5 justify-center"><span className="w-2.5 h-2.5 bg-[#FFC107] rounded-full inline-block" /> Yellow (Stressed)</div>
                  <div className="flex items-center gap-1.5 justify-center"><span className="w-2.5 h-2.5 bg-[#F44336] rounded-full inline-block" /> Red (Waterlog)</div>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* Right Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 space-y-6 border border-[#2E7D32]/10 bg-gradient-to-br from-[#2E7D32]/5 to-transparent">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-500">Telemetry Summary</h3>

            {loading ? (
              <div className="h-44 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E7D32]" />
              </div>
            ) : data && (
              <div className="space-y-6">
                
                {/* Overall score circular display */}
                <div className="text-center py-2">
                  <div className="inline-flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 border-[#2E7D32]/25 bg-[#2E7D32]/5">
                    <span className="text-4xl font-black text-[#2E7D32] dark:text-[#4CAF50]">{data.farm_health_score}</span>
                    <span className="text-[9px] text-gray-400 uppercase font-black">Overall Score</span>
                  </div>
                </div>

                {/* Recommendation card */}
                <div className="p-4 bg-white dark:bg-[#122214] rounded-2xl border border-black/5 dark:border-white/5 space-y-1.5">
                  <span className="text-[9px] font-bold uppercase text-[#2E7D32] tracking-wider block">Agro-Analytic Advisory</span>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-semibold">
                    {data.recommendation}
                  </p>
                </div>

                <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400 leading-normal flex items-start gap-2">
                  <CircleAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Drought indicators localized in South-West sector. Soil moisture depletion rate has accelerated by 12% over past cycle. Consider executing a smart irrigation sequence.</span>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
