import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Projects
export const getProjects = () => api.get('/projects');
export const getProject = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// AI Features
export const generateTasks = (projectId) => api.post(`/projects/${projectId}/generate-tasks`);
export const getProjectInsights = (projectId) => api.get(`/projects/${projectId}/insights`);
export const recommendAssignment = (projectId, taskId) => api.post(`/projects/${projectId}/tasks/${taskId}/recommend-assignment`);
export const chatWithAI = (message, projectId) => api.post('/projects/ai/chat', { message, projectId });

// Tasks
export const getProjectTasks = (projectId) => api.get(`/projects/${projectId}/tasks`);
export const createTask = (projectId, data) => api.post(`/projects/${projectId}/tasks`, data);
export const updateTask = (projectId, taskId, data) => api.put(`/projects/${projectId}/tasks/${taskId}`, data);
export const deleteTask = (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`);

// Team
export const getTeamMembers = () => api.get('/team');
export const getTeamMember = (id) => api.get(`/team/${id}`);
export const createTeamMember = (data) => api.post('/team', data);
export const updateTeamMember = (id, data) => api.put(`/team/${id}`, data);
export const deleteTeamMember = (id) => api.delete(`/team/${id}`);

export default api;
