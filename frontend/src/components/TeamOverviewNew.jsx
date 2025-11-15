import { useState, useEffect } from 'react';
import { Users, AlertCircle, Plus, Edit2, Trash2, Mail, Award, RefreshCw, TrendingUp, FolderOpen, CheckCircle, Calendar, X as XIcon } from 'lucide-react';
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from '../services/api';
import { useToastContext } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

const TeamOverview = () => {
  const toast = useToastContext();
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null); // Track which member's tasks are being viewed in modal
  
  // Helper to get unique member ID
  const getMemberId = (member, index) => {
    // Prioritize member.id (from backend) - must be a valid string
    if (member && member.id) {
      const id = String(member.id).trim();
      if (id && id !== 'undefined' && id !== 'null' && id !== '') {
        return id;
      }
    }
    // Fallback: use name + email + index for guaranteed uniqueness
    const name = String(member?.name || 'unknown');
    const email = String(member?.email || `idx${index}`);
    const fallbackId = `member-${name}-${email}-${index}`;
    return fallbackId;
  };
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    capacity: 5,
    skills: ''
  });

  useEffect(() => {
    fetchTeamMembers();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      fetchTeamMembers();
    }, 30000); // 30 seconds
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const fetchTeamMembers = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      }
      const response = await getTeamMembers();
      setTeamMembers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members. Please try again.');
      setLoading(false);
    } finally {
      if (showRefreshIndicator) {
        setRefreshing(false);
      }
    }
  };

  const handleManualRefresh = () => {
    fetchTeamMembers(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const memberData = {
        ...formData,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : []
      };

      if (editingMember) {
        await updateTeamMember(editingMember.id, memberData);
        toast.success('Team member updated successfully!');
      } else {
        await createTeamMember(memberData);
        toast.success('Team member added successfully!');
      }
      
      fetchTeamMembers();
      closeModal();
    } catch (error) {
      console.error('Error saving team member:', error);
      toast.error('Failed to save team member. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        await deleteTeamMember(id);
        toast.success('Team member removed successfully!');
        fetchTeamMembers();
      } catch (error) {
        console.error('Error deleting team member:', error);
        toast.error('Failed to remove team member. Please try again.');
      }
    }
  };

  const getWorkloadLevel = (member) => {
    const taskCount = member.taskCount || 0;
    if (taskCount >= 3) return 'high';
    if (taskCount === 2) return 'medium';
    return 'no';
  };

  const getWorkloadColor = (member) => {
    const level = getWorkloadLevel(member);
    if (level === 'high') return 'text-red-400 bg-red-500/20 border-red-500/30';
    if (level === 'medium') return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
  };

  const getWorkloadStatus = (member) => {
    const level = getWorkloadLevel(member);
    if (level === 'high') return 'High Workload';
    if (level === 'medium') return 'Medium Workload';
    return 'No Workload';
  };

  const getWorkloadBarColor = (member) => {
    const level = getWorkloadLevel(member);
    if (level === 'high') return 'bg-gradient-to-r from-red-500 to-red-600';
    if (level === 'medium') return 'bg-gradient-to-r from-orange-500 to-orange-600';
    return 'bg-gradient-to-r from-emerald-500 to-green-400';
  };

  const openTasksModal = (member) => {
    console.log('Opening tasks modal for member:', member);
    console.log('Member assignedTasks:', member.assignedTasks);
    setSelectedMember(member);
  };

  const closeTasksModal = () => {
    setSelectedMember(null);
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const openModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        email: member.email || '',
        role: member.role || '',
        capacity: member.capacity || 5,
        skills: member.skills?.join(', ') || ''
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        email: '',
        role: '',
        capacity: 5,
        skills: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMember(null);
    setFormData({
      name: '',
      email: '',
      role: '',
      capacity: 5,
      skills: ''
    });
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto relative z-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Team Management</h1>
          <p className="text-slate-400">
            Manage your team members
            <span className="ml-3 text-xs text-slate-500">• Auto-refreshes every 30s</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-slate-700/50 text-slate-300 px-4 py-3 rounded-xl hover:bg-slate-700 hover:text-white transition-smooth font-medium border border-slate-600 disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:scale-105 transition-smooth neon-blue font-medium"
          >
            <Plus size={20} />
            Add Team Member
          </button>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member, index) => {
          // Ensure we have a unique identifier - use helper function
          const memberId = getMemberId(member, index);
          
          return (
            <div
              key={`member-card-${memberId}`}
              className="glass-card rounded-2xl p-6 hover-lift"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {member.name}
                    </h3>
                    {member.role && (
                      <p className="text-sm text-slate-400">{member.role}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(member)}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-smooth"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-smooth"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {member.email && (
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                  <Mail size={14} />
                  <span>{member.email}</span>
                </div>
              )}

              {member.skills && member.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {member.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-xs flex items-center gap-1"
                    >
                      <Award size={12} />
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-700/50 space-y-3">
                {/* Workload Status */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">Assigned Tasks</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getWorkloadColor(member)}`}>
                      {getWorkloadStatus(member)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getWorkloadBarColor(member)}`}
                      style={{ 
                        width: `${Math.min((member.taskCount || 0) * 25, 100)}%` // Visual representation: 0-4 tasks = 0-100%
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span className="font-medium text-white">{member.taskCount || 0} task{(member.taskCount || 0) !== 1 ? 's' : ''} assigned</span>
                    {member.completedCount > 0 && (
                      <span className="text-emerald-400">{member.completedCount} completed</span>
                    )}
                  </div>
                </div>

                {/* Assigned Tasks Button */}
                {member.assignedTasks && member.assignedTasks.length > 0 && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => openTasksModal(member)}
                      className="w-full flex items-center justify-center gap-2 text-sm text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 transition-smooth py-2.5 rounded-lg font-medium"
                    >
                      <FolderOpen size={16} />
                      <span>View Assigned Tasks ({member.assignedTasks.length})</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {teamMembers.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Users className="mx-auto text-slate-600 mb-4" size={64} />
          <h3 className="text-2xl font-bold text-white mb-2">No team members yet</h3>
          <p className="text-slate-400 mb-6">Add your first team member to start managing workload!</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:scale-105 transition-smooth neon-blue font-medium"
          >
            <Plus size={20} />
            Add Team Member
          </button>
        </div>
      )}

      {/* Workload Legend */}
      <div className="mt-8 glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Workload Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-emerald-500 rounded"></div>
            <div>
              <p className="text-white font-medium">Available</p>
              <p className="text-sm text-slate-400">Less than 70% capacity</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <div>
              <p className="text-white font-medium">High Load</p>
              <p className="text-sm text-slate-400">70-99% capacity</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <div>
              <p className="text-white font-medium">Overloaded</p>
              <p className="text-sm text-slate-400">100% or more capacity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Tasks Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeTasksModal}>
          <div className="glass-strong rounded-2xl p-6 max-w-3xl w-full mx-4 border border-slate-700/50 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/50">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Assigned Tasks - {selectedMember.name}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {selectedMember.assignedTasks && selectedMember.assignedTasks.length > 0 
                    ? `${selectedMember.assignedTasks.length} task${selectedMember.assignedTasks.length !== 1 ? 's' : ''} assigned`
                    : 'No tasks assigned'}
                </p>
              </div>
              <button
                onClick={closeTasksModal}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-smooth"
              >
                <XIcon size={24} />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto pr-2 min-h-0">
              {selectedMember.assignedTasks && selectedMember.assignedTasks.length > 0 ? (
                /* Group tasks by project */
                (() => {
                  const tasksByProject = {};
                  selectedMember.assignedTasks.forEach(task => {
                    if (task && task.projectId) {
                      if (!tasksByProject[task.projectId]) {
                        tasksByProject[task.projectId] = {
                          projectName: task.projectName || 'Unknown Project',
                          tasks: []
                        };
                      }
                      tasksByProject[task.projectId].tasks.push(task);
                    }
                  });
                  
                  const projectEntries = Object.entries(tasksByProject);
                  
                  if (projectEntries.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <FolderOpen size={48} className="mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400">No tasks found</p>
                      </div>
                    );
                  }
                  
                  return projectEntries.map(([projectId, projectData]) => (
                    <div key={projectId} className="mb-6 bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-3">
                        <FolderOpen size={18} className="text-blue-400" />
                        <span 
                          className="text-lg font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                          onClick={() => {
                            navigate(`/projects/${projectId}`);
                            closeTasksModal();
                          }}
                        >
                          {projectData.projectName}
                        </span>
                        <span className="text-sm text-slate-500">
                          ({projectData.tasks.length} task{projectData.tasks.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                      <div className="space-y-2 ml-8">
                        {projectData.tasks.map((task) => (
                          <div
                            key={task.taskId || Math.random()}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              task.completed 
                                ? 'bg-emerald-500/10 border border-emerald-500/20' 
                                : 'bg-slate-700/30 border border-slate-600/30'
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {task.completed && (
                                <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                              )}
                              <span 
                                className={`flex-1 ${
                                  task.completed 
                                    ? 'line-through text-slate-500' 
                                    : 'text-white'
                                }`}
                                title={task.taskName}
                              >
                                {task.taskName || 'Unnamed Task'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                              {task.priority && (
                                <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                              )}
                              {task.dueDate && (
                                <span className="text-slate-400 text-sm flex items-center gap-1">
                                  <Calendar size={14} />
                                  {formatDueDate(task.dueDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()
              ) : (
                <div className="text-center py-12">
                  <FolderOpen size={48} className="mx-auto text-slate-600 mb-4" />
                  <p className="text-slate-400 text-lg">No tasks assigned to this member</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-end">
              <button
                onClick={closeTasksModal}
                className="px-6 py-2.5 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 hover:text-white transition-smooth font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700/50 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingMember ? 'Edit Team Member' : 'Add Team Member'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-slate-300 font-medium mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
                  required
                  placeholder="John Doe"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-slate-300 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
                  placeholder="john@example.com"
                />
              </div>

              <div className="mb-4">
                <label className="block text-slate-300 font-medium mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
                  placeholder="Frontend Developer"
                />
              </div>

              <div className="mb-4">
                <label className="block text-slate-300 font-medium mb-2">
                  Capacity (max tasks)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 5 })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
                />
              </div>

              <div className="mb-6">
                <label className="block text-slate-300 font-medium mb-2">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
                  placeholder="React, TypeScript, Node.js"
                />
              </div>

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
                  {editingMember ? 'Update' : 'Add'} Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamOverview;
