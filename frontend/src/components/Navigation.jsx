import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Sparkles } from 'lucide-react';

const Navigation = () => {
  return (
    <nav className="glass-strong mb-8 sticky top-0 z-40 border-b border-slate-700/50">
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
                <span className="text-slate-400 font-medium">AI Powered</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-5 py-2.5 rounded-xl transition-smooth font-medium ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white neon-blue'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
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
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`
              }
            >
              <Users size={20} />
              Team
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
