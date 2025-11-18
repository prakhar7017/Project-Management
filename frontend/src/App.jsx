import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider, useToastContext } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/Navigation';
import ProjectDashboard from './components/ProjectDashboardNew';
import TaskList from './components/TaskListNew';
import TeamOverview from './components/TeamOverviewNew';
import AIChat from './components/AIChat';
import HealthCheck from './components/HealthCheck';
import ToastContainer from './components/ToastContainer';

const AppContent = () => {
  const toast = useToastContext();

  return (
    <>
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
        <HealthCheck />
      </div>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
