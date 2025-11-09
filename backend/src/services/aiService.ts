import OpenAI from 'openai';

// Check if API key is available
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY not found in environment variables. AI features will be disabled.');
  console.warn('   Add your OpenAI API key to the .env file to enable AI features.');
}

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export interface AITaskSuggestion {
  name: string;
  priority: 'low' | 'medium' | 'high';
  estimatedHours: number;
}

export interface AIInsight {
  summary: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface WorkloadRecommendation {
  teamMember: string;
  taskId: string;
  taskName: string;
  reason: string;
}

// Generate tasks based on project description
export const generateTasksFromDescription = async (
  projectName: string,
  projectDescription: string
): Promise<AITaskSuggestion[]> => {
  if (!openai) {
    console.log('AI features disabled - returning empty task list');
    return [];
  }
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a project management expert. Generate a list of specific, actionable tasks for a project. Return ONLY a valid JSON array of tasks with 'name', 'priority' (low/medium/high), and 'estimatedHours' fields. No markdown, no code blocks, just pure JSON array."
        },
        {
          role: "user",
          content: `Project: ${projectName}\nDescription: ${projectDescription}\n\nGenerate 5-8 specific tasks for this project.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    let content = completion.choices[0]?.message?.content || '[]';
    
    // Remove markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const tasks = JSON.parse(content);
    return tasks;
  } catch (error) {
    console.error('Error generating tasks:', error);
    return [];
  }
};

// Analyze project health and provide insights
export const analyzeProjectHealth = async (
  projectName: string,
  totalTasks: number,
  completedTasks: number,
  teamSize: number
): Promise<AIInsight> => {
  if (!openai) {
    return {
      summary: "AI features are disabled. Add OpenAI API key to enable insights.",
      recommendations: [],
      riskLevel: "medium"
    };
  }
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a project management analyst. Analyze project metrics and provide insights. Return ONLY valid JSON with 'summary', 'recommendations' (array), and 'riskLevel' (low/medium/high). No markdown, no code blocks, just pure JSON."
        },
        {
          role: "user",
          content: `Project: ${projectName}\nTotal Tasks: ${totalTasks}\nCompleted: ${completedTasks}\nTeam Size: ${teamSize}\n\nAnalyze this project's health.`
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    let content = completion.choices[0]?.message?.content || '{"summary":"Unable to analyze","recommendations":[],"riskLevel":"medium"}';
    
    // Remove markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const insight = JSON.parse(content);
    return insight;
  } catch (error) {
    console.error('Error analyzing project:', error);
    return {
      summary: "Analysis unavailable",
      recommendations: [],
      riskLevel: "medium"
    };
  }
};

// Smart workload balancing
export const recommendTaskAssignment = async (
  taskName: string,
  teamMembers: Array<{ name: string; taskCount: number; capacity: number; skills?: string[] }>
): Promise<string> => {
  if (!openai) {
    return teamMembers[0]?.name || '';
  }
  
  try {
    const teamInfo = teamMembers.map(m => 
      `${m.name}: ${m.taskCount}/${m.capacity} tasks${m.skills ? `, Skills: ${m.skills.join(', ')}` : ''}`
    ).join('\n');

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a team workload optimizer. Recommend the best team member for a task based on current workload and skills. Return ONLY the team member's name, nothing else."
        },
        {
          role: "user",
          content: `Task: ${taskName}\n\nTeam Members:\n${teamInfo}\n\nWho should be assigned this task?`
        }
      ],
      temperature: 0.5,
      max_tokens: 50
    });

    return completion.choices[0]?.message?.content?.trim() || teamMembers[0]?.name || '';
  } catch (error) {
    console.error('Error recommending assignment:', error);
    return teamMembers[0]?.name || '';
  }
};

// AI Chat Assistant
export const chatWithAI = async (
  message: string,
  context?: string
): Promise<string> => {
  if (!openai) {
    return "AI chat is currently disabled. Please add your OpenAI API key to the .env file to enable this feature.";
  }
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful project management assistant. Help users with project planning, task management, and team coordination. ${context ? `Context: ${context}` : ''}`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error('Error in AI chat:', error);
    return "I'm having trouble connecting right now. Please try again.";
  }
};

// Estimate task completion time
export const estimateTaskDuration = async (
  taskName: string,
  projectContext?: string
): Promise<number> => {
  if (!openai) {
    return 4; // Default estimate
  }
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a project estimation expert. Estimate task duration in hours. Return ONLY a number (the hours), nothing else."
        },
        {
          role: "user",
          content: `Task: ${taskName}${projectContext ? `\nProject Context: ${projectContext}` : ''}\n\nEstimate hours needed:`
        }
      ],
      temperature: 0.5,
      max_tokens: 10
    });

    const hours = parseFloat(completion.choices[0]?.message?.content || '4');
    return isNaN(hours) ? 4 : hours;
  } catch (error) {
    console.error('Error estimating duration:', error);
    return 4;
  }
};
