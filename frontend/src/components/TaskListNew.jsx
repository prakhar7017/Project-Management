import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Check, Trash2, Sparkles, Lightbulb, Users, Loader, Calendar, Clock, Zap, RefreshCw } from 'lucide-react';
import { getProject, createTask, updateTask, deleteTask, generateTasks, getProjectInsights, getTeamMembers, autoAssignTask, autoUpdatePriorities } from '../services/api';
import { useToastContext } from '../contexts/ToastContext';

const TaskList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToastContext();
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
  const [dueDate, setDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [editingTaskDueDate, setEditingTaskDueDate] = useState(null);
  const [showDueDateModal, setShowDueDateModal] = useState(false);
  const [taskDueDate, setTaskDueDate] = useState('');
  const [editingTaskPriority, setEditingTaskPriority] = useState(null);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [taskPriorityValue, setTaskPriorityValue] = useState('medium');
  const [autoAssigning, setAutoAssigning] = useState(null);
  const [updatingPriorities, setUpdatingPriorities] = useState(false);

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
      toast.error('Failed to load project. Please try again.');
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await getTeamMembers();
      setTeamMembers(response.data);
    } catch (error) {
    }
  };

  const handleToggleTask = async (task) => {
    try {
      await updateTask(id, task.id, { completed: !task.completed });
      toast.success(task.completed ? 'Task marked as incomplete' : 'Task completed!');
      await fetchProject();
      if (task.assignedTo) {
        await fetchTeamMembers();
      }
    } catch (error) {
      toast.error('Failed to update task. Please try again.');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await createTask(id, { 
        name: newTaskName, 
        assignedTo: assignedTo || undefined,
        dueDate: dueDate || undefined,
        priority: taskPriority || undefined
      });
      toast.success('Task created successfully!');
      setNewTaskName('');
      setAssignedTo('');
      setDueDate('');
      setTaskPriority('medium');
      setShowModal(false);
      fetchProject();
    } catch (error) {
      toast.error('Failed to create task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id, taskId);
        toast.success('Task deleted successfully!');
        fetchProject();
      } catch (error) {
        toast.error('Failed to delete task. Please try again.');
      }
    }
  };

  const handleGenerateTasks = async () => {
    if (!project.description) {
      toast.warning('Please add a project description first to generate tasks with AI!');
      return;
    }
    
    setGeneratingTasks(true);
    try {
      await generateTasks(id);
      toast.success('✨ AI generated tasks successfully!');
      fetchProject();
    } catch (error) {
      toast.error('Failed to generate tasks. Make sure your OpenAI API key is configured.');
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
      toast.success('AI insights generated!');
    } catch (error) {
      toast.error('Failed to get insights. Make sure your OpenAI API key is configured.');
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
      toast.success(assignedTo ? `Task assigned to ${assignedTo}` : 'Task unassigned');
      await fetchProject();
      await fetchTeamMembers();
      
      setShowAssignModal(false);
      setTaskToAssign(null);
      setSelectedMember('');
    } catch (error) {
      toast.error('Failed to assign task. Please try again.');
    }
  };

  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'today';
    if (diffDays <= 3) return 'soon';
    return 'upcoming';
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const openDueDateModal = (task) => {
    setEditingTaskDueDate(task);
    setTaskDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setShowDueDateModal(true);
  };

  const openPriorityModal = (task) => {
    setEditingTaskPriority(task);
    setTaskPriorityValue(task.priority || 'medium');
    setShowPriorityModal(true);
  };

  const handleUpdatePriority = async (e) => {
    e.preventDefault();
    if (!editingTaskPriority) return;

    try {
      await updateTask(id, editingTaskPriority.id, { priority: taskPriorityValue || undefined });
      toast.success('Priority updated successfully!');
      setShowPriorityModal(false);
      setEditingTaskPriority(null);
      setTaskPriorityValue('medium');
      fetchProject();
    } catch (error) {
      toast.error('Failed to update priority. Please try again.');
    }
  };

  const handleUpdateDueDate = async (e) => {
    e.preventDefault();
    if (!editingTaskDueDate) return;

    try {
      await updateTask(id, editingTaskDueDate.id, { dueDate: taskDueDate || undefined });
      toast.success('Due date updated successfully!');
      setShowDueDateModal(false);
      setEditingTaskDueDate(null);
      setTaskDueDate('');
      fetchProject();
    } catch (error) {
      toast.error('Failed to update due date. Please try again.');
    }
  };

  const handleAutoAssign = async (task) => {
    if (task.completed) {
      toast.warning('Cannot auto-assign completed tasks');
      return;
    }

    setAutoAssigning(task.id);
    try {
      const response = await autoAssignTask(id, task.id);
      if (response.data.success) {
        toast.success(`✨ Task auto-assigned to ${response.data.assignedTo}!`);
        await fetchProject();
        await fetchTeamMembers();
      } else {
        toast.error(response.data.message || 'Failed to auto-assign task');
      }
    } catch (error) {
      toast.error('Failed to auto-assign task. Please try again.');
    } finally {
      setAutoAssigning(null);
    }
  };

  const handleAutoUpdatePriorities = async () => {
    setUpdatingPriorities(true);
    try {
      const response = await autoUpdatePriorities(id);
      if (response.data.success) {
        toast.success(`✨ Updated priority for ${response.data.updatedCount} task(s) based on due dates!`);
        await fetchProject();
      } else {
        toast.error('Failed to update priorities');
      }
    } catch (error) {
      toast.error('Failed to update priorities. Please try again.');
    } finally {
      setUpdatingPriorities(false);
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

      <div className="glass-card rounded-2xl p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-3">{project.name}</h1>
            {project.description && (
              <p className="text-slate-400 text-lg">{project.description}</p>
            )}
          </div>
          
          <div className="flex gap-3 flex-wrap">
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

            <button
              onClick={handleAutoUpdatePriorities}
              disabled={updatingPriorities}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl hover:scale-105 transition-smooth font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="Auto-update task priorities based on due dates"
            >
              {updatingPriorities ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  Update Priorities
                </>
              )}
            </button>
          </div>
        </div>

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
                      <button
                        onClick={() => openPriorityModal(task)}
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold border hover:opacity-80 transition-smooth ${getPriorityColor(task.priority || 'medium')}`}
                        title="Click to edit priority"
                      >
                        {task.priority || 'medium'}
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
                      {task.assignedTo ? (
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>{task.assignedTo}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                      {task.estimatedHours && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{task.estimatedHours}h</span>
                        </div>
                      )}
                      {task.dueDate ? (
                        <button
                          onClick={() => openDueDateModal(task)}
                          className={`flex items-center gap-1 hover:opacity-80 transition-smooth ${
                            getDueDateStatus(task.dueDate) === 'overdue' ? 'text-red-400' :
                            getDueDateStatus(task.dueDate) === 'today' ? 'text-yellow-400' :
                            getDueDateStatus(task.dueDate) === 'soon' ? 'text-orange-400' :
                            'text-blue-400'
                          }`}
                          title="Click to edit due date"
                        >
                          <Calendar size={14} />
                          <span className="font-medium">
                            {formatDueDate(task.dueDate)}
                            {getDueDateStatus(task.dueDate) === 'overdue' && ' (Overdue)'}
                            {getDueDateStatus(task.dueDate) === 'today' && ' (Today)'}
                            {getDueDateStatus(task.dueDate) === 'soon' && ' (Soon)'}
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openDueDateModal(task)}
                          className="flex items-center gap-1 text-slate-500 hover:text-blue-400 transition-smooth text-sm"
                          title="Add due date"
                        >
                          <Calendar size={14} />
                          <span>Add due date</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!task.completed && (
                    <button
                      onClick={() => handleAutoAssign(task)}
                      disabled={autoAssigning === task.id}
                      className="flex items-center gap-1 px-3 py-2 text-purple-400 hover:text-purple-300 hover:bg-slate-700/50 rounded-lg transition-smooth text-sm font-medium disabled:opacity-50"
                      title="Auto-assign to best team member"
                    >
                      {autoAssigning === task.id ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <>
                          <Zap size={16} />
                          Auto-Assign
                        </>
                      )}
                    </button>
                  )}
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
              <div className="mb-5">
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
              <div className="mb-5">
                <label className="block text-slate-300 font-medium mb-2">
                  Priority (Optional)
                </label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-slate-300 font-medium mb-2">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setNewTaskName('');
                    setAssignedTo('');
                    setDueDate('');
                    setTaskPriority('medium');
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
                  {teamMembers.map((member) => {
                    const currentTaskCount = (member.taskCount || 0) - (taskToAssign.assignedTo === member.name ? 1 : 0);
                    const workloadText = currentTaskCount > 0 ? ` (${currentTaskCount} task${currentTaskCount !== 1 ? 's' : ''})` : '';
                    return (
                      <option key={member.id} value={member.name}>
                        {member.name} {member.role ? `(${member.role})` : ''}{workloadText}
                      </option>
                    );
                  })}
                </select>
                {selectedMember && (
                  <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    {(() => {
                      const member = teamMembers.find(m => m.name === selectedMember);
                      if (!member) return null;
                      const currentTaskCount = (member.taskCount || 0) - (taskToAssign.assignedTo === member.name ? 1 : 0);
                      const newTaskCount = taskToAssign.assignedTo === selectedMember ? currentTaskCount : currentTaskCount + 1;
                      const workloadLevel = newTaskCount >= 3 ? 'high' : newTaskCount === 2 ? 'medium' : 'no';
                      return (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Current tasks:</span>
                            <span className="text-white font-medium">{currentTaskCount}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">After assignment:</span>
                            <span className={`font-medium ${
                              workloadLevel === 'high' ? 'text-red-400' :
                              workloadLevel === 'medium' ? 'text-orange-400' :
                              'text-emerald-400'
                            }`}>
                              {newTaskCount} {workloadLevel === 'high' ? '(High Workload)' : workloadLevel === 'medium' ? '(Medium Workload)' : '(No Workload)'}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
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

      {showPriorityModal && editingTaskPriority && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700/50">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editingTaskPriority.aiGenerated ? 'Edit Priority - AI Task' : 'Edit Priority'}
            </h2>
            <div className="mb-6">
              <p className="text-slate-400 mb-2">Task:</p>
              <p className="text-white font-medium">{editingTaskPriority.name}</p>
              {editingTaskPriority.aiGenerated && (
                <p className="text-sm text-purple-400 mt-1 flex items-center gap-1">
                  <Sparkles size={14} />
                  AI Generated Task
                </p>
              )}
            </div>
            <form onSubmit={handleUpdatePriority}>
              <div className="mb-6">
                <label className="block text-slate-300 font-medium mb-2">
                  Priority
                </label>
                <select
                  value={taskPriorityValue}
                  onChange={(e) => setTaskPriorityValue(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
                  autoFocus
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400 mb-2">Priority Levels:</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded border ${getPriorityColor('high')}`}>High</span>
                      <span className="text-slate-400">Urgent tasks, tight deadlines</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded border ${getPriorityColor('medium')}`}>Medium</span>
                      <span className="text-slate-400">Normal priority tasks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded border ${getPriorityColor('low')}`}>Low</span>
                      <span className="text-slate-400">Can be done later</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowPriorityModal(false);
                    setEditingTaskPriority(null);
                    setTaskPriorityValue('medium');
                  }}
                  className="px-6 py-3 text-slate-300 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-smooth font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl hover:scale-105 transition-smooth neon-blue font-medium"
                >
                  Save Priority
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDueDateModal && editingTaskDueDate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700/50">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editingTaskDueDate.aiGenerated ? 'Set Due Date for AI Task' : 'Set Due Date'}
            </h2>
            <div className="mb-6">
              <p className="text-slate-400 mb-2">Task:</p>
              <p className="text-white font-medium">{editingTaskDueDate.name}</p>
              {editingTaskDueDate.aiGenerated && (
                <p className="text-sm text-purple-400 mt-1 flex items-center gap-1">
                  <Sparkles size={14} />
                  AI Generated Task
                </p>
              )}
            </div>
            <form onSubmit={handleUpdateDueDate}>
              <div className="mb-6">
                <label className="block text-slate-300 font-medium mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-smooth"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowDueDateModal(false);
                    setEditingTaskDueDate(null);
                    setTaskDueDate('');
                  }}
                  className="px-6 py-3 text-slate-300 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-smooth font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl hover:scale-105 transition-smooth neon-blue font-medium"
                >
                  Save
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
