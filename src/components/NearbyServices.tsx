import React, { useState } from "react";
import { 
  MapPin, 
  Compass, 
  Phone, 
  Map, 
  Search, 
  Navigation, 
  Sprout, 
  CheckCircle, 
  Star,
  Info
} from "lucide-react";

export default function NearbyServices() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showDirections, setShowDirections] = useState(false);

  const categories = ["All", "Soil Labs", "Seed Banks", "Agri Officers", "Pesticide Shops"];

  const services = [
    { id: "1", name: "Greenfield Soil Analysis Labs", category: "Soil Labs", distance: "3.4 km", rating: 4.8, phone: "+92 300 9876543", address: "Grains Exchange Road, Sec 4", notes: "State-certified lab specializing in organic carbon, Nitrogen, and pH soil testing." },
    { id: "2", name: "National Certified Seed Bank", category: "Seed Banks", distance: "4.1 km", rating: 4.9, phone: "+92 321 4567890", address: "Main Bazaar, Opp. Agri Bank", notes: "Distributor of official Rust-resistant Wheat seeds (HD-2967, PBW-343)." },
    { id: "3", name: "Regional Agri Advisory Officer", category: "Agri Officers", distance: "5.8 km", rating: 4.7, phone: "+92 344 1122334", address: "Government Advisory Hub, Sector B", notes: "Advises on regional blight outbreaks and subsidized fertilizer allocations." },
    { id: "4", name: "Pak Agro Chemicals & Pesticides", category: "Pesticide Shops", distance: "2.1 km", rating: 4.5, phone: "+92 312 8887776", address: "Link Road Bypass", notes: "Authorized dealer of eco-friendly neem cakes, biological copper solutions, and Triazole sprays." },
    { id: "5", name: "Apex Agro Fertilizers", category: "Pesticide Shops", distance: "6.5 km", rating: 4.6, phone: "+92 301 5554443", address: "State Highway 11", notes: "Bulk stocks of Urea, Diammonium Phosphate (DAP), and micro-nutrients." }
  ];

  const filteredServices = activeCategory === "All"
    ? services
    : services.filter(s => s.category === activeCategory);

  const triggerDirections = (service: any) => {
    setSelectedService(service);
    setShowDirections(true);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Title */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">🗺 Nearby Support Services & Maps</h1>
        <p className="text-xs md:text-sm text-[#556B58] dark:text-[#A4BCA7]">
          Connect directly with certified seed banks, government agriculture experts, and soil diagnostics lab centers near your location.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Directory & Categories */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 space-y-6">
            
            {/* Category selection scroll bar */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => { setActiveCategory(cat); setShowDirections(false); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap outline-none ${activeCategory === cat ? "bg-[#2E7D32] text-white" : "bg-black/5 dark:bg-white/5 hover:bg-[#2E7D32]/10"}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {filteredServices.map((srv) => (
                <div 
                  key={srv.id}
                  onClick={() => triggerDirections(srv)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedService?.id === srv.id ? "bg-[#2E7D32]/5 border-[#2E7D32]/30" : "bg-white dark:bg-[#122214]/30 border-black/5 dark:border-white/5"}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold uppercase text-[#2E7D32] dark:text-[#8BC34A]">{srv.category}</span>
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {srv.rating}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs md:text-sm mt-1">{srv.name}</h3>
                  <span className="text-[11px] text-gray-500 block mt-0.5">{srv.address} • {srv.distance}</span>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-black/5 dark:border-white/5">
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {srv.phone}
                    </span>
                    <span className="text-[10px] font-bold text-[#2E7D32] flex items-center gap-0.5 ml-auto">
                      <Navigation className="w-3 h-3" /> Get Route Directions
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Right Column: Google Maps & Directions Panel (Module 7 SPECIFIC) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 space-y-6 relative overflow-hidden min-h-[450px] flex flex-col justify-between">
            
            {/* Live Interactive Map Mockup */}
            <div className="relative flex-1 bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] dark:from-[#0F2211] dark:to-[#173019] rounded-2xl border border-[#2E7D32]/10 overflow-hidden min-h-[250px] flex items-center justify-center">
              
              {/* Grid backdrop */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
              
              {/* Dynamic Path drawing */}
              {showDirections && selectedService ? (
                <div className="relative z-10 w-full h-full p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="bg-black/60 text-white font-mono text-[9px] px-2 py-0.5 rounded uppercase">ROUTE_CALCULATOR_ACTIVE</span>
                    <span className="bg-[#2E7D32] text-white text-[10px] px-2.5 py-1 rounded-xl font-bold">Directions Loaded</span>
                  </div>

                  {/* Draw Map markers */}
                  <div className="relative flex-1 flex items-center justify-center">
                    
                    {/* Source marker */}
                    <div className="absolute left-[20%] top-[40%] flex flex-col items-center">
                      <div className="p-2 bg-[#2E7D32] text-white rounded-full animate-pulse shadow-md">
                        <Sprout className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold bg-white text-[#2E7D32] px-1.5 py-0.5 rounded shadow mt-1">Your Farm</span>
                    </div>

                    {/* Path line vector simulation */}
                    <svg className="w-full h-full absolute inset-0">
                      <path 
                        d="M 120 120 Q 200 60, 240 100 T 320 140" 
                        fill="transparent" 
                        stroke="#2E7D32" 
                        strokeWidth="3" 
                        strokeDasharray="5,5" 
                        className="animate-[dash_2s_linear_infinite]"
                      />
                    </svg>

                    {/* Destination marker */}
                    <div className="absolute right-[20%] bottom-[30%] flex flex-col items-center">
                      <div className="p-2 bg-red-500 text-white rounded-full animate-bounce shadow-md">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold bg-white text-red-500 px-1.5 py-0.5 rounded shadow mt-1">{selectedService.name}</span>
                    </div>

                  </div>

                  <div className="bg-white/90 dark:bg-[#0A140B]/90 p-3.5 rounded-xl border border-[#2E7D32]/10 shadow-md">
                    <h5 className="text-[11px] font-bold uppercase text-[#2E7D32]">Directions to Destination</h5>
                    <p className="text-[10px] text-gray-500 leading-relaxed mt-0.5">
                      Depart farm gate. Proceed south-west along Link Bypass toward {selectedService.address}. Arrival in approximately 8 minutes ({selectedService.distance}).
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 space-y-2 relative z-10">
                  <Compass className="w-12 h-12 text-[#2E7D32] mx-auto animate-spin" style={{ animationDuration: '6s' }} />
                  <h4 className="font-bold text-xs text-gray-600">Select a Service Depot</h4>
                  <p className="text-[10px] text-gray-400 max-w-xs mx-auto">
                    Choose any support office or pesticide retailer on the left to map real-time route directions from your coordinates.
                  </p>
                </div>
              )}
            </div>

            {/* Service details */}
            {selectedService && (
              <div className="mt-4 p-4 bg-[#2E7D32]/5 rounded-2xl border border-[#2E7D32]/10 space-y-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#2E7D32] block">Support Profile Details</span>
                <h4 className="font-bold text-xs text-gray-800 dark:text-gray-100">{selectedService.name}</h4>
                <p className="text-[11px] text-gray-500 leading-normal">{selectedService.notes}</p>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
