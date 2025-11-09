import { useState, useEffect } from 'react';
import { Users, AlertCircle, Plus, Edit2, Trash2, Mail, Award, RefreshCw } from 'lucide-react';
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from '../services/api';

const TeamOverview = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
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
      } else {
        await createTeamMember(memberData);
      }
      
      fetchTeamMembers();
      closeModal();
    } catch (error) {
      console.error('Error saving team member:', error);
      alert('Failed to save team member');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        await deleteTeamMember(id);
        fetchTeamMembers();
      } catch (error) {
        console.error('Error deleting team member:', error);
      }
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
        {teamMembers.map((member) => {
          return (
            <div
              key={member.id}
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

              <div className="pt-3 border-t border-slate-700/50">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Max Capacity</span>
                  <span className="font-semibold text-blue-400">
                    {member.capacity} tasks
                  </span>
                </div>
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
