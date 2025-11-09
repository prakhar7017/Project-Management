import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ProjectDashboard from './components/ProjectDashboardNew';
import TaskList from './components/TaskListNew';
import TeamOverview from './components/TeamOverviewNew';
import AIChat from './components/AIChat';

function App() {
  return (
    <Router>
      <div className="min-h-screen gradient-bg">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<ProjectDashboard />} />
            <Route path="/projects/:id" element={<TaskList />} />
            <Route path="/team" element={<TeamOverview />} />
          </Routes>
        </div>
        <AIChat />
      </div>
    </Router>
  );
}

export default App;
