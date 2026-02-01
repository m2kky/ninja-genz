import axios from 'axios';

const SERVER_URL = 'http://localhost:3500';
const AGENT_NAME = 'trae';

async function registerAgent() {
  try {
    const response = await axios.post(`${SERVER_URL}/agent/register`, {
      agent_name: AGENT_NAME
    });
    console.log('✅ Trae registered:', response.data);
  } catch (error) {
    console.error('❌ Registration failed:', error);
  }
}

async function listenForTasks() {
  try {
    const response = await axios.get(`${SERVER_URL}/tasks/${AGENT_NAME}`);
    console.log('📋 My tasks:', response.data.tasks);
    return response.data.tasks;
  } catch (error) {
    console.error('❌ Failed to fetch tasks:', error);
    return [];
  }
}

async function sendTaskToAntigravity(taskType: string, description: string) {
  try {
    const response = await axios.post(`${SERVER_URL}/task/send`, {
      from: AGENT_NAME,
      to: 'antigravity',
      type: taskType,
      description: description
    });
    console.log(`✉️ Task sent to Antigravity: #${response.data.taskId}`);
    return response.data.taskId;
  } catch (error) {
    console.error('❌ Failed to send task:', error);
  }
}

async function updateTaskStatus(taskId: number, status: string) {
  try {
    await axios.put(`${SERVER_URL}/task/${taskId}/status`, { status });
    console.log(`✅ Task #${taskId} updated to: ${status}`);
  } catch (error) {
    console.error('❌ Failed to update task:', error);
  }
}

registerAgent();

// مثال: إرسال مهمة لـ Antigravity
sendTaskToAntigravity('build_ui', 'Build Task Dashboard component');

setInterval(listenForTasks, 5000);
