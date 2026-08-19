import React from "react";
import { 
  Sprout, 
  LayoutDashboard, 
  CloudSun, 
  MessageSquare, 
  Users, 
  MapPin, 
  ClipboardList, 
  LogOut, 
  LogIn,
  Menu, 
  X,
  Compass,
  Cpu,
  Bookmark,
  BarChart4,
  ShieldCheck,
  Moon,
  Sun
} from "lucide-react";
import { UserProfile } from "../types";
import { useTheme } from "./ThemeContext";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile;
  onLogout: () => void;
  onLoginRequest?: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout,
  onLoginRequest,
  isCollapsed,
  onToggle
}: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "disease-detection", label: "AI Crop Check (Vision)", icon: <Sprout className="w-5 h-5" /> },
    { id: "pest-id", label: "Pest Identifier", icon: <Cpu className="w-5 h-5" /> },
    { id: "farming-assistant", label: "AI Farming Assistant", icon: <MessageSquare className="w-5 h-5" /> },
    { id: "weather-irrigation", label: "Weather & Irrigation", icon: <CloudSun className="w-5 h-5" /> },
    { id: "crop-calendar", label: "Crop Calendar", icon: <Compass className="w-5 h-5" /> },
    { id: "farm-records", label: "Farm Records & Health", icon: <ClipboardList className="w-5 h-5" /> },
    { id: "market-prices", label: "Wholesale Market Rates", icon: <BarChart4 className="w-5 h-5" /> },
    { id: "community", label: "Farmer Forum", icon: <Users className="w-5 h-5" /> },
    { id: "nearby-services", label: "Maps & Services", icon: <MapPin className="w-5 h-5" /> },
    { id: "learning-center", label: "Learning Center", icon: <Bookmark className="w-5 h-5" /> }
  ];

  // If user is Admin, add Admin tab
  const finalMenuItems = user.role === "admin" 
    ? [...menuItems, { id: "admin-panel", label: "Admin Inspector", icon: <ShieldCheck className="w-5 h-5 text-amber-500" /> }]
    : menuItems;

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-white dark:bg-[#122214] border-b border-[#2E7D32]/10 py-3.5 px-5 fixed top-0 w-full z-40 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#2E7D32] rounded-lg text-white">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="font-display font-extrabold text-sm tracking-tight text-[#2E7D32] dark:text-[#4CAF50]">
            AI Crop Doctor<span className="text-[#8BC34A]">+</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
          >
            {theme === "light" ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5 text-amber-400" />}
          </button>
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Drawer overlay for mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
        />
      )}

      {/* Side bar layout (Desktop + Drawer mobile) */}
      <aside 
        className={`
          fixed top-0 left-0 h-screen bg-white dark:bg-[#0A140B] border-r border-[#2E7D32]/10 z-50 flex flex-col justify-between py-6 px-4 transition-all duration-300 ease-in-out will-change-[width]
          ${isCollapsed ? "md:w-20" : "md:w-64"}
          ${isOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="space-y-6 flex flex-col h-full overflow-hidden">
          {/* Logo container acting as Toggle button */}
          <div className={`flex items-center transition-all duration-300 ${isCollapsed ? "justify-center" : "justify-between px-2"}`}>
            <div 
              onClick={onToggle}
              className={`flex items-center transition-all duration-300 cursor-pointer select-none group/logo hover:opacity-90 active:scale-95 ${isCollapsed ? "justify-center" : "gap-2.5"}`}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <div className="p-2 bg-[#2E7D32] rounded-xl text-white shadow-md transition-transform duration-300 group-hover/logo:scale-110 group-hover/logo:rotate-12 flex-shrink-0">
                <Sprout className="w-6 h-6" />
              </div>
              {!isCollapsed && (
                <span className="font-display font-black text-base tracking-tight text-[#2E7D32] dark:text-[#4CAF50] animate-fade-in whitespace-nowrap overflow-hidden text-ellipsis">
                  AI Crop Doctor<span className="text-[#8BC34A]">+</span>
                </span>
              )}
            </div>
            
            {!isCollapsed && (
              <button 
                onClick={() => setIsOpen(false)}
                className="md:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>

          {/* User Profile Summary */}
          <div className={`bg-gradient-to-br from-[#2E7D32]/5 to-[#8BC34A]/5 rounded-2xl border border-[#2E7D32]/5 flex flex-col transition-all duration-300 relative group/profile ${isCollapsed ? "p-2 justify-center" : "p-3"}`}>
            <div className="flex items-center gap-3">
              <img 
                src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`} 
                alt="avatar" 
                className="w-10 h-10 rounded-full border border-green-200 bg-white flex-shrink-0"
              />
              {!isCollapsed && (
                <div className="min-w-0 flex-1 animate-fade-in whitespace-nowrap overflow-hidden">
                  <h5 className="font-bold text-xs truncate" title={user.displayName}>{user.displayName || "Farmer"}</h5>
                  {user.isDemo ? (
                    <span className="text-[8px] font-extrabold text-amber-600 dark:text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded-full inline-block">
                      Demo User
                    </span>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-[8px] font-semibold text-[#2E7D32] dark:text-[#8BC34A] uppercase bg-[#2E7D32]/10 px-2 py-0.5 rounded-full inline-block self-start">
                        {user.role}
                      </span>
                      {user.email && (
                        <span className="text-[9px] text-gray-400 truncate block mt-0.5" title={user.email}>
                          {user.email}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* In-sidebar Auth Action for Guests */}
            {user.isDemo && !isCollapsed && (
              <button
                onClick={onLoginRequest}
                className="mt-2.5 w-full py-1.5 bg-[#2E7D32] hover:bg-[#235F26] text-white rounded-xl text-[10px] font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In / Register
              </button>
            )}

            {/* Tooltip for profile on collapsed */}
            {isCollapsed && (
              <div className="absolute left-16 px-2.5 py-1.5 bg-gray-900/95 dark:bg-emerald-950/95 border border-emerald-500/20 text-white text-[11px] font-medium rounded-lg shadow-lg opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible pointer-events-none transition-all duration-200 whitespace-nowrap z-50 transform translate-x-1 group-hover/profile:translate-x-0">
                <div className="font-bold">{user.displayName || "Farmer"}</div>
                <div className="text-[9px] text-gray-400 capitalize">{user.isDemo ? "Demo User" : user.role}</div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className={`space-y-1 pr-1 flex-1 ${isCollapsed ? "overflow-visible" : "overflow-y-auto"}`}>
            {finalMenuItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center rounded-xl text-xs font-bold transition-all outline-none relative group
                    ${active 
                      ? "bg-[#2E7D32] text-white shadow-md shadow-[#2E7D32]/20" 
                      : "text-gray-500 dark:text-gray-400 hover:bg-[#2E7D32]/5 hover:text-[#2E7D32] dark:hover:text-[#4CAF50]"}
                    ${isCollapsed ? "justify-center px-2 py-3" : "px-4 py-3 gap-3"}
                  `}
                >
                  {/* Glowing Active Indicator */}
                  {active && (
                    <span className="absolute left-0 top-1/4 bottom-1/4 w-1.5 bg-[#8BC34A] rounded-r-full shadow-[0_0_8px_#8BC34A] animate-pulse" />
                  )}

                  <div className="transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3 flex-shrink-0">
                    {item.icon}
                  </div>

                  {!isCollapsed && (
                    <span className="animate-fade-in whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.label}
                    </span>
                  )}

                  {/* Tooltip */}
                  {isCollapsed && (
                    <div className="absolute left-16 px-2.5 py-1.5 bg-gray-900/95 dark:bg-emerald-950/95 border border-emerald-500/20 text-white text-[11px] font-medium rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none transition-all duration-200 whitespace-nowrap z-50 transform translate-x-1 group-hover:translate-x-0">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Action Controls Footer */}
        <div className="space-y-3 pt-4 border-t border-[#2E7D32]/10">
          <button 
            onClick={toggleTheme}
            className={`w-full flex items-center text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-[#2E7D32]/5 rounded-xl transition-all outline-none relative group ${isCollapsed ? "justify-center px-2 py-3" : "px-4 py-3 gap-3"}`}
          >
            <div className="transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6 flex-shrink-0">
              {theme === "light" ? <Moon className="w-5 h-5 text-[#2E7D32]" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </div>
            {!isCollapsed && (
              <span className="animate-fade-in whitespace-nowrap overflow-hidden">
                {theme === "light" ? "Switch to Dark Theme" : "Switch to Light Theme"}
              </span>
            )}
            {isCollapsed && (
              <div className="absolute left-16 px-2.5 py-1.5 bg-gray-900/95 dark:bg-emerald-950/95 border border-emerald-500/20 text-white text-[11px] font-medium rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none transition-all duration-200 whitespace-nowrap z-50 transform translate-x-1 group-hover:translate-x-0">
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </div>
            )}
          </button>

          {user.isDemo ? (
            <button
              onClick={onLoginRequest}
              className={`w-full flex items-center text-xs font-bold text-green-600 hover:bg-green-500/10 rounded-xl transition-all outline-none relative group ${isCollapsed ? "justify-center px-2 py-3" : "px-4 py-3 gap-3"}`}
            >
              <div className="transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6 flex-shrink-0">
                <LogIn className="w-5 h-5 text-green-600" />
              </div>
              {!isCollapsed && <span className="animate-fade-in whitespace-nowrap overflow-hidden">Sign In / Register</span>}
              {isCollapsed && (
                <div className="absolute left-16 px-2.5 py-1.5 bg-green-950/95 border border-green-500/20 text-white text-[11px] font-medium rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none transition-all duration-200 whitespace-nowrap z-50 transform translate-x-1 group-hover:translate-x-0">
                  Sign In / Register
                </div>
              )}
            </button>
          ) : (
            <button
              onClick={onLogout}
              className={`w-full flex items-center text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all outline-none relative group ${isCollapsed ? "justify-center px-2 py-3" : "px-4 py-3 gap-3"}`}
            >
              <div className="transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6 flex-shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              {!isCollapsed && <span className="animate-fade-in whitespace-nowrap overflow-hidden">Logout Account</span>}
              {isCollapsed && (
                <div className="absolute left-16 px-2.5 py-1.5 bg-red-950/95 border border-red-500/20 text-white text-[11px] font-medium rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none transition-all duration-200 whitespace-nowrap z-50 transform translate-x-1 group-hover:translate-x-0">
                  Logout Account
                </div>
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
