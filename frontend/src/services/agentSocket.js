import { io } from 'socket.io-client';

let agentSocket = null;

export const initAgentSocket = () => {
  if (agentSocket) return agentSocket;

  const agentUrl = import.meta.env.VITE_AGENT_URL || 'http://localhost:5005';
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

export const connectAgentSocket = () => {
  const token = localStorage.getItem('authToken');
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
