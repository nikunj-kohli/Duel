import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CodeEditor } from './CodeEditor';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Users, Video, VideoOff, Mic, MicOff, Send, Copy, Share2, Play } from "lucide-react";
import { io, Socket } from 'socket.io-client';
import { PROBLEMS } from "@/data/problems";

interface PairProgrammingProps {
  onBack: () => void;
  user: any;
}

interface Participant {
  id: string;
  username: string;
  isActive: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
}

export function PairProgramming({ onBack, user }: PairProgrammingProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [isInRoom, setIsInRoom] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([{
    id: user.id,
    username: user.username,
    isActive: true
  }]);
  const [code, setCode] = useState(PROBLEMS[0].templates.java);
  const [language, setLanguage] = useState("java");
  const [selectedProblem, setSelectedProblem] = useState(PROBLEMS[0]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  useEffect(() => {
    // Initialize Socket.IO connection (works in dev and docker)
    const baseUrl = window.location.origin;
    const newSocket = io(baseUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('Connected to server', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
      alert('Failed to connect to server. Make sure backend is running on port 3002');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
      alert(error.message || 'An error occurred');
    });

    newSocket.on('room-joined', (data: { roomId: string; participants: Participant[] }) => {
      console.log('Room joined:', data);
      setIsInRoom(true);
      setRoomId(data.roomId);
      setParticipants(data.participants);
    });

    newSocket.on('user-joined', (participant: Participant) => {
      setParticipants(prev => [...prev.filter(p => p.id !== participant.id), participant]);
    });

    newSocket.on('user-left', (userId: string) => {
      setParticipants(prev => prev.filter(p => p.id !== userId));
    });

    newSocket.on('code-change', (data: { code: string; userId: string }) => {
      if (data.userId !== user.id) {
        setCode(data.code);
      }
    });

    newSocket.on('language-change', (data: { language: string; userId: string }) => {
      if (data.userId !== user.id) {
        setLanguage(data.language);
      }
    });

    newSocket.on('problem-change', (data: { problemId: string; userId: string }) => {
      if (data.userId !== user.id && data.userId !== 'system') {
        const problem = PROBLEMS.find(p => p.id === data.problemId);
        if (problem) {
          setSelectedProblem(problem);
          const newCode = problem.templates[language as keyof typeof problem.templates];
          setCode(newCode);
        }
      }
    });

    newSocket.on('chat-message', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCreateRoom = () => {
    if (!socket || !socket.connected) {
      alert('Not connected to server. Please wait...');
      return;
    }
    const newRoomId = Math.random().toString(36).substring(2, 9);
    console.log('Creating room:', newRoomId);
    socket.emit('create-room', { roomId: newRoomId, userId: user.id, username: user.username });
    setRoomId(newRoomId);
  };

  const handleJoinRoom = () => {
    if (!socket || !socket.connected) {
      alert('Not connected to server. Please wait...');
      return;
    }
    if (!roomId.trim()) {
      alert('Please enter a room ID');
      return;
    }
    console.log('Joining room:', roomId.trim());
    socket.emit('join-room', { roomId: roomId.trim(), userId: user.id, username: user.username });
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (socket && isInRoom) {
      socket.emit('code-change', { roomId, code: newCode, userId: user.id });
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (socket && isInRoom) {
      socket.emit('language-change', { roomId, language: newLanguage, userId: user.id });
    }
  };

  const handleProblemChange = (problemId: string) => {
    const problem = PROBLEMS.find(p => p.id === problemId);
    if (problem) {
      setSelectedProblem(problem);
      const newCode = problem.templates[language as keyof typeof problem.templates];
      setCode(newCode);
      if (socket && isInRoom) {
        socket.emit('problem-change', { roomId, problemId, userId: user.id });
        socket.emit('code-change', { roomId, code: newCode, userId: user.id });
      }
    }
  };

  const handleSendMessage = () => {
    if (chatInput.trim() && socket && isInRoom) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        userId: user.id,
        username: user.username,
        message: chatInput.trim(),
        timestamp: new Date()
      };
      socket.emit('chat-message', { roomId, message });
      setChatInput("");
    }
  };

  const handleToggleAudio = async () => {
    if (!localStream) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setLocalStream(stream);
        setIsAudioEnabled(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    } else {
      localStream.getAudioTracks().forEach(track => track.enabled = !isAudioEnabled);
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const handleToggleVideo = async () => {
    if (!localStream) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
        setLocalStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsVideoEnabled(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    } else {
      localStream.getVideoTracks().forEach(track => track.enabled = !isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert('Room ID copied to clipboard!');
  };

  const handleShareRoom = () => {
    const url = `${window.location.origin}/pair-programming?room=${roomId}`;
    navigator.clipboard.writeText(url);
    alert('Room link copied to clipboard!');
  };

  if (!isInRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>Join or Create Room</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-muted-foreground">
                  {isConnected ? 'Connected' : 'Connecting...'}
                </span>
              </div>
              <div className="space-y-2">
                <label>Room ID</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter room ID or leave empty to create new"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && roomId.trim()) {
                        handleJoinRoom();
                      } else if (e.key === 'Enter' && !roomId.trim()) {
                        handleCreateRoom();
                      }
                    }}
                  />
                  <Button onClick={handleCreateRoom} disabled={!isConnected}>
                    Create Room
                  </Button>
                  <Button onClick={handleJoinRoom} disabled={!roomId.trim() || !isConnected}>
                    Join Room
                  </Button>
                </div>
              </div>
              {!isConnected && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Waiting for connection... Please wait
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Create a new room or join an existing one with a room ID from your friend
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Leave Room
          </Button>
          <div>
            <h1 className="text-xl font-bold">Pair Programming</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="cursor-pointer" onClick={handleCopyRoomId}>
                Room: {roomId}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleShareRoom}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isAudioEnabled ? "default" : "outline"}
            size="sm"
            onClick={handleToggleAudio}
          >
            {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          <Button
            variant={isVideoEnabled ? "default" : "outline"}
            size="sm"
            onClick={handleToggleVideo}
          >
            {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>
          <div className="flex items-center gap-2 ml-4">
            <Users className="h-4 w-4" />
            <span>{participants.length} participants</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem & Participants */}
        <div className="w-80 border-r bg-muted/20 flex flex-col">
          {/* Participants */}
          <Card className="m-2 mb-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Participants ({participants.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {participants.map(p => (
                  <div key={p.id} className={`flex items-center gap-2 p-2 rounded ${p.id === user.id ? 'bg-primary/10' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                      {p.username[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{p.username}</span>
                    {p.isActive && <Badge variant="success" className="ml-auto">Active</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Problem Selector */}
          <Card className="m-2 mb-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Problem</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedProblem.id}
                onChange={(e) => handleProblemChange(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                {PROBLEMS.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              <div className="mt-2 text-xs text-muted-foreground">
                <p className="font-semibold">{selectedProblem.title}</p>
                <Badge variant="outline" className="mt-1">{selectedProblem.difficulty}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Video */}
          {isVideoEnabled && (
            <Card className="m-2 mb-0">
              <CardContent className="p-2">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full rounded-md"
                  style={{ maxHeight: '200px' }}
                />
              </CardContent>
            </Card>
          )}

          {/* Chat */}
          <Card className="m-2 flex-1 flex flex-col min-h-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              <ScrollArea className="flex-1 mb-2">
                <div className="space-y-2">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`text-sm ${msg.userId === user.id ? 'text-right' : ''}`}>
                      <div className="font-semibold text-xs">{msg.username}</div>
                      <div className={`inline-block px-3 py-1 rounded-lg ${msg.userId === user.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="text-sm"
                />
                <Button size="sm" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="border-b bg-card p-2 flex items-center justify-between">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-1 rounded-md border border-input bg-background text-sm"
            >
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
            <Button size="sm">
              <Play className="h-4 w-4 mr-2" />
              Run Code
            </Button>
          </div>

          {/* Problem Description */}
          <div className="h-40 border-b bg-muted/20 overflow-auto p-4">
            <h3 className="font-bold mb-2">{selectedProblem.title}</h3>
            <p className="text-sm text-muted-foreground">{selectedProblem.description.substring(0, 300)}...</p>
          </div>

          {/* Code Editor */}
          <div className="flex-1 min-h-0">
            <CodeEditor
              language={language}
              value={code || selectedProblem.templates[language as keyof typeof selectedProblem.templates]}
              onChange={handleCodeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
