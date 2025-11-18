import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, FolderOpen, Sparkles, TrendingUp, Search, Filter, ArrowUpDown, X } from 'lucide-react';
import { getProjects, createProject, updateProject, deleteProject } from '../services/api';
import { useToastContext } from '../contexts/ToastContext';

const ProjectDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', progress: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const navigate = useNavigate();
  const toast = useToastContext();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await getProjects();
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load projects. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await updateProject(editingProject._id, formData);
        toast.success('Project updated successfully!');
      } else {
        await createProject(formData);
        toast.success('Project created successfully!');
      }
      fetchProjects();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save project. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        toast.success('Project deleted successfully!');
        fetchProjects();
      } catch (error) {
        toast.error('Failed to delete project. Please try again.');
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

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(query) ||
        (project.description && project.description.toLowerCase().includes(query))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'progress':
          comparison = a.progress - b.progress;
          break;
        case 'status':
          const statusOrder = { 'Not Started': 0, 'In Progress': 1, 'Completed': 2 };
          comparison = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
          break;
        case 'date':
        default:
          const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
          const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
          comparison = dateA - dateB;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [projects, searchQuery, statusFilter, sortBy, sortOrder]);

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
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
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white dark:text-white light:text-slate-900 mb-2">Projects</h1>
            <p className="text-slate-400 dark:text-slate-400 light:text-slate-600">Manage your projects with AI-powered insights</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:scale-105 transition-smooth neon-blue font-medium"
          >
            <Plus size={20} />
            New Project
          </button>
        </div>

        <div className="glass-card rounded-2xl p-4 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 dark:bg-slate-800/50 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-white dark:text-white light:text-slate-900 placeholder-slate-500 dark:placeholder-slate-500 light:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 dark:bg-slate-800/50 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-white dark:text-white light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
            >
              <option value="all">All Status</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown size={18} className="text-slate-400" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by);
                setSortOrder(order);
              }}
              className="px-4 py-2 bg-slate-800/50 dark:bg-slate-800/50 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-white dark:text-white light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="progress-desc">Progress (High)</option>
              <option value="progress-asc">Progress (Low)</option>
              <option value="status-asc">Status</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6 hover-lift">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm font-medium">Total Projects</span>
            <FolderOpen className="text-blue-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-white dark:text-white light:text-slate-900">{projects.length}</p>
        </div>
        <div className="glass-card rounded-2xl p-6 hover-lift">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm font-medium">In Progress</span>
            <TrendingUp className="text-purple-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-white dark:text-white light:text-slate-900">
            {projects.filter(p => p.status === 'In Progress').length}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6 hover-lift">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm font-medium">Completed</span>
            <Sparkles className="text-emerald-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-white dark:text-white light:text-slate-900">
            {projects.filter(p => p.status === 'Completed').length}
          </p>
        </div>
      </div>

      {filteredAndSortedProjects.length !== projects.length && (
        <div className="mb-4 text-sm text-slate-400 dark:text-slate-400 light:text-slate-600">
          Showing {filteredAndSortedProjects.length} of {projects.length} projects
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedProjects.map((project) => (
          <div
            key={project._id}
            className="glass-card rounded-2xl p-6 hover-lift cursor-pointer group relative overflow-hidden"
            onClick={() => navigate(`/projects/${project._id}`)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                    <FolderOpen className="text-white" size={20} />
                  </div>
                  <h3 className="text-xl font-semibold text-white dark:text-white light:text-slate-900 group-hover:gradient-text transition-all">
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
                <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm mb-4 line-clamp-2">{project.description}</p>
              )}

              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 mb-2">
                  <span className="font-medium">Progress</span>
                  <span className="font-bold text-white dark:text-white light:text-slate-900">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-700/50 dark:bg-slate-700/50 light:bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(project.progress)} transition-all duration-500`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-700/50 dark:border-slate-700/50 light:border-slate-300/50">
                <span className="text-slate-400 dark:text-slate-400 light:text-slate-600">
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
          <h3 className="text-2xl font-bold text-white dark:text-white light:text-slate-900 mb-2">No projects yet</h3>
          <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 mb-6">Create your first project to get started!</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:scale-105 transition-smooth neon-blue font-medium"
          >
            <Plus size={20} />
            Create Project
          </button>
        </div>
      )}

      {projects.length > 0 && filteredAndSortedProjects.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Search className="mx-auto text-slate-600 mb-4" size={64} />
          <h3 className="text-2xl font-bold text-white dark:text-white light:text-slate-900 mb-2">No projects found</h3>
          <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 mb-6">Try adjusting your search or filters</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="inline-flex items-center gap-2 bg-slate-700/50 dark:bg-slate-700/50 light:bg-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700 px-6 py-3 rounded-xl hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-300 transition-smooth font-medium"
          >
            <X size={20} />
            Clear Filters
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700/50 dark:border-slate-700/50 light:border-slate-300/50">
            <h2 className="text-2xl font-bold text-white dark:text-white light:text-slate-900 mb-6">
              {editingProject ? 'Edit Project' : 'New Project'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 font-medium mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 dark:bg-slate-800/50 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-white dark:text-white light:text-slate-900 placeholder-slate-500 dark:placeholder-slate-500 light:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 dark:bg-slate-800/50 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-white dark:text-white light:text-slate-900 placeholder-slate-500 dark:placeholder-slate-500 light:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth resize-none"
                  placeholder="Describe your project..."
                  rows="3"
                />
              </div>
              {editingProject && (
                <div className="mb-6">
                  <label className="block text-slate-300 dark:text-slate-300 light:text-slate-700 font-medium mb-2">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-slate-800/50 dark:bg-slate-800/50 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-white dark:text-white light:text-slate-900 placeholder-slate-500 dark:placeholder-slate-500 light:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
                  />
                </div>
              )}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 text-slate-300 dark:text-slate-300 light:text-slate-700 bg-slate-700/50 dark:bg-slate-700/50 light:bg-slate-200 rounded-xl hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-300 transition-smooth font-medium"
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
