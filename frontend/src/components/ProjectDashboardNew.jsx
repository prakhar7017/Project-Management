import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, FolderOpen, Sparkles, TrendingUp } from 'lucide-react';
import { getProjects, createProject, updateProject, deleteProject } from '../services/api';

const ProjectDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', progress: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await getProjects();
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await updateProject(editingProject._id, formData);
      } else {
        await createProject(formData);
      }
      fetchProjects();
      closeModal();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const openModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({ name: project.name, description: project.description || '', progress: project.progress });
    } else {
      setEditingProject(null);
      setFormData({ name: '', description: '', progress: 0 });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormData({ name: '', description: '', progress: 0 });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'In Progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'from-emerald-500 to-green-400';
    if (progress >= 50) return 'from-blue-500 to-cyan-400';
    if (progress >= 25) return 'from-purple-500 to-pink-400';
    return 'from-slate-500 to-slate-400';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-400" size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto relative z-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Projects</h1>
          <p className="text-slate-400">Manage your projects with AI-powered insights</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:scale-105 transition-smooth neon-blue font-medium"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6 hover-lift">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm font-medium">Total Projects</span>
            <FolderOpen className="text-blue-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">{projects.length}</p>
        </div>
        <div className="glass-card rounded-2xl p-6 hover-lift">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm font-medium">In Progress</span>
            <TrendingUp className="text-purple-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">
            {projects.filter(p => p.status === 'In Progress').length}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6 hover-lift">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm font-medium">Completed</span>
            <Sparkles className="text-emerald-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">
            {projects.filter(p => p.status === 'Completed').length}
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project._id}
            className="glass-card rounded-2xl p-6 hover-lift cursor-pointer group relative overflow-hidden"
            onClick={() => navigate(`/projects/${project._id}`)}
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                    <FolderOpen className="text-white" size={20} />
                  </div>
                  <h3 className="text-xl font-semibold text-white group-hover:gradient-text transition-all">
                    {project.name}
                  </h3>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openModal(project)}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-smooth"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-smooth"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {project.description && (
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.description}</p>
              )}

              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                  <span className="font-medium">Progress</span>
                  <span className="font-bold text-white">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(project.progress)} transition-all duration-500`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-700/50">
                <span className="text-slate-400">
                  {project.tasks?.length || 0} task{project.tasks?.length !== 1 ? 's' : ''}
                </span>
                <span className="text-blue-400 font-medium group-hover:text-pink-400 transition-colors">
                  View Details →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <FolderOpen className="mx-auto text-slate-600 mb-4" size={64} />
          <h3 className="text-2xl font-bold text-white mb-2">No projects yet</h3>
          <p className="text-slate-400 mb-6">Create your first project to get started!</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:scale-105 transition-smooth neon-blue font-medium"
          >
            <Plus size={20} />
            Create Project
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700/50">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingProject ? 'Edit Project' : 'New Project'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-slate-300 font-medium mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block text-slate-300 font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth resize-none"
                  placeholder="Describe your project..."
                  rows="3"
                />
              </div>
              {editingProject && (
                <div className="mb-6">
                  <label className="block text-slate-300 font-medium mb-2">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
                  />
                </div>
              )}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 text-slate-300 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-smooth font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl hover:scale-105 transition-smooth neon-blue font-medium"
                >
                  {editingProject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;
