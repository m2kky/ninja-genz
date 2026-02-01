import axios from 'axios';

const SERVER_URL = 'http://localhost:3500';
const AGENT_NAME = 'antigravity';

// تسجيل على السيرفر
async function registerAgent() {
  try {
    const response = await axios.post(`${SERVER_URL}/agent/register`, {
      agent_name: AGENT_NAME
    });
    console.log('✅ Antigravity registered:', response.data);
  } catch (error) {
    console.error('❌ Registration failed:', error);
  }
}

// استقبال المهام الجديدة من Trae
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

// إرسال مهمة لـ Trae
async function sendTaskToTrae(taskType: string, description: string) {
  try {
    const response = await axios.post(`${SERVER_URL}/task/send`, {
      from: AGENT_NAME,
      to: 'trae',
      type: taskType,
      description: description
    });
    console.log(`✉️ Task sent to Trae: #${response.data.taskId}`);
    return response.data.taskId;
  } catch (error) {
    console.error('❌ Failed to send task:', error);
  }
}

// تحديث حالة مهمة
async function updateTaskStatus(taskId: number, status: string) {
  try {
    await axios.put(`${SERVER_URL}/task/${taskId}/status`, { status });
    console.log(`✅ Task #${taskId} updated to: ${status}`);
  } catch (error) {
    console.error('❌ Failed to update task:', error);
  }
}

// بدء الـ Agent
registerAgent();

// مثال: إرسال مهمة لـ Trae
sendTaskToTrae('create_table', 'Create tasks table in Supabase');

// فحص المهام كل 5 ثواني
setInterval(listenForTasks, 5000);
