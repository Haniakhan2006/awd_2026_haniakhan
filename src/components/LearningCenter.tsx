import React, { useState } from "react";
import { 
  BookOpen, 
  PlayCircle, 
  FileText, 
  Compass, 
  Activity, 
  Award,
  Video,
  ArrowUpRight
} from "lucide-react";

export default function LearningCenter() {
  const [activeTab, setActiveTab] = useState("Schemes");

  const schemes = [
    { title: "Kisan Solar Pump Subsidy Scheme", body: "Offers 60% governmental financing support for installing modern drip-connected solar pumps to promote green precision watering.", agency: "Ministry of Agriculture", link: "Gov-Solar-Fin" },
    { title: "Certified Rust-Resistant Seed Subvention", body: "Provides a 25% direct cash discount on purchasing registered HD-2967 rust-resistant Wheat bags from official seed exchanges.", agency: "State Seed Corporation", link: "Seed-Sub" },
    { title: "Soil Lab Testing Reimbursement", body: "Farmers can claim 100% cost reimbursement for standard NPK and organic carbon lab checkups once every autumn crop transition.", agency: "Agronomic Advisory Panel", link: "Soil-Check" }
  ];

  const articles = [
    { title: "Optimizing Wheat Tillering with Splitted Urea", type: "Farming Manual", readTime: "5 min read", desc: "Why broadcasting Nitrogen in three separate growth-stage increments is far superior to single basal loads." },
    { title: "Managing Rice Blast without Triazole Chemicals", type: "Organic Guide", readTime: "8 min read", desc: "Applying fermented compost extract and silica husk ash to build physical leaf resistance against Magnaporthe spores." }
  ];

  const diseases = [
    { name: "Wheat Leaf Rust", host: "Wheat/Barley", vector: "Fungal Spores", control: "Triazole spray, resistant varieties" },
    { name: "Rice Blast", host: "Rice/Paddy", vector: "Fungal Vector", control: "Tricyclazole, silica amendments" },
    { name: "Early Blight", host: "Solanaceous/Potato", vector: "Alternaria Solani", control: "Chlorothalonil, prune lower foliage" }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Title */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">📚 Agricultural Learning Center</h1>
        <p className="text-xs md:text-sm text-[#556B58] dark:text-[#A4BCA7]">
          Explore local government schemes, read peer-reviewed agronomy articles, and review the plant pathology directory.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#2E7D32]/10 pb-2">
        {["Schemes", "Articles & Tutorials", "Disease Library"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-xs font-bold transition-all outline-none ${activeTab === t ? "text-[#2E7D32] border-b-2 border-[#2E7D32] dark:text-[#4CAF50] dark:border-[#4CAF50]" : "text-gray-400 hover:text-gray-600"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left main content depending on active tab */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === "Schemes" && (
            <div className="space-y-4">
              {schemes.map((sch, i) => (
                <div key={i} className="p-6 glass-card bg-white dark:bg-[#122214]/40 border border-black/5 dark:border-white/5 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[9px] font-bold text-[#2E7D32] dark:text-[#8BC34A] uppercase tracking-wider block">{sch.agency}</span>
                      <h4 className="font-bold text-sm md:text-base mt-0.5">{sch.title}</h4>
                    </div>
                    <span className="bg-[#2E7D32]/10 text-[#2E7D32] text-[10px] px-2 py-0.5 rounded-lg font-bold">Subsidized</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{sch.body}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Articles & Tutorials" && (
            <div className="space-y-6">
              
              {/* Videos Row (Module 15 SPECIFIC) */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Video Tutorials</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/50 dark:bg-black/10 border rounded-2xl space-y-3">
                    <div className="h-32 bg-gradient-to-br from-[#2E7D32]/10 to-[#8BC34A]/25 rounded-xl border flex items-center justify-center text-[#2E7D32] relative overflow-hidden">
                      <PlayCircle className="w-12 h-12 hover:scale-110 transition-transform cursor-pointer" />
                      <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-bold font-mono">14:15</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-xs">How to Diagnose Leaf Rust in Wheat Fields</h5>
                      <span className="text-[10px] text-gray-400 block mt-0.5">By Department of Plant Pathology • 12K Views</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white/50 dark:bg-black/10 border rounded-2xl space-y-3">
                    <div className="h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/25 rounded-xl border flex items-center justify-center text-blue-500 relative overflow-hidden">
                      <PlayCircle className="w-12 h-12 hover:scale-110 transition-transform cursor-pointer" />
                      <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-bold font-mono">08:42</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-xs">Installing Drip Irrigation for Subsoil Watering</h5>
                      <span className="text-[10px] text-gray-400 block mt-0.5">By Precision Agro Group • 4.5K Views</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Articles */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Research Publications</span>
                <div className="space-y-4">
                  {articles.map((art, i) => (
                    <div key={i} className="p-4 bg-white/50 dark:bg-[#122214]/30 border rounded-2xl flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-[#2E7D32] bg-[#2E7D32]/10 px-2 py-0.5 rounded-full inline-block">{art.type}</span>
                        <h4 className="font-bold text-sm">{art.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">{art.desc}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold whitespace-nowrap">{art.readTime}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeTab === "Disease Library" && (
            <div className="space-y-4">
              {diseases.map((dis, i) => (
                <div key={i} className="p-4 bg-white/50 dark:bg-[#122214]/35 border rounded-2xl flex justify-between items-center gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-[#2E7D32] dark:text-[#4CAF50]">{dis.name}</h4>
                    <span className="text-[10px] text-gray-500 block">Typical Host: {dis.host} • Pathology Vector: {dis.vector}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 block">Recommended Action</span>
                    <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">{dis.control}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right informative Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 border border-[#2E7D32]/10 bg-gradient-to-br from-[#2E7D32]/5 to-transparent space-y-4">
            <div className="w-10 h-10 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center font-bold">
              ?
            </div>
            <h4 className="font-display font-bold text-sm">Need Direct Agronomic Counsel?</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              If your crop's chlorosis pattern is not cataloged inside our library, trigger an active consultation session with our chatbot or consult regional agricultural advisory hubs via Nearby Maps.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
