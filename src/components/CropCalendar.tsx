import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  Clock, 
  Sprout, 
  Droplet, 
  FileText,
  BookmarkCheck,
  Workflow
} from "lucide-react";
import { CalendarTask } from "../types";
import { db, safeAddDoc } from "../lib/firebase";
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc } from "firebase/firestore";

interface CropCalendarProps {
  userId: string;
}

export default function CropCalendar({ userId }: CropCalendarProps) {
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [cropName, setCropName] = useState("Wheat");
  const [taskType, setTaskType] = useState<"Sowing" | "Fertilizer" | "Irrigation" | "Harvest">("Sowing");
  const [taskName, setTaskName] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  // Module 5 State: Fertilizer NPK advisor
  const [advCrop, setAdvCrop] = useState("Wheat");
  const [advStage, setAdvStage] = useState("Tillering");

  // NPK recommendation index
  const npkDatabase: Record<string, Record<string, { npk: string, organic: string, schedule: string }>> = {
    Wheat: {
      Sowing: { npk: "DAP (50 kg) + Urea (25 kg) per acre", organic: "Well-rotted farmyard manure (6 tons)", schedule: "Apply basal dose during final soil rotavation before seed placement." },
      Tillering: { npk: "Urea (50 kg) per acre during first water", organic: "Neem cake or vermicompost foliar", schedule: "Spread broadcast style 21-25 days after seed germination." },
      Heading: { npk: "Soluble Potash (MOP) 15 kg per acre", organic: "Compost tea foliar spraying", schedule: "Spray during early flower initiation stage (75-80 days)." }
    },
    Rice: {
      Sowing: { npk: "Single Super Phosphate (SSP) 75 kg + Zinc Sulphate", organic: "Sesbania green manure incorporation", schedule: "Incorporate into nursery soil 15 days before transplantation." },
      Tillering: { npk: "Urea (40 kg) + Ammonium Sulphate (20 kg)", organic: "Azolla fern multiplication in standing water", schedule: "Distribute split doses 20 and 40 days after transplanting." }
    }
  };

  useEffect(() => {
    // Load existing items
    const saved = localStorage.getItem(`crop-calendar-${userId}`);
    if (saved) {
      setTasks(JSON.parse(saved));
    } else {
      const defaults: CalendarTask[] = [
        { userId, cropName: "Wheat", taskType: "Sowing", taskName: "Primary Seed Placement", date: "2026-11-05", completed: true, notes: "Use certified HD-2967 rust-resistant seeds." },
        { userId, cropName: "Wheat", taskType: "Fertilizer", taskName: "First Urea Broadcast", date: "2026-11-26", completed: false, notes: "Water field first, then apply urea immediately." },
        { userId, cropName: "Wheat", taskType: "Irrigation", taskName: "Tillering Water cycle", date: "2026-11-25", completed: false, notes: "Volumetric depth 3 inches." }
      ];
      setTasks(defaults);
      localStorage.setItem(`crop-calendar-${userId}`, JSON.stringify(defaults));
    }
  }, [userId]);

  const saveTasks = (newTasks: CalendarTask[]) => {
    setTasks(newTasks);
    localStorage.setItem(`crop-calendar-${userId}`, JSON.stringify(newTasks));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName || !date) return;

    const newTask: CalendarTask = {
      userId,
      cropName,
      taskType,
      taskName,
      date,
      completed: false,
      notes
    };

    const updated = [...tasks, newTask];
    saveTasks(updated);

    // Sync to Firestore
    safeAddDoc("calendar", newTask);

    setTaskName("");
    setNotes("");
  };

  const toggleTask = (index: number) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    saveTasks(updated);
  };

  const handleDelete = (index: number) => {
    const updated = tasks.filter((_, idx) => idx !== index);
    saveTasks(updated);
  };

  const currentNpk = npkDatabase[advCrop]?.[advStage] || {
    npk: "Balanced NPK (20:20:20) 2.5g / Liter",
    organic: "Compost extract formulation spray",
    schedule: "Trigger spraying at the first sign of nutrient pale yellow veins."
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Title */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">📅 Agricultural Calendar & Nutrient Advisor</h1>
        <p className="text-xs md:text-sm text-[#556B58] dark:text-[#A4BCA7]">
          Schedule farming operations and review fertilizer (NPK) ratios mapped out by crop stage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Module 13: Crop Calendar View */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 space-y-6">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#2E7D32]" /> Task Scheduler List
            </h3>

            {/* Calendar list */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {tasks.length > 0 ? (
                tasks.map((task, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl border flex justify-between items-start gap-4 transition-all ${
                      task.completed 
                        ? "bg-green-500/5 border-green-500/10 opacity-70" 
                        : "bg-white dark:bg-[#122214]/30 border-black/5 dark:border-white/5"
                    }`}
                  >
                    <div className="flex gap-3">
                      <button 
                        onClick={() => toggleTask(idx)}
                        className={`p-1 rounded-full border transition-colors mt-0.5 ${task.completed ? "bg-[#2E7D32] text-white border-[#2E7D32]" : "border-gray-300"}`}
                      >
                        <CheckCircle2 className="w-4.5 h-4.5" />
                      </button>
                      <div>
                        <h4 className={`text-xs font-bold ${task.completed ? "line-through text-gray-400" : ""}`}>{task.taskName}</h4>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{task.cropName} • {task.taskType} • {task.date}</span>
                        {task.notes && <p className="text-[11px] text-gray-500 mt-1 leading-normal">{task.notes}</p>}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDelete(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/5 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-6">No scheduled operations found.</p>
              )}
            </div>

            {/* Quick Task Add Form */}
            <form onSubmit={handleAddTask} className="pt-4 border-t border-[#2E7D32]/10 space-y-3.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Add Custom Sowing / Irrigation Step</span>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Crop</span>
                  <input 
                    type="text" 
                    value={cropName} 
                    onChange={e => setCropName(e.target.value)} 
                    placeholder="e.g. Wheat"
                    className="w-full bg-white/40 dark:bg-[#0A140B]/40 border border-black/10 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#2E7D32] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Task Type</span>
                  <select 
                    value={taskType} 
                    onChange={e => setTaskType(e.target.value as any)}
                    className="w-full bg-white/40 dark:bg-[#0A140B]/40 border border-black/10 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#2E7D32] outline-none"
                  >
                    <option value="Sowing">Sowing</option>
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Irrigation">Irrigation</option>
                    <option value="Harvest">Harvest</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Activity Name</span>
                  <input 
                    type="text" 
                    value={taskName} 
                    onChange={e => setTaskName(e.target.value)} 
                    placeholder="e.g. Broadcast Nitrogen"
                    className="w-full bg-white/40 dark:bg-[#0A140B]/40 border border-black/10 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#2E7D32] outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Scheduled Date</span>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                    className="w-full bg-white/40 dark:bg-[#0A140B]/40 border border-black/10 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#2E7D32] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Internal Notes</span>
                <input 
                  type="text" 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  placeholder="e.g. Spray early morning before humidity levels fall."
                  className="w-full bg-white/40 dark:bg-[#0A140B]/40 border border-black/10 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#2E7D32] outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#2E7D32] text-white font-bold py-2.5 rounded-xl text-xs transition-transform hover:scale-[1.01]"
              >
                Schedule Event
              </button>
            </form>
          </div>
        </div>

        {/* Module 5: Fertilizer Advisor Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 space-y-6 border border-[#8BC34A]/20 bg-gradient-to-br from-[#8BC34A]/5 to-transparent">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-[#8BC34A]" /> Fertilizer (NPK) Advisor
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">Crop Variant</label>
                <select
                  value={advCrop}
                  onChange={e => setAdvCrop(e.target.value)}
                  className="w-full bg-white/40 dark:bg-[#0A140B]/40 border border-[#8BC34A]/10 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-[#8BC34A] outline-none"
                >
                  <option value="Wheat">Wheat (گندم)</option>
                  <option value="Rice">Rice (چاول)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">Growth Phase</label>
                <select
                  value={advStage}
                  onChange={e => setAdvStage(e.target.value)}
                  className="w-full bg-white/40 dark:bg-[#0A140B]/40 border border-[#8BC34A]/10 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-[#8BC34A] outline-none"
                >
                  <option value="Sowing">Sowing Phase (ابتدائی بوائی)</option>
                  <option value="Tillering">Tillering Phase (شاخیں نکلنا)</option>
                  <option value="Heading">Heading / Flowering (پھول بننا)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-[#8BC34A]/15 space-y-4">
                <div className="p-3.5 bg-white dark:bg-[#0A140B] rounded-2xl border border-[#8BC34A]/10 shadow-sm space-y-2">
                  <span className="text-[10px] font-bold text-[#2E7D32] dark:text-[#8BC34A] uppercase block">Recommended Chemical NPK Ratio</span>
                  <span className="font-extrabold text-xs text-gray-700 dark:text-gray-200 block">{currentNpk.npk}</span>
                </div>

                <div className="p-3.5 bg-white dark:bg-[#0A140B] rounded-2xl border border-[#8BC34A]/10 shadow-sm space-y-2">
                  <span className="text-[10px] font-bold text-emerald-600 block uppercase">Organic Alternative Treatment</span>
                  <span className="font-semibold text-xs text-gray-700 dark:text-gray-200 block">{currentNpk.organic}</span>
                </div>

                <div className="text-[11px] text-gray-500 leading-relaxed bg-[#8BC34A]/10 p-3 rounded-xl border border-dashed border-[#8BC34A]/20">
                  <strong>Application Schedule:</strong> {currentNpk.schedule}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
