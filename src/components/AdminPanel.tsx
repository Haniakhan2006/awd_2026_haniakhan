import React, { useState } from "react";
import { 
  ShieldAlert, 
  Terminal, 
  Users, 
  Megaphone, 
  Activity, 
  Database,
  Search,
  CheckCircle,
  Clock,
  Heart
} from "lucide-react";

export default function AdminPanel() {
  const [announcement, setAnnouncement] = useState("");
  const [published, setPublished] = useState(false);

  const users = [
    { name: "Farmer User", role: "Farmer", email: "farmer@cropdoctor.com", status: "Active" },
    { name: "Agronomy Advisor", role: "Agronomy Expert", email: "advisor@cropdoctor.com", status: "Active" },
    { name: "Admin Inspector", role: "Super Administrator", email: "admin@cropdoctor.com", status: "Active" }
  ];

  const logs = [
    { timestamp: "12:04:15", event: "Express API: Triggered /api/disease-detection (Accuracy 94%)" },
    { timestamp: "11:59:30", event: "Firebase Auth: Registered new user farmer@cropdoctor.com successfully." },
    { timestamp: "11:55:00", event: "Satellite Sync: NDVI imagery band-8 telemetry cache refreshed." },
    { timestamp: "11:42:10", event: "Firestore Rules: Authenticated user query allowed on collection 'chats'." }
  ];

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement) return;
    setPublished(true);
    setTimeout(() => {
      setPublished(false);
      setAnnouncement("");
    }, 4000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Title */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">⚙️ AI Crop Doctor+ Supervisor Console</h1>
        <p className="text-xs md:text-sm text-red-500 font-bold uppercase tracking-widest">
          ADMINISTRATIVE BACKOFFICE SYSTEM
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Logs & Users */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Logs (Module 16 SPECIFIC) */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Terminal className="w-4.5 h-4.5 text-[#2E7D32]" /> System Telemetry Logs
              </h3>
              <span className="text-[10px] bg-red-500/10 text-red-500 font-bold px-2 py-0.5 rounded">DEBUG MODE</span>
            </div>

            <div className="bg-black/90 dark:bg-black/95 text-green-400 p-4 rounded-xl font-mono text-[11px] space-y-2.5 max-h-[180px] overflow-y-auto border border-white/5">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3 leading-relaxed">
                  <span className="text-gray-500">[{log.timestamp}]</span>
                  <span>{log.event}</span>
                </div>
              ))}
            </div>
          </div>

          {/* User database */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Users className="w-4.5 h-4.5 text-blue-500" /> User Security Directory
            </h3>

            <div className="space-y-3.5">
              {users.map((u, i) => (
                <div key={i} className="p-4 bg-white/50 dark:bg-[#122214]/40 border rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-xs md:text-sm">{u.name}</h4>
                    <span className="text-[10px] text-gray-500 block">{u.email}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-600 block">{u.role}</span>
                    <span className="text-[9px] text-[#2E7D32] block font-bold mt-1">● Active Link</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right: Announcements Publication (Module 16) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 space-y-6 border border-red-500/15 bg-gradient-to-br from-red-500/5 to-transparent">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Megaphone className="w-4.5 h-4.5 text-red-500" /> Regional Announcements
            </h3>

            <form onSubmit={handlePublish} className="space-y-4">
              <span className="text-[11px] text-gray-500 block">Publish emergency warnings or subsidy announcements instantly. This triggers system alerts.</span>
              
              <textarea
                placeholder="Type emergency alert (e.g. Yellow Rust outbreak detected near Sargodha sector. Schedule preventive Triazole sprays...)"
                value={announcement}
                onChange={e => setAnnouncement(e.target.value)}
                className="w-full bg-white/40 dark:bg-[#0A140B]/40 border border-black/10 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-red-500 outline-none resize-none font-medium"
                rows={4}
                required
              />

              <button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-xs shadow"
              >
                Broadcast Alarm Alert
              </button>
            </form>

            {published && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-[11px] text-green-700 font-bold text-center">
                Alarm Broadcast successfully sent to all certified farmers!
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
