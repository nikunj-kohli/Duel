import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

interface Participant {
  id: string;
  username: string;
  isActive: boolean;
}

interface Room {
  id: string;
  participants: Map<string, Participant>;
  code: string;
  language: string;
  problemId: string;
}

interface SocketUser {
  socketId: string;
  userId: string;
  username: string;
  roomId?: string;
}

const rooms = new Map<string, Room>();
const socketUsers = new Map<string, SocketUser>(); // socket.id -> user info

export function initializeSocketIO(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create-room', ({ roomId, userId, username }) => {
      const room: Room = {
        id: roomId,
        participants: new Map(),
        code: '',
        language: 'java',
        problemId: '1'
      };
      
      room.participants.set(userId, {
        id: userId,
        username,
        isActive: true
      });
      
      rooms.set(roomId, room);
      socket.join(roomId);
      
      // Track socket user
      socketUsers.set(socket.id, {
        socketId: socket.id,
        userId,
        username,
        roomId
      });
      
      socket.emit('room-joined', {
        roomId,
        participants: Array.from(room.participants.values())
      });
      
      console.log(`Room ${roomId} created by ${username} (socket: ${socket.id})`);
    });

    socket.on('join-room', ({ roomId, userId, username }) => {
      console.log(`Join-room event received: roomId=${roomId}, userId=${userId}, username=${username}, socket=${socket.id}`);
      const room = rooms.get(roomId);
      
      if (!room) {
        console.log(`Room ${roomId} not found`);
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      room.participants.set(userId, {
        id: userId,
        username,
        isActive: true
      });
      
      socket.join(roomId);
      
      // Track socket user
      socketUsers.set(socket.id, {
        socketId: socket.id,
        userId,
        username,
        roomId
      });
      
      // Notify all users in room
      io.to(roomId).emit('room-joined', {
        roomId,
        participants: Array.from(room.participants.values())
      });
      
      // Send current state to new user
      if (room.code) {
        socket.emit('code-change', {
          code: room.code,
          userId: 'system'
        });
      }
      
      socket.emit('language-change', {
        language: room.language,
        userId: 'system'
      });
      
      socket.emit('problem-change', {
        problemId: room.problemId,
        userId: 'system'
      });
      
      console.log(`${username} (${userId}) joined room ${roomId} (socket: ${socket.id})`);
    });

    socket.on('code-change', ({ roomId, code, userId }) => {
      const room = rooms.get(roomId);
      if (room) {
        room.code = code;
        socket.to(roomId).emit('code-change', { code, userId });
      }
    });

    socket.on('language-change', ({ roomId, language, userId }) => {
      const room = rooms.get(roomId);
      if (room) {
        room.language = language;
        socket.to(roomId).emit('language-change', { language, userId });
      }
    });

    socket.on('problem-change', ({ roomId, problemId, userId }) => {
      const room = rooms.get(roomId);
      if (room) {
        room.problemId = problemId;
        socket.to(roomId).emit('problem-change', { problemId, userId });
      }
    });

    socket.on('chat-message', ({ roomId, message }) => {
      socket.to(roomId).emit('chat-message', message);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      const socketUser = socketUsers.get(socket.id);
      if (socketUser && socketUser.roomId) {
        const room = rooms.get(socketUser.roomId);
        if (room) {
          room.participants.delete(socketUser.userId);
          
          if (room.participants.size === 0) {
            rooms.delete(socketUser.roomId);
            console.log(`Room ${socketUser.roomId} deleted (empty)`);
          } else {
            io.to(socketUser.roomId).emit('user-left', socketUser.userId);
          }
        }
      }
      
      socketUsers.delete(socket.id);
    });
  });

  return io;
}
