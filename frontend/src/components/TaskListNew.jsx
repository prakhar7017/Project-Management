import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Check, Trash2, Sparkles, Lightbulb, Users, Loader } from 'lucide-react';
import { getProject, createTask, updateTask, deleteTask, generateTasks, getProjectInsights, getTeamMembers } from '../services/api';

const TaskList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState(null);
  const [insights, setInsights] = useState(null);
  const [generatingTasks, setGeneratingTasks] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [selectedMember, setSelectedMember] = useState('');

  useEffect(() => {
    fetchProject();
    fetchTeamMembers();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await getProject(id);
      setProject(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching project:', error);
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await getTeamMembers();
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      await updateTask(id, task.id, { completed: !task.completed });
      fetchProject();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await createTask(id, { name: newTaskName, assignedTo: assignedTo || undefined });
      setNewTaskName('');
      setAssignedTo('');
      setShowModal(false);
      fetchProject();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id, taskId);
        fetchProject();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleGenerateTasks = async () => {
    if (!project.description) {
      alert('Please add a project description first to generate tasks with AI!');
      return;
    }
    
    setGeneratingTasks(true);
    try {
      await generateTasks(id);
      fetchProject();
      alert('✨ AI generated tasks successfully!');
    } catch (error) {
      console.error('Error generating tasks:', error);
      alert('Failed to generate tasks. Make sure your OpenAI API key is configured.');
    } finally {
      setGeneratingTasks(false);
    }
  };

  const handleGetInsights = async () => {
    setLoadingInsights(true);
    try {
      const response = await getProjectInsights(id);
      setInsights(response.data);
      setShowInsights(true);
    } catch (error) {
      console.error('Error getting insights:', error);
      alert('Failed to get insights. Make sure your OpenAI API key is configured.');
    } finally {
      setLoadingInsights(false);
    }
  };

  const openAssignModal = (task) => {
    setTaskToAssign(task);
    setSelectedMember(task.assignedTo || '');
    setShowAssignModal(true);
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!taskToAssign) return;

    try {
      const assignedTo = selectedMember === '' ? null : selectedMember;
      await updateTask(id, taskToAssign.id, { assignedTo });
      await fetchProject();
      
      setShowAssignModal(false);
      setTaskToAssign(null);
      setSelectedMember('');
    } catch (error) {
      console.error('Error assigning task:', error);
      alert('Failed to assign task');
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

  if (!project) {
    return <div className="text-center py-12 text-slate-400">Project not found</div>;
  }

  const completedTasks = project.tasks?.filter(t => t.completed).length || 0;
  const totalTasks = project.tasks?.length || 0;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="max-w-6xl mx-auto relative z-10">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-smooth"
      >
        <ArrowLeft size={20} />
        Back to Projects
      </button>

      {/* Project Header */}
      <div className="glass-card rounded-2xl p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-3">{project.name}</h1>
            {project.description && (
              <p className="text-slate-400 text-lg">{project.description}</p>
            )}
          </div>
          
          {/* AI Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleGenerateTasks}
              disabled={generatingTasks}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl hover:scale-105 transition-smooth neon-purple font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingTasks ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Tasks with AI
                </>
              )}
            </button>
            
            <button
              onClick={handleGetInsights}
              disabled={loadingInsights}
              className="flex items-center gap-2 bg-slate-700/50 text-slate-300 px-5 py-2.5 rounded-xl hover:bg-slate-700 hover:text-white transition-smooth font-medium border border-slate-600 disabled:opacity-50"
            >
              {loadingInsights ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Lightbulb size={18} />
                  AI Insights
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Section */}
        <div className="flex items-center gap-6 mb-4">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${
            project.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
            project.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
            'bg-slate-500/20 text-slate-400 border-slate-500/30'
          }`}>
            {project.status}
          </span>
          <span className="text-slate-400">
            {completedTasks} of {totalTasks} tasks completed
          </span>
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span className="font-medium">Progress</span>
            <span className="font-bold text-white">{project.progress}%</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full progress-bar"
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* AI Insights Modal */}
      {showInsights && insights && (
        <div className="glass-card rounded-2xl p-6 mb-6 border-2 border-purple-500/30">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="text-purple-400" size={24} />
              <h3 className="text-xl font-bold text-white">AI Insights</h3>
            </div>
            <button
              onClick={() => setShowInsights(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-400 mb-2">Summary</h4>
              <p className="text-white">{insights.summary}</p>
            </div>
            
            {insights.recommendations?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-400 mb-2">Recommendations</h4>
                <ul className="space-y-2">
                  {insights.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm text-slate-400">Risk Level:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                insights.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                insights.riskLevel === 'high' ? 'bg-red-500/20 text-red-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {insights.riskLevel?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Section */}
      <div className="glass-card rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Tasks</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl hover:scale-105 transition-smooth neon-blue font-medium"
          >
            <Plus size={20} />
            Add Task
          </button>
        </div>

        {project.tasks?.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="mx-auto text-slate-600 mb-4" size={48} />
            <p className="text-slate-400 mb-4">No tasks yet. Add your first task or let AI generate them!</p>
            <button
              onClick={handleGenerateTasks}
              disabled={generatingTasks || !project.description}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:scale-105 transition-smooth neon-purple font-medium disabled:opacity-50"
            >
              <Sparkles size={20} />
              Generate Tasks with AI
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {project.tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-5 rounded-xl border-2 transition-smooth hover-lift ${
                  task.completed
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'glass-card border-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <button
                    onClick={() => handleToggleTask(task)}
                    className={`flex items-center justify-center w-7 h-7 rounded-full border-2 transition-smooth ${
                      task.completed
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-slate-500 hover:border-blue-500'
                    }`}
                  >
                    {task.completed && <Check size={18} className="text-white" />}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className={`text-lg font-medium ${
                          task.completed
                            ? 'line-through text-slate-500'
                            : 'text-white'
                        }`}
                      >
                        {task.name}
                      </span>
                      {task.aiGenerated && (
                        <span className="ai-badge px-2 py-0.5 rounded-full text-xs text-white font-semibold flex items-center gap-1">
                          <Sparkles size={12} />
                          AI
                        </span>
                      )}
                      {task.priority && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      {task.assignedTo ? (
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>{task.assignedTo}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                      {task.estimatedHours && (
                        <span>⏱️ {task.estimatedHours}h</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openAssignModal(task)}
                    className="flex items-center gap-1 px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-slate-700/50 rounded-lg transition-smooth text-sm font-medium"
                  >
                    <Users size={16} />
                    {task.assignedTo ? 'Reassign' : 'Assign'}
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-slate-400 hover:text-red-400 transition-smooth p-2 hover:bg-slate-700/50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700/50">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Task</h2>
            <form onSubmit={handleAddTask}>
              <div className="mb-5">
                <label className="block text-slate-300 font-medium mb-2">
                  Task Name
                </label>
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
                  required
                  autoFocus
                  placeholder="Enter task name"
                />
              </div>
              <div className="mb-6">
                <label className="block text-slate-300 font-medium mb-2">
                  Assign To (Optional)
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
                >
                  <option value="">-- Select Team Member --</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.name} {member.role ? `(${member.role})` : ''}
                    </option>
                  ))}
                </select>
                {teamMembers.length === 0 && (
                  <p className="text-sm text-slate-400 mt-2">
                    No team members found. <a href="/team" className="text-blue-400 hover:underline">Add team members</a> first.
                  </p>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setNewTaskName('');
                    setAssignedTo('');
                  }}
                  className="px-6 py-3 text-slate-300 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-smooth font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl hover:scale-105 transition-smooth neon-blue font-medium"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showAssignModal && taskToAssign && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700/50">
            <h2 className="text-2xl font-bold text-white mb-4">
              {taskToAssign.assignedTo ? 'Reassign Task' : 'Assign Task'}
            </h2>
            <div className="mb-6">
              <p className="text-slate-400 mb-2">Task:</p>
              <p className="text-white font-medium">{taskToAssign.name}</p>
            </div>
            <form onSubmit={handleAssignTask}>
              <div className="mb-6">
                <label className="block text-slate-300 font-medium mb-2">
                  Assign To
                </label>
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
                  autoFocus
                >
                  <option value="">-- Unassign / Select Member --</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.name} {member.role ? `(${member.role})` : ''}
                    </option>
                  ))}
                </select>
                {teamMembers.length === 0 && (
                  <p className="text-sm text-slate-400 mt-2">
                    No team members found. <a href="/team" className="text-blue-400 hover:underline">Add team members</a> first.
                  </p>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setTaskToAssign(null);
                    setSelectedMember('');
                  }}
                  className="px-6 py-3 text-slate-300 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-smooth font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl hover:scale-105 transition-smooth neon-blue font-medium"
                >
                  {selectedMember ? 'Assign' : 'Unassign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
