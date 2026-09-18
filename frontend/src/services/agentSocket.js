import { io } from 'socket.io-client';

let agentSocket = null;

export const getAgentUrl = () => {
  const envUrl = import.meta.env.VITE_AGENT_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl.replace(/\/$/, '');
  }
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return 'https://swasthyalink-agent.onrender.com';
  }
  return (envUrl || 'http://localhost:5005').replace(/\/$/, '');
};

export const initAgentSocket = () => {
  if (agentSocket) return agentSocket;

  const agentUrl = getAgentUrl();
  const token = localStorage.getItem('authToken');
  agentSocket = io(agentUrl, {
    withCredentials: true,
    auth: {
      token: token || undefined,
    },
    extraHeaders: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
    autoConnect: false,
    transports: ['websocket', 'polling'],
  });

  agentSocket.on('connect', () => {
    console.log('✅ Agent Socket connected:', agentSocket.id);
  });

  agentSocket.on('disconnect', (reason) => {
    console.log('❌ Agent Socket disconnected:', reason);
  });

  agentSocket.on('connect_error', (error) => {
    console.error('🔴 Agent Socket connection error:', error.message);
  });

  return agentSocket;
};

export const connectAgentSocket = (explicitToken) => {
  const token = explicitToken || localStorage.getItem('authToken');
  if (!agentSocket) {
    agentSocket = initAgentSocket();
  }
  if (token) {
    agentSocket.auth = { token };
  }
  if (!agentSocket.connected) {
    agentSocket.connect();
  }
  return agentSocket;
};

export const disconnectAgentSocket = () => {
  if (agentSocket && agentSocket.connected) {
    agentSocket.disconnect();
    console.log('🔌 Agent Socket disconnected');
  }
};

export const getAgentSocket = () => agentSocket;

export default {
  initAgentSocket,
  connectAgentSocket,
  disconnectAgentSocket,
  getAgentSocket,
};
