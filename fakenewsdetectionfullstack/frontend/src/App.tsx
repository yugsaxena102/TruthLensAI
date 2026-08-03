import { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { SingleAnalysis } from "./pages/SingleAnalysis";
import { HistoryLogs } from "./pages/HistoryLogs";
import About from "./pages/About";
import { Search, Bell, Sun, Moon, Clock, ChevronRight } from "lucide-react";
import { truthLensApi } from "./services/api";
import type { HistoryItem } from "./services/api";

const MainLayout: React.FC<{ darkMode: boolean; toggleTheme: () => void }> = ({ darkMode, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<HistoryItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [allHistory, setAllHistory] = useState<HistoryItem[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    truthLensApi.getHistory().then((data) => {
      setAllHistory(Array.isArray(data) ? data : []);
    }).catch((e) => {
      console.error("Failed to fetch history for search:", e);
      setAllHistory([]);
    });
    
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    const qLower = q.toLowerCase();
    const filtered = allHistory.filter(item => 
      item.input_text.toLowerCase().includes(qLower) || 
      item.text_snippet.toLowerCase().includes(qLower)
    );
    setSearchResults(filtered);
    setIsSearchOpen(true);
  };

  const handleSelectSearch = (item: HistoryItem) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    navigate('/history-logs', { state: { highlightId: item.id } });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchResults.length > 0) {
        handleSelectSearch(searchResults[0]);
      } else if (searchQuery.trim()) {
        navigate('/history-logs', { state: { searchQuery: searchQuery.trim() } });
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    }
  };

  const getPageTitle = (path: string) => {
    switch (path) {
      case "/": return "About System";
      case "/overview": return "Dashboard Overview";
      case "/single-analysis": return "News Verification";
      case "/history-logs": return "Verification History";
      default: return "TruthLens AI";
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-[#0E0E11] text-zinc-900 dark:text-zinc-50 font-sans transition-colors duration-400">
      <Sidebar darkMode={darkMode} toggleTheme={toggleTheme} />
      <div className="flex-grow flex flex-col min-w-0 relative">
        <header className="h-16 flex items-center justify-between px-8 sticky top-0 z-50 bg-white/80 dark:bg-[#0E0E11]/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors shrink-0">
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
          <div className="flex items-center space-x-5">
            
            <div className="relative hidden md:block group" ref={searchRef}>
              <Search size={14} className="absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search past verifications..." 
                value={searchQuery}
                onChange={handleSearch}
                onKeyDown={handleKeyDown}
                onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
                className="pl-9 pr-12 py-2 rounded-lg text-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-72 placeholder-zinc-400 dark:placeholder-zinc-500 transition-all shadow-sm"
              />
              <div className="absolute right-2 top-2 hidden lg:flex items-center space-x-1 pointer-events-none">
                <kbd className="px-1.5 py-0.5 text-[10px] font-medium font-sans bg-zinc-200 dark:bg-zinc-800 rounded text-zinc-500 dark:text-zinc-400">⌘K</kbd>
              </div>
              
              {/* Search Dropdown */}
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-[400px] max-h-[400px] overflow-y-auto bg-white dark:bg-[#151518] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 animate-fadeIn">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Past Verifications
                    </div>
                    {searchResults.slice(0, 8).map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectSearch(item)}
                        className="w-full text-left flex items-start px-3 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors group/item"
                      >
                        <Clock size={14} className="mt-0.5 mr-3 text-zinc-400 group-hover/item:text-blue-500 shrink-0" />
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{item.text_snippet}</p>
                          <div className="flex items-center mt-1 space-x-2 text-[10px]">
                            <span className={`px-1.5 py-0.5 rounded ${item.prediction === 'Fake' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                              {item.prediction}
                            </span>
                            <span className="text-zinc-500">{item.date} {item.time}</span>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-700 group-hover/item:text-blue-500 shrink-0 self-center" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 border-l border-zinc-200 dark:border-zinc-800 pl-5">
              <button 
                onClick={toggleTheme}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors relative">
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full border border-white dark:border-[#0E0E11]"></span>
              </button>
              <div className="ml-2 w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-medium text-xs cursor-pointer shadow-sm hover:ring-2 hover:ring-blue-500/20 transition-all">
                Y
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow p-8 overflow-y-auto relative">
          <div className="max-w-[1440px] mx-auto">
            <Routes>
              <Route path="/" element={<About />} />
              <Route path="/overview" element={<Dashboard />} />
              <Route path="/single-analysis" element={<SingleAnalysis />} />
              <Route path="/history-logs" element={<HistoryLogs />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  // Always open in LIGHT MODE by default
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <Router>
      <MainLayout darkMode={darkMode} toggleTheme={toggleTheme} />
    </Router>
  );
}

export default App;
