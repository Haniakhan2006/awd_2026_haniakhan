import React, { useState, useEffect } from "react";
import { ThemeProvider, useTheme } from "./components/ThemeContext";
import LandingPage from "./components/LandingPage";
import Auth from "./components/Auth";
import Sidebar from "./components/Sidebar";
import DiseaseDetection from "./components/DiseaseDetection";
import FarmingAssistant from "./components/FarmingAssistant";
import WeatherAdvisor from "./components/WeatherAdvisor";
import CropCalendar from "./components/CropCalendar";
import FarmRecords from "./components/FarmRecords";
import MarketPrices from "./components/MarketPrices";
import Community from "./components/Community";
import NearbyServices from "./components/NearbyServices";
import LearningCenter from "./components/LearningCenter";
import PestId from "./components/PestId";
import AdminPanel from "./components/AdminPanel";
import { UserProfile } from "./types";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { 
  Sprout, 
  Sparkles, 
  LayoutDashboard, 
  CloudSun, 
  TrendingUp, 
  Cpu, 
  MapPin, 
  Award,
  CircleCheck,
  ChevronRight,
  ShieldCheck,
  Volume2
} from "lucide-react";

const DEMO_USER: UserProfile = {
  uid: "demo-guest-user",
  displayName: "Farmer Demo",
  email: "demo@cropdoctor.com",
  photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=farmer_demo",
  role: "farmer",
  location: "Punjab Sector",
  createdAt: new Date().toISOString(),
  isDemo: true
};

