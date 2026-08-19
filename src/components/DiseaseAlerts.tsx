import React, { useState } from "react";
import { 
  ShieldAlert, 
  MapPin, 
  Activity, 
  Plus, 
  Users, 
  AlertOctagon,
  Heart,
  MessageCircle,
  Clock,
  CheckCircle,
  FileText
} from "lucide-react";

export default function DiseaseAlerts() {
  const [alerts, setAlerts] = useState<any[]>([
    { id: "1", title: "Yellow Rust Spore Outbreak", crop: "Wheat", radius: "Within 5.0 km", severity: "Critical", count: "12 Farms sowed", date: "Today", tip: "Spray Tebuconazole foliar immediately; halt overhead sprinkler watering." },
    { id: "2", title: "Rice Blast Symptoms", crop: "Rice", radius: "Within 12.4 km", severity: "High", count: "4 Farms affected", date: "Yesterday", tip: "Dust fields with silica slag residues; check for spindle leaf lesions." },
    { id: "3", title: "Helicoverpa Bollworm larvae", crop: "Cotton", radius: "Within 18.1 km", severity: "Medium", count: "8 Farms reported", date: "3 Days ago", tip: "Set up pheromone traps (5 traps per acre); inspect growing whorl structures." }
  ]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Title */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">🚨 Local Disease Outbreak Alerts</h1>
        <p className="text-xs md:text-sm text-[#556B58] dark:text-[#A4BCA7]">
          Monitor localized pathogen outbreaks reported by nearby agricultural inspector logs and surrounding farms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Outbreak Listings */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-500 block pl-1">Active Outbreaks</h3>
          
          <div className="space-y-4">
            {alerts.map((al) => (
              <div 
                key={al.id}
                className="p-5 glass-card bg-white dark:bg-[#122214]/40 border border-black/5 dark:border-white/5 space-y-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0">
                      <AlertOctagon className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{al.title}</h4>
                      <span className="text-[10px] text-gray-500 block">Radius Range: {al.radius} • {al.count} • sowed {al.crop}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${al.severity === "Critical" ? "bg-red-500/15 text-red-600 animate-pulse" : "bg-amber-500/15 text-amber-600"}`}>
                    {al.severity}
                  </span>
                </div>

                <div className="p-3 bg-red-500/5 dark:bg-red-500/5 rounded-xl border border-red-500/10 text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  <strong>Pathologist Preventive Tip:</strong> {al.tip}
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold justify-end">
                  <Clock className="w-3.5 h-3.5" /> Reported: {al.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Disease alert safety protocols */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 space-y-6 border border-[#2E7D32]/10 bg-gradient-to-b from-[#2E7D32]/5 to-transparent">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-500">Outbreak Prevention Protocols</h3>

            <div className="space-y-4 text-xs leading-normal">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-bold">Establish Border Barriers</h4>
                  <p className="text-[11px] text-gray-500">Sow tall guard crops like sorghum or millet around wheat field borders to catch windborne fungal spores.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-bold">Sanitize Sowing Equipment</h4>
                  <p className="text-[11px] text-gray-500">Always rinse tractor wheels and handheld sickles with mild bleach solutions when moving between distinct fields.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-bold">Halt Overhead Wetting</h4>
                  <p className="text-[11px] text-gray-500">During spore outbreaks, discontinue all overhead sprinkler watering. Water on leaves serves as the primary activator for spore germination.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
