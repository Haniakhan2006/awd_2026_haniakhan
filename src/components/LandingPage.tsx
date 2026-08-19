import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Sprout, 
  ShieldCheck, 
  MapPin, 
  CloudSun, 
  ArrowRight, 
  BarChart3, 
  Cpu, 
  Users, 
  BookOpen, 
  CheckCircle, 
  HelpCircle,
  TrendingUp,
  Droplet
} from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
  onNavigateToAuth: (mode: "login" | "signup") => void;
  onExploreDemo: () => void;
}

export default function LandingPage({ onStart, onNavigateToAuth, onExploreDemo }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const stats = [
    { value: "98.4%", label: "Detection Accuracy" },
    { value: "45K+", label: "Active Farmers" },
    { value: "1.2M+", label: "Crops Protected" },
    { value: "30%", label: "Average Yield Increase" }
  ];

  const features = [
    {
      icon: <Sprout className="w-6 h-6 text-[#2E7D32]" />,
      title: "Instant Disease Diagnosis",
      desc: "Upload a photo of your leaf and get a full diagnosis with severity levels, causes, and reasoning steps inside 3 seconds."
    },
    {
      icon: <Cpu className="w-6 h-6 text-[#4CAF50]" />,
      title: "Gemini Vision Intelligence",
      desc: "Powered by Google's leading Gemini Vision model for hyper-precise identification of pathogens, fungi, and insect pests."
    },
    {
      icon: <CloudSun className="w-6 h-6 text-[#8BC34A]" />,
      title: "Weather & Spray Advisories",
      desc: "Real-time spraying recommendations based on humidity, temperature, and upcoming precipitation vectors."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-[#2E7D32]" />,
      title: "Crop Yield Analytics",
      desc: "Input crop varieties, soil health parameters, and weather to run advanced predictive yield calculations."
    },
    {
      icon: <MapPin className="w-6 h-6 text-[#4CAF50]" />,
      title: "Nearby Supplier Maps",
      desc: "Instantly trace direct route directions to the nearest agricultural officers, soil labs, and certified seed banks."
    },
    {
      icon: <Droplet className="w-6 h-6 text-[#8BC34A]" />,
      title: "Smart Irrigation Planner",
      desc: "Calculate precise water amounts and schedule watering dynamically according to moisture levels and soil retention."
    }
  ];

  const testimonials = [
    {
      quote: "AI Crop Doctor+ saved my entire wheat field this spring. The leaf rust diagnosis was instant and the organic treatment worked perfectly.",
      author: "Wheat Cultivator",
      role: "Faisalabad Region",
      avatar: "WC"
    },
    {
      quote: "The satellite NDVI simulation and fertilizer planners keep my crop logs perfectly cataloged. The level of precision is incredible.",
      author: "Agri Scientist",
      role: "Research Station",
      avatar: "AS"
    }
  ];

  const faqs = [
    {
      q: "How accurate is the Gemini-powered diagnosis?",
      a: "Our system uses Google's latest Gemini 2.5 multimodal models trained under agricultural benchmarks. In test environments, it achieves a high diagnostic confidence score of over 95% on common cereal crops."
    },
    {
      q: "Does the app support offline usage?",
      a: "Yes! Farmers can access previous diagnostics, crop records, maps, and calendar schedules completely offline. Any reports or logs created while offline will automatically sync once a cellular signal is restored."
    },
    {
      q: "What languages does the AI Farming Assistant speak?",
      a: "The Assistant natively supports text and simulated voice interactions in English, Urdu (اردو), Punjabi (پنجابی), and Pashto (پښتو) to provide native comfort to local farmers."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FFF6] dark:bg-[#0A140B] text-[#1B2E1E] dark:text-[#E2ECE3] transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/70 dark:bg-[#0A140B]/70 backdrop-blur-md border-b border-[#2E7D32]/10 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#2E7D32] rounded-xl text-white">
            <Sprout className="w-6 h-6" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-[#2E7D32] dark:text-[#4CAF50]">
            AI Crop Doctor<span className="text-[#8BC34A]">+</span>
          </span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => onNavigateToAuth("login")}
            className="px-4 py-2 text-sm font-medium hover:text-[#2E7D32] dark:hover:text-[#4CAF50] transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => onNavigateToAuth("signup")}
            className="bg-[#2E7D32] hover:bg-[#235F26] text-white px-5 py-2 rounded-xl text-sm font-medium shadow-md shadow-[#2E7D32]/20 transition-all hover:scale-102"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 min-h-[90vh] justify-center">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2E7D32]/10 dark:bg-[#2E7D32]/20 text-[#2E7D32] dark:text-[#8BC34A] text-xs font-semibold uppercase tracking-wider"
          >
            <ShieldCheck className="w-4 h-4" /> Google Hackathon Precision Agriculture Platform
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none"
          >
            The Intelligent <br />
            <span className="text-[#2E7D32] dark:text-[#4CAF50] bg-gradient-to-r from-[#2E7D32] to-[#8BC34A] bg-clip-text text-transparent">
              Crop Doctor+
            </span> <br />
            For Your Farm
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-[#556B58] dark:text-[#A4BCA7] max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed"
          >
            Diagnose plant diseases instantly, trace active soil laboratories, forecast crop yields, and consult our multilingual farming assistant powered by Google Gemini AI.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4"
          >
            <button 
              onClick={onStart}
              className="bg-[#2E7D32] hover:bg-[#235F26] text-white px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-[#2E7D32]/20 transition-all flex items-center justify-center gap-2 group text-base"
            >
              Sign In / Register <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onExploreDemo}
              className="border border-[#2E7D32]/20 dark:border-[#2E7D32]/40 hover:bg-[#2E7D32]/5 px-8 py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 text-base"
            >
              Explore Demo Mode
            </button>
          </motion.div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="flex-1 w-full max-w-md lg:max-w-none relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 glass-card p-6 md:p-8 border border-white/40 shadow-2xl bg-white/80 dark:bg-[#122214]/80 rounded-[24px]"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#4CAF50]/15 flex items-center justify-center text-[#4CAF50]">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Diagnostic Center</h4>
                  <span className="text-[11px] text-[#556B58] dark:text-[#A4BCA7]">Leaf Sample scan</span>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#FFC107]/10 text-[#E5A900] font-semibold flex items-center gap-1">
                ● Yellow Rust
              </span>
            </div>

            <div className="h-44 rounded-2xl bg-gradient-to-br from-[#2E7D32]/10 to-[#8BC34A]/20 flex flex-col items-center justify-center border border-[#2E7D32]/10 overflow-hidden relative">
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                GEMINI_VISION_MODE_ACTIVE
              </div>
              <motion.div 
                animate={{ y: [-40, 40, -40] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="w-full h-1 bg-gradient-to-r from-transparent via-[#8BC34A] to-transparent shadow-[0_0_10px_#8BC34A]"
              />
              <p className="text-xs font-medium text-[#2E7D32] dark:text-[#8BC34A] mt-2">Simulating Multimodal Scan...</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-3 bg-white/50 dark:bg-[#0A140B]/50 rounded-xl border border-black/5 dark:border-white/5">
                <span className="text-[10px] text-gray-500 block">Confidence</span>
                <span className="font-bold text-lg text-[#2E7D32]">98%</span>
              </div>
              <div className="p-3 bg-white/50 dark:bg-[#0A140B]/50 rounded-xl border border-black/5 dark:border-white/5">
                <span className="text-[10px] text-gray-500 block">Severity</span>
                <span className="font-bold text-lg text-amber-500">Medium</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-500/10 rounded-xl border border-[#4CAF50]/20 text-[11px] text-[#2E7D32] dark:text-[#8BC34A]">
              <strong>AI Advice:</strong> Switch to drip irrigation; apply copper-based organic spray.
            </div>
          </motion.div>
          {/* Decorative shapes */}
          <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-[#8BC34A]/20 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-[-30px] left-[-30px] w-64 h-64 bg-[#2E7D32]/15 rounded-full blur-3xl -z-10" />
        </div>
      </header>

      {/* Statistics Section */}
      <section className="bg-white/50 dark:bg-[#122214]/20 border-y border-[#2E7D32]/10 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((st, i) => (
            <div key={i} className="text-center space-y-1">
              <h3 className="font-display text-3xl md:text-4xl font-extrabold text-[#2E7D32] dark:text-[#4CAF50]">
                {st.value}
              </h3>
              <p className="text-xs md:text-sm text-[#556B58] dark:text-[#A4BCA7] font-medium uppercase tracking-wider">
                {st.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            Precision Modules Tailored for Maximum Yield
          </h2>
          <p className="text-sm md:text-base text-[#556B58] dark:text-[#A4BCA7]">
            Empower your crop management workflow with server-side AI evaluations, diagnostic alerts, and market indices designed for modern agro-ecosystems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="p-8 glass-card bg-white dark:bg-[#122214]/40 border border-[#2E7D32]/5 shadow-sm space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 dark:bg-[#2E7D32]/20 flex items-center justify-center">
                {feat.icon}
              </div>
              <h3 className="font-display text-lg font-bold tracking-tight">{feat.title}</h3>
              <p className="text-xs md:text-sm text-[#556B58] dark:text-[#A4BCA7] leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#2E7D32]/5 dark:bg-[#122214]/20 py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-display text-3xl font-extrabold tracking-tight">Voices of Trust</h2>
            <p className="text-xs md:text-sm text-[#556B58] dark:text-[#A4BCA7]">
              Farmers and agronomists report significant productivity gains with our tool.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((test, i) => (
              <div key={i} className="glass-card bg-white dark:bg-[#122214]/60 p-8 border border-white/20 shadow-md flex flex-col justify-between">
                <p className="text-xs md:text-sm italic text-[#445847] dark:text-[#CADACA] leading-relaxed">
                  "{test.quote}"
                </p>
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[#2E7D32]/10">
                  <div className="w-10 h-10 rounded-full bg-[#2E7D32] text-white font-bold flex items-center justify-center text-sm">
                    {test.avatar}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs">{test.author}</h5>
                    <span className="text-[10px] text-[#556B58] dark:text-[#A4BCA7]">{test.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto space-y-12">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b border-[#2E7D32]/10 pb-4">
              <button 
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left font-semibold text-sm md:text-base py-3 flex justify-between items-center text-[#2E7D32] dark:text-[#4CAF50] focus:outline-none"
              >
                <span>{faq.q}</span>
                <HelpCircle className="w-5 h-5 flex-shrink-0" />
              </button>
              {activeFaq === idx && (
                <p className="text-xs md:text-sm text-[#556B58] dark:text-[#A4BCA7] mt-2 pl-2 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#2E7D32] to-[#123814] text-white py-20 px-6 md:px-12 text-center rounded-[32px] max-w-6xl mx-auto mb-20 shadow-xl shadow-[#2E7D32]/25">
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">
            Ready to Protect Your Crops?
          </h2>
          <p className="text-sm md:text-base text-green-100 max-w-xl mx-auto leading-relaxed">
            Begin logging your crop fields, calculating accurate diagnostics, tracking weather alert cycles, and boosting your end-of-season yield weights.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={onStart}
              className="bg-white hover:bg-gray-100 text-[#2E7D32] px-8 py-4 rounded-2xl font-bold transition-all hover:scale-102 shadow-md flex items-center justify-center gap-2"
            >
              Go to App Dashboard <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="absolute top-[-50px] left-[-50px] w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-50px] right-[-50px] w-96 h-96 bg-[#8BC34A]/20 rounded-full blur-3xl" />
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2E7D32]/10 py-12 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <Sprout className="w-5 h-5 text-[#2E7D32]" />
          <span className="font-bold text-sm tracking-tight text-gray-700 dark:text-gray-300">
            AI Crop Doctor+ © 2026
          </span>
        </div>
        <p className="text-[11px] text-gray-500 max-w-md text-center md:text-right leading-relaxed">
          This system provides diagnoses powered by Google Gemini and does not replace onsite professional agronomic inspections. Ensure safety precautions are adhered to.
        </p>
      </footer>
    </div>
  );
}