function MainAppContent() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authView, setAuthView] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const { theme } = useTheme();

  useEffect(() => {
    // Listen for real Firebase auth state changes
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Resolve custom user profile role (simple domain mapping/mock)
        const role = firebaseUser.email?.includes("admin") ? "admin" : "farmer";
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Farmer",
          photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${firebaseUser.uid}`,
          role: role as "farmer" | "admin",
          createdAt: new Date().toISOString()
        });
        setAuthView(false);
      } else {
        setUser((currentUser) => {
          if (currentUser?.isDemo) return currentUser;
          return null;
        });
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(DEMO_USER);
      setActiveTab("dashboard");
    } catch (e) {
      console.warn("Logout failed:", e);
    }
  };

  const handleExploreDemo = () => {
    setUser(DEMO_USER);
    setAuthView(false);
    setActiveTab("dashboard");
  };

  const handleLoginRequest = () => {
    setUser(null);
    setAuthView(true);
    setAuthMode("login");
  };

  const handleStart = () => {
    setAuthView(true);
    setAuthMode("login");
  };

  const handleNavigateToAuth = (mode: "login" | "signup") => {
    setAuthView(true);
    setAuthMode(mode);
  };

  const handleAuthSuccess = (profile: UserProfile) => {
    setUser(profile);
    setAuthView(false);
  };

  // If user is not authenticated and is on landing pages
  if (!user) {
    if (authView) {
      return (
        <div className="min-h-screen bg-[#F7F9F6] dark:bg-[#060D07] text-gray-800 dark:text-gray-100 transition-colors duration-300">
          {/* Header */}
          <header className="py-4 px-6 border-b border-[#2E7D32]/10 bg-white/40 dark:bg-black/20 backdrop-blur-md flex justify-between items-center max-w-7xl mx-auto rounded-b-2xl">
            <div 
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => setAuthView(false)}
            >
              <div className="p-2 bg-[#2E7D32] rounded-xl text-white shadow-md">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="font-display font-black text-lg tracking-tight text-[#2E7D32] dark:text-[#4CAF50]">
                AI Crop Doctor<span className="text-[#8BC34A]">+</span>
              </span>
            </div>
            <button 
              onClick={() => setAuthView(false)}
              className="text-xs font-bold text-[#2E7D32] hover:underline"
            >
              ← Back to Landing
            </button>
          </header>

          <main className="py-12 px-4 max-w-md mx-auto">
            <Auth onAuthSuccess={handleAuthSuccess} initialMode={authMode} onExploreDemo={handleExploreDemo} />
          </main>
        </div>
      );
    }

    return (
      <LandingPage 
        onStart={handleStart} 
        onNavigateToAuth={handleNavigateToAuth} 
        onExploreDemo={handleExploreDemo}
      />
    );
  }

  // Dashboard Tab rendering
  const renderDashboard = () => {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Hero Banner */}
        <div className="p-6 md:p-8 bg-gradient-to-r from-[#2E7D32] to-[#1E5621] rounded-3xl text-white relative overflow-hidden shadow-lg shadow-[#2E7D32]/10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px]" />
          
          <div className="relative z-10 max-w-xl space-y-3">
            <span className="text-[10px] bg-white/20 text-white font-bold px-3 py-1 rounded-full uppercase tracking-widest inline-block">
              Precise Yield Management Active
            </span>
            <h2 className="font-display font-black text-2xl md:text-3xl tracking-tight leading-none">
              Welcome Back, {user.displayName || "Farmer"}!
            </h2>
            <p className="text-xs md:text-sm text-green-100 leading-relaxed font-semibold">
              Your wheat fields are tracking at optimum chlorophyll rates. Run a dynamic leaf check today or review seasonal fertilizer forecasts.
            </p>
          </div>
        </div>

        {/* Dynamic Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-5 space-y-2">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Farm NDVI Vigor</span>
            <span className="text-2xl font-black text-[#2E7D32] dark:text-[#4CAF50] block">0.84 Optimal</span>
            <p className="text-[10px] text-gray-400">Canopy index updated 12 mins ago</p>
          </div>

          <div className="glass-card p-5 space-y-2">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Next Operation</span>
            <span className="text-xl font-bold text-gray-800 dark:text-gray-100 block">First Urea Broadcast</span>
            <p className="text-[10px] text-gray-400">Scheduled in 22 days</p>
          </div>

          <div className="glass-card p-5 space-y-2">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">District Outbreaks</span>
            <span className="text-2xl font-black text-green-600 block">0 Active Blights</span>
            <p className="text-[10px] text-gray-400">Faisalabad region cleared</p>
          </div>

          <div className="glass-card p-5 space-y-2">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Wheat Spot Rate</span>
            <span className="text-2xl font-black text-gray-800 dark:text-gray-100 block">$340 / Ton</span>
            <p className="text-[10px] text-[#2E7D32] font-semibold">▲ 2.1% market trend rise</p>
          </div>
        </div>

        {/* Bento Board: Quick Action Launchers & Subsidies */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Quick Launchers */}
          <div className="lg:col-span-7 glass-card p-6 space-y-6">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-500">Quick Diagnostic Launchers</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Vision Scan */}
              <button 
                onClick={() => setActiveTab("disease-detection")}
                className="p-4 bg-gradient-to-br from-[#2E7D32]/5 to-[#8BC34A]/5 hover:from-[#2E7D32]/10 hover:to-[#8BC34A]/10 border border-[#2E7D32]/15 rounded-2xl text-left transition-all space-y-3 group outline-none"
              >
                <div className="p-2.5 bg-[#2E7D32] text-white rounded-xl inline-block shadow">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs md:text-sm group-hover:text-[#2E7D32] transition-colors flex items-center gap-1">
                    Leaf Diagnostic Check <ChevronRight className="w-4 h-4" />
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-1 leading-normal">
                    Shoot a leaf photo to calculate disease percentages and treatment codes instantly.
                  </p>
                </div>
              </button>

              {/* Chat consult */}
              <button 
                onClick={() => setActiveTab("farming-assistant")}
                className="p-4 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 hover:from-blue-500/10 hover:to-cyan-500/10 border border-blue-500/15 rounded-2xl text-left transition-all space-y-3 group outline-none"
              >
                <div className="p-2.5 bg-blue-500 text-white rounded-xl inline-block shadow">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs md:text-sm group-hover:text-blue-500 transition-colors flex items-center gap-1">
                    Multilingual Chat Consult <ChevronRight className="w-4 h-4" />
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-1 leading-normal">
                    Consult with AI using Punjabi, Urdu, or Pashto speech inputs and text.
                  </p>
                </div>
              </button>

            </div>
          </div>

          {/* Subsidies overview */}
          <div className="lg:col-span-5 glass-card p-6 space-y-4">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-500">Subvention Scheme Highlight</h3>
            
            <div className="p-4 bg-white dark:bg-[#122214]/50 border rounded-2xl space-y-3.5">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold text-[#2E7D32] uppercase">Ministry of Agriculture</span>
                <span className="bg-amber-500/15 text-amber-500 text-[9px] px-2 py-0.5 rounded-full font-bold">60% Financed</span>
              </div>
              <div>
                <h4 className="font-bold text-xs">Kisan Solar Pump Subsidy</h4>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Installing precision drip-connected solar pumps reduces baseline fuel usage to zero. Application link is active inside Learning Center.
                </p>
              </div>
              <button 
                onClick={() => setActiveTab("learning-center")}
                className="w-full text-center text-[10px] font-bold text-[#2E7D32] hover:underline"
              >
                View Subsidy Details →
              </button>
            </div>
          </div>

        </div>

      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-[#F7F9F6] dark:bg-[#060D07] text-gray-800 dark:text-gray-100 transition-colors duration-300`}>
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
        onLoginRequest={handleLoginRequest}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Workspace Frame */}
      <main className={`flex-1 p-6 md:p-10 pt-20 md:pt-10 overflow-y-auto w-full transition-all duration-300 ease-in-out will-change-[padding-left] ${isSidebarCollapsed ? "md:pl-20" : "md:pl-64"}`}>
        <div className="max-w-7xl mx-auto">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "disease-detection" && <DiseaseDetection user={user} />}
          {activeTab === "pest-id" && <PestId />}
          {activeTab === "farming-assistant" && <FarmingAssistant user={user} />}
          {activeTab === "weather-irrigation" && <WeatherAdvisor />}
          {activeTab === "crop-calendar" && <CropCalendar userId={user.uid} />}
          {activeTab === "farm-records" && <FarmRecords userId={user.uid} />}
          {activeTab === "market-prices" && <MarketPrices />}
          {activeTab === "community" && <Community user={user} />}
          {activeTab === "nearby-services" && <NearbyServices />}
          {activeTab === "learning-center" && <LearningCenter />}
          {activeTab === "admin-panel" && user.role === "admin" && <AdminPanel />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainAppContent />
    </ThemeProvider>
  );
}
