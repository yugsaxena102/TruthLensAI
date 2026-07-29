import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Search, 
  History, 
  Info, 
  ShieldCheck,
  User,
  Zap
} from "lucide-react";

interface SidebarProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const coreLinks = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Verify News", href: "/single-analysis", icon: Search },
    { name: "History Logs", href: "/history-logs", icon: History },
    { name: "About Project", href: "/about", icon: Info }
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-zinc-50 dark:bg-[#09090B] border-r border-zinc-200 dark:border-zinc-800 flex-col justify-between min-h-screen shrink-0 font-sans z-40 transition-colors">
      <div className="flex flex-col">
        {/* Sidebar Logo Header */}
        <div className="h-16 flex items-center px-6 space-x-3 mb-6 mt-2">
          <div className="bg-zinc-900 dark:bg-zinc-100 p-1.5 rounded-lg text-white dark:text-zinc-900 shadow-sm">
            <ShieldCheck size={20} />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              TruthLens AI
            </span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="px-3 space-y-6">
          <nav className="space-y-1">
            {coreLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group relative flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    active
                      ? "text-zinc-900 dark:text-zinc-50 bg-zinc-200/50 dark:bg-zinc-800/50"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800/30"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={16} className={`transition-colors ${active ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"}`} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Footer User Card */}
      <div className="p-3 mb-2">
        <div className="flex items-center justify-between p-2.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group">
          <div className="flex items-center space-x-3">
            <div className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 p-1.5 rounded-md group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700 transition-colors">
              <User size={16} />
            </div>
            <div>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 block">Admin User</span>
              <span className="text-[11px] text-zinc-500 flex items-center mt-0.5 font-medium">
                <Zap size={10} className="text-blue-500 mr-1" />
                Pro Plan
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
