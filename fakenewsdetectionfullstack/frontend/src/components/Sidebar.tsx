import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Search, 
  History, 
  Info, 
  ShieldCheck,
  User,
  Zap,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [isCollapsed, setIsCollapsed] = useState(false);

  const coreLinks = [
    { name: "About Project", href: "/", icon: Info },
    { name: "Verify News", href: "/single-analysis", icon: Search },
    { name: "Overview", href: "/overview", icon: LayoutDashboard },
    { name: "History Logs", href: "/history-logs", icon: History }
  ];

  return (
    <aside className={`hidden lg:flex flex-col bg-zinc-50 dark:bg-[#0E0E11] border-r border-zinc-200 dark:border-zinc-800 justify-between min-h-screen shrink-0 font-sans z-40 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex flex-col">
        {/* Sidebar Logo Header */}
        <div className={`h-16 flex items-center px-6 mb-6 mt-2 relative transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'space-x-3'}`}>
          <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-xl text-white shadow-md shadow-blue-500/20 shrink-0">
            <ShieldCheck size={20} />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col justify-center overflow-hidden whitespace-nowrap animate-fadeIn">
              <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                TruthLens AI
              </span>
            </div>
          )}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 shadow-sm z-50 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="px-3 space-y-6">
          <nav className="space-y-1.5">
            {coreLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group relative flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    active
                      ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 shadow-sm shadow-blue-500/5"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                  } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={18} className={`transition-colors duration-300 ${active ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"}`} />
                    {!isCollapsed && (
                      <span className="whitespace-nowrap animate-fadeIn">{item.name}</span>
                    )}
                  </div>
                  {active && !isCollapsed && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50 animate-fadeIn" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Footer User Card */}
      <div className="p-3 mb-2">
        <div className={`flex items-center p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-700 text-zinc-600 dark:text-zinc-300 p-2 rounded-xl group-hover:shadow-md transition-all">
              <User size={18} />
            </div>
            {!isCollapsed && (
              <div className="whitespace-nowrap animate-fadeIn">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 block">Admin User</span>
                <span className="text-[11px] text-zinc-500 flex items-center mt-0.5 font-medium">
                  <Zap size={12} className="text-blue-500 mr-1" />
                  Pro Plan
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
