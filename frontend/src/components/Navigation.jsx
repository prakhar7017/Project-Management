import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Navigation = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="glass-strong mb-8 sticky top-0 z-40 border-b border-slate-700/50 dark:border-slate-700/50 light:border-slate-300/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="ai-badge p-2.5 rounded-xl relative overflow-hidden">
              <LayoutDashboard className="text-white relative z-10" size={24} />
            </div>
            <div>
              <span className="text-xl font-bold gradient-text">Project Manager</span>
              <div className="flex items-center gap-1.5 text-xs">
                <Sparkles size={12} className="text-blue-400 animate-pulse" />
                <span className="text-slate-400 dark:text-slate-400 light:text-slate-600 font-medium">AI Powered</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-5 py-2.5 rounded-xl transition-smooth font-medium ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white neon-blue'
                    : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-slate-200/50'
                }`
              }
            >
              <LayoutDashboard size={20} />
              Projects
            </NavLink>
            <NavLink
              to="/team"
              className={({ isActive }) =>
                `flex items-center gap-2 px-5 py-2.5 rounded-xl transition-smooth font-medium ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white neon-purple'
                    : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-slate-200/50'
                }`
              }
            >
              <Users size={20} />
              Team
            </NavLink>
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-smooth font-medium text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-slate-200/50"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
