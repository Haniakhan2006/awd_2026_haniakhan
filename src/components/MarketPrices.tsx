import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  MapPin, 
  Phone, 
  Search,
  CheckCircle,
  Clock,
  Briefcase
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";

export default function MarketPrices() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/market-prices")
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading market prices:", err);
        setLoading(false);
      });
  }, []);

  const filteredPrices = data
    ? data.prices.filter((p: any) => p.crop.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Title */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">📈 Agricultural Grain Exchange Prices</h1>
        <p className="text-xs md:text-sm text-[#556B58] dark:text-[#A4BCA7]">
          Access current wholesale grain market rates, trace nearest wholesale depots, and view 6-month historical line indexes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Prices listing & search */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 space-y-6">
            
            {/* Search */}
            <div className="flex gap-2 bg-white/50 dark:bg-black/10 border border-[#2E7D32]/10 rounded-xl px-3 py-2 text-xs">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search grain species (e.g. Wheat)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none w-full font-medium"
              />
            </div>

            {loading ? (
              <div className="h-44 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E7D32]" />
              </div>
            ) : (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                {filteredPrices.map((pr: any) => (
                  <div key={pr.id} className="p-4 bg-white/50 dark:bg-[#122214]/35 rounded-xl border border-black/5 dark:border-white/5 flex justify-between items-center gap-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs md:text-sm">{pr.crop}</h4>
                      <span className="text-[10px] text-gray-500 block">{pr.market}</span>
                      <span className="text-[10px] text-[#2E7D32] dark:text-[#8BC34A] font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Best Sell: {pr.bestSellingTime}
                      </span>
                    </div>

                    <div className="text-right space-y-1 flex-shrink-0">
                      <span className="font-extrabold text-xs md:text-sm text-gray-800 dark:text-gray-100 block">{pr.currentPrice}</span>
                      <div className="flex items-center gap-1 justify-end">
                        {pr.trend === "up" ? (
                          <span className="text-[10px] font-bold text-green-600 flex items-center gap-0.5 bg-green-500/10 px-1.5 py-0.5 rounded">
                            <TrendingUp className="w-3 h-3" /> Upward Index
                          </span>
                        ) : pr.trend === "down" ? (
                          <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 bg-red-500/10 px-1.5 py-0.5 rounded">
                            <TrendingDown className="w-3 h-3" /> Falling Index
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-500/10 px-1.5 py-0.5 rounded">
                            Stable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Right column: recharts Index Chart & local depots */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 space-y-6">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-500">Commodity Trend Analysis</h3>

            {loading ? (
              <div className="h-44 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E7D32]" />
              </div>
            ) : data && (
              <div className="space-y-6">
                
                {/* Recharts chart */}
                <div className="h-56 bg-white dark:bg-black/10 rounded-2xl p-2 border border-black/5 dark:border-white/5">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.graphData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip contentStyle={{ fontSize: 10 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="Wheat" stroke="#2E7D32" strokeWidth={2.5} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="Corn" stroke="#8BC34A" strokeWidth={1.5} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Nearby Trading Depots */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Nearest Purchasing Depots</span>
                  <div className="space-y-2">
                    {data.markets.map((m: any, idx: number) => (
                      <div key={idx} className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 flex justify-between items-center">
                        <div>
                          <h5 className="font-bold text-xs">{m.name}</h5>
                          <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5" /> {m.distance} away
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500 flex items-center gap-1 bg-white dark:bg-transparent border px-2 py-1 rounded-lg">
                          <Phone className="w-3.5 h-3.5" /> {m.contact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
