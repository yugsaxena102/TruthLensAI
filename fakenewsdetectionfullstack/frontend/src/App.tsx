import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { SingleAnalysis } from "./pages/SingleAnalysis";
import { HistoryLogs } from "./pages/HistoryLogs";
import About from "./pages/About";
import { Search, Bell, Sun, Moon } from "lucide-react";

// Nested main layout wrapper to safely access react-router useLocation hook
const MainLayout: React.FC<{ darkMode: boolean; toggleTheme: () => void }> = ({ darkMode, toggleTheme }) => {
  const location = useLocation();

  const getPageTitle = (path: string) => {
    switch (path) {
      case "/":
        return "Dashboard Overview";
      case "/single-analysis":
        return "News Verification";
      case "/history-logs":
        return "Verification History";
      case "/about":
        return "About System";
      default:
        return "TruthLens AI";
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-[#09090B] text-zinc-900 dark:text-zinc-50 font-sans transition-colors duration-200">
      {/* Left Sidebar */}
      <Sidebar darkMode={darkMode} toggleTheme={toggleTheme} />

      {/* Right Content Area */}
      <div className="flex-grow flex flex-col min-w-0 relative">
        
        {/* Top Bar Header */}
        <header className="h-16 flex items-center justify-between px-8 sticky top-0 z-50 bg-white/80 dark:bg-[#09090B]/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors shrink-0">
          {/* Left: Dynamic Page Title */}
          <div className="flex flex-col justify-center">
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {getPageTitle(location.pathname)}
            </h1>
            <div className="flex items-center text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 space-x-1.5">
              <span>TruthLens</span>
              <span>/</span>
              <span className="text-zinc-900 dark:text-zinc-100">{location.pathname.replace("/", "") || "dashboard"}</span>
            </div>
          </div>

          {/* Right: Search, Theme Toggle, Notifications, Profile Card */}
          <div className="flex items-center space-x-5">
            
            {/* Search Input bar */}
            <div className="relative hidden md:block group">
              <Search size={14} className="absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-12 py-2 rounded-md text-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700 focus:border-zinc-300 dark:focus:border-zinc-700 w-64 placeholder-zinc-400 dark:placeholder-zinc-500 transition-all shadow-sm"
                readOnly
              />
              <div className="absolute right-2 top-2 hidden lg:flex items-center space-x-1">
                <kbd className="px-1.5 py-0.5 text-[10px] font-medium font-sans bg-zinc-200 dark:bg-zinc-800 rounded text-zinc-500 dark:text-zinc-400">⌘K</kbd>
              </div>
            </div>

            <div className="flex items-center space-x-3 border-l border-zinc-200 dark:border-zinc-800 pl-5">
              {/* Dark Mode Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* Notification button */}
              <button className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors relative">
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full border border-white dark:border-zinc-950"></span>
              </button>

              {/* User Profile Avatar */}
              <div className="ml-2 w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-medium text-xs cursor-pointer">
                Y
              </div>
            </div>
          </div>
        </header>

        {/* Main Viewport Content */}
        <main className="flex-grow p-8 overflow-y-auto relative">
          <div className="max-w-[1440px] mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/single-analysis" element={<SingleAnalysis />} />
              <Route path="/history-logs" element={<HistoryLogs />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Sync document element class lists for dark selector strategy
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <Router>
      <MainLayout darkMode={darkMode} toggleTheme={toggleTheme} />
    </Router>
  );
}

export default App;
