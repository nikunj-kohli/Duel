import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CodeEditor } from './CodeEditor';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Video, VideoOff, Mic, MicOff, Send, Copy, Share2, Play, CheckCircle2, Wifi, WifiOff, AlertCircle } from "lucide-react";
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
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState(PROBLEMS[0].templates.java);
  const [language, setLanguage] = useState("java");
  const [selectedProblem, setSelectedProblem] = useState(PROBLEMS[0]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const [videoPosition, setVideoPosition] = useState({ 
    x: Math.max(450, window.innerWidth - 450), 
    y: Math.max(100, window.innerHeight * 0.1) 
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const videoWindowRef = useRef<HTMLDivElement>(null);
  const [audioLevels, setAudioLevels] = useState<Map<string, number>>(new Map());
  const audioAnalyserRef = useRef<Map<string, AnalyserNode>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callRequestFrom, setCallRequestFrom] = useState<{ userId: string; username: string } | null>(null);
  const [isCallRequestPending, setIsCallRequestPending] = useState(false);
  const [isVideoWindowMinimized, setIsVideoWindowMinimized] = useState(false);
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadFriends();
  }, [user.id]);

  const loadFriends = async () => {
    try {
      const response = await fetch(`http://localhost:3002/api/users/friends/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const newSocket = io('http://localhost:3002', {
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
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
    });

    newSocket.on('room-joined', (data: { roomId: string; participants: Participant[] }) => {
      console.log('Room joined:', data);
      setIsInRoom(true);
      setRoomId(data.roomId);
      setParticipants(data.participants);
    });

    newSocket.on('user-joined', (participant: Participant) => {
      console.log(`User joined: ${participant.username} (${participant.id})`);
      setParticipants(prev => [...prev.filter(p => p.id !== participant.id), participant]);
      // Initialize peer connection when new user joins
      if (isInRoom) {
        setTimeout(() => {
          if (localStream) {
            initiatePeerConnections();
          } else {
            // Even without local stream, create connections so we can receive their stream
            initiatePeerConnections();
          }
        }, 1500);
      }
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
      console.log('Received chat message:', message);
      setChatMessages(prev => {
        // Avoid duplicates
        if (prev.find(m => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
    });

    // Sync run/submit results
    newSocket.on('code-run', (data: { output: string; userId: string }) => {
      if (data.userId !== user.id) {
        setOutput(data.output);
      }
    });

    newSocket.on('code-submit', (data: { result: any; output: string; userId: string }) => {
      if (data.userId !== user.id) {
        setOutput(data.output);
        setSubmissionResult(data.result);
      }
    });

    // WebRTC signaling
    newSocket.on('offer', async (data: { offer: RTCSessionDescriptionInit; fromUserId: string }) => {
      await handleOffer(data.offer, data.fromUserId);
    });

    newSocket.on('answer', async (data: { answer: RTCSessionDescriptionInit; fromUserId: string }) => {
      await handleAnswer(data.answer, data.fromUserId);
    });

    newSocket.on('ice-candidate', async (data: { candidate: RTCIceCandidateInit; fromUserId: string }) => {
      await handleIceCandidate(data.candidate, data.fromUserId);
    });

    // Call request handlers
    newSocket.on('call-request', (data: { fromUserId: string; fromUsername: string }) => {
      console.log('Call request received from:', data.fromUsername);
      setCallRequestFrom({ userId: data.fromUserId, username: data.fromUsername });
    });

    newSocket.on('call-accepted', async (data: { byUserId: string; byUsername: string }) => {
      console.log('Call accepted by:', data.byUsername);
      // Clear timeout
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
      setIsCallRequestPending(false);
      setIsCallActive(true);
      setCallRequestFrom(null); // Clear any pending request
      // Start audio automatically when call is accepted
      if (!isAudioEnabled) {
        await handleToggleAudio();
      }
    });

    newSocket.on('call-rejected', (data: { byUserId: string; byUsername: string }) => {
      console.log('Call rejected by:', data.byUsername);
      // Clear timeout
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
      setIsCallRequestPending(false);
      alert(`Call rejected by ${data.byUsername}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      // Clear call timeout
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
    };
  }, []);

  const handleCreateRoom = () => {
    if (!socket || !socket.connected) {
      alert('Not connected to server. Please wait...');
      return;
    }
    const newRoomId = Math.random().toString(36).substring(2, 9);
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
    const trimmedInput = chatInput.trim();
    if (!trimmedInput) {
      return;
    }
    
    if (!socket || !socket.connected) {
      alert('Not connected to server. Please wait...');
      return;
    }
    
    if (!isInRoom) {
      alert('You must be in a room to send messages');
      return;
    }
    
    console.log('Sending chat message:', trimmedInput, 'to room:', roomId);
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      message: trimmedInput,
      timestamp: new Date()
    };
    
    // Add message to local state immediately for better UX
    setChatMessages(prev => [...prev, message]);
    setChatInput("");
    
    // Send to server
    console.log('Emitting chat-message to room:', roomId);
    socket.emit('chat-message', { roomId, message });
  };

  const handleToggleAudio = async () => {
    if (!isAudioEnabled) {
      try {
        let stream = localStream;
        if (!stream) {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideoEnabled });
          setLocalStream(stream);
          if (isVideoEnabled && videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
          // Add audio track to existing stream
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          audioStream.getAudioTracks().forEach(track => {
            localStream.addTrack(track);
            // Share with peers
            peersRef.current.forEach(peer => {
              peer.addTrack(track, localStream);
            });
          });
        }
        setIsAudioEnabled(true);
        // Signal to peers
        if (socket && isInRoom) {
          socket.emit('media-toggle', { roomId, userId: user.id, type: 'audio', enabled: true });
        }
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    } else {
      if (localStream) {
        localStream.getAudioTracks().forEach(track => {
          track.stop();
          localStream.removeTrack(track);
        });
        // Remove from peers
        peersRef.current.forEach(peer => {
          const sender = peer.getSenders().find(s => s.track && s.track.kind === 'audio');
          if (sender) peer.removeTrack(sender);
        });
      }
      setIsAudioEnabled(false);
      if (socket && isInRoom) {
        socket.emit('media-toggle', { roomId, userId: user.id, type: 'audio', enabled: false });
      }
    }
  };

  const handleToggleVideo = async () => {
    if (!isVideoEnabled) {
      try {
        let stream = localStream;
        if (!stream) {
          // Create new stream with both audio and video
          stream = await navigator.mediaDevices.getUserMedia({ 
            audio: isAudioEnabled, 
            video: { width: 640, height: 480 } 
          });
          setLocalStream(stream);
          
          // Setup audio analyser for local stream
          if (isAudioEnabled && stream.getAudioTracks().length > 0) {
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            audioAnalyserRef.current.set(user.id, analyser);
          }
          
          // Add tracks to existing peer connections
          peersRef.current.forEach(peer => {
            stream.getTracks().forEach(track => {
              const sender = peer.getSenders().find(s => s.track && s.track.kind === track.kind);
              if (!sender) {
                peer.addTrack(track, stream);
              }
            });
          });
          
          // If no peer connections exist, create them
          if (peersRef.current.size === 0 && isInRoom && participants.length > 1) {
            setTimeout(() => initiatePeerConnections(), 500);
          }
        } else {
          // Add video track to existing stream
          const videoStream = await navigator.mediaDevices.getUserMedia({ 
            audio: false, 
            video: { width: 640, height: 480 } 
          });
          videoStream.getVideoTracks().forEach(track => {
            localStream.addTrack(track);
            // Share with peers
            peersRef.current.forEach(peer => {
              const sender = peer.getSenders().find(s => s.track && s.track.kind === 'video');
              if (!sender) {
                peer.addTrack(track, localStream);
              }
            });
          });
        }
        
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
        setIsVideoEnabled(true);
        
        // Signal to peers
        if (socket && isInRoom) {
          socket.emit('media-toggle', { roomId, userId: user.id, type: 'video', enabled: true });
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Failed to access camera. Please check permissions.');
      }
    } else {
      if (localStream) {
        localStream.getVideoTracks().forEach(track => {
          track.stop();
          localStream.removeTrack(track);
        });
        // Remove from peers
        peersRef.current.forEach(peer => {
          const sender = peer.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) peer.removeTrack(sender);
        });
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsVideoEnabled(false);
      if (socket && isInRoom) {
        socket.emit('media-toggle', { roomId, userId: user.id, type: 'video', enabled: false });
      }
    }
  };

  const handleStartCall = () => {
    if (!socket || !isInRoom || participants.length < 2) {
      alert('You need at least 2 people in the room to start a call');
      return;
    }

    // Clear any existing timeout
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
    }

    setIsCallRequestPending(true);
    socket.emit('call-request', { roomId, fromUserId: user.id, fromUsername: user.username });
    
    // Timeout after 30 seconds if no response
    callTimeoutRef.current = setTimeout(() => {
      setIsCallRequestPending(prev => {
        if (prev && !isCallActive) {
          alert('Call request timed out. No one accepted the call.');
          return false;
        }
        return prev;
      });
    }, 30000);
  };

  const handleAcceptCall = async () => {
    if (!socket || !callRequestFrom) return;

    socket.emit('call-accept', { roomId, fromUserId: callRequestFrom.userId });
    setCallRequestFrom(null);
    setIsCallActive(true);
    setIsCallRequestPending(false); // Clear pending state if we were also calling
    
    // Start audio automatically when accepting call
    if (!isAudioEnabled) {
      await handleToggleAudio();
    }
  };

  const handleRejectCall = () => {
    if (!socket || !callRequestFrom) return;

    socket.emit('call-reject', { roomId, fromUserId: callRequestFrom.userId });
    setCallRequestFrom(null);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setIsAudioEnabled(false);
    setIsVideoEnabled(false);
    // Close all peer connections
    peersRef.current.forEach(peer => peer.close());
    peersRef.current.clear();
    setRemoteStreams(new Map());
  };

  const handleVideoMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from the header
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('video')) {
      return;
    }
    
    if (videoWindowRef.current) {
      setIsDragging(true);
      const rect = videoWindowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const videoWidth = participants.length > 2 ? 500 : 400;
        const videoHeight = 300;
        // Keep video window to the right of left sidebar (420px + margin)
        const minX = 450;
        const maxX = window.innerWidth - videoWidth - 10;
        const newX = Math.max(minX, Math.min(e.clientX - dragOffset.x, maxX));
        const newY = Math.max(50, Math.min(e.clientY - dragOffset.y, window.innerHeight - videoHeight - 10));
        setVideoPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // WebRTC functions
  const createPeerConnection = (userId: string): RTCPeerConnection => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peer.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          roomId,
          toUserId: userId,
          candidate: event.candidate
        });
      }
    };

    peer.ontrack = (event) => {
      console.log(`Received track from ${userId}:`, event.track.kind);
      const stream = event.streams[0] || new MediaStream([event.track]);
      
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        // If stream already exists, add the new track to it
        if (newMap.has(userId)) {
          const existingStream = newMap.get(userId)!;
          if (!existingStream.getTracks().find(t => t.id === event.track.id)) {
            existingStream.addTrack(event.track);
          }
        } else {
          newMap.set(userId, stream);
        }
        return newMap;
      });
      
      // Setup audio level detection for remote stream
      if (event.track.kind === 'audio' && stream.getAudioTracks().length > 0) {
        try {
          const audioContext = new AudioContext();
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.8;
          source.connect(analyser);
          audioAnalyserRef.current.set(userId, analyser);
          console.log(`Audio analyser set up for ${userId}`);
        } catch (error) {
          console.error(`Failed to setup audio analyser for ${userId}:`, error);
        }
      }
    };

    // Add local stream tracks if available
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peer.addTrack(track, localStream);
      });
    }

    return peer;
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit, fromUserId: string) => {
    console.log(`Received offer from ${fromUserId}`);
    const peer = createPeerConnection(fromUserId);
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    
    if (socket) {
      console.log(`Sending answer to ${fromUserId}`);
      socket.emit('answer', {
        roomId,
        toUserId: fromUserId,
        answer
      });
    }
    
    peersRef.current.set(fromUserId, peer);
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit, fromUserId: string) => {
    const peer = peersRef.current.get(fromUserId);
    if (peer) {
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit, fromUserId: string) => {
    const peer = peersRef.current.get(fromUserId);
    if (peer) {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const initiatePeerConnections = async () => {
    if (!socket || !isInRoom) return;
    
    const otherParticipants = participants.filter(p => p.id !== user.id);
    if (otherParticipants.length === 0) return;
    
    console.log('Initiating peer connections with:', otherParticipants.map(p => p.username));
    
    for (const participant of otherParticipants) {
      if (!peersRef.current.has(participant.id)) {
        try {
          console.log(`Creating peer connection with ${participant.username} (${participant.id})`);
          const peer = createPeerConnection(participant.id);
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          
          console.log(`Sending offer to ${participant.username}`);
          socket.emit('offer', {
            roomId,
            toUserId: participant.id,
            offer
          });
          
          peersRef.current.set(participant.id, peer);
        } catch (error) {
          console.error(`Failed to create peer connection with ${participant.username}:`, error);
        }
      }
    }
  };

  // Run code handler
  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Running...');
    
    try {
      const testInput = input.trim() || selectedProblem.testCases[0]?.input || '';
      let executableCode = code;
      
      // Similar to ProblemView - create executable wrapper
      if (language === 'java' && selectedProblem.id === '1') {
        if (testInput) {
          const lines = testInput.split('\n');
          executableCode = `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] numsStr = sc.nextLine().split("\\\\s+");
        int[] nums = new int[numsStr.length];
        for (int i = 0; i < numsStr.length; i++) {
            nums[i] = Integer.parseInt(numsStr[i]);
        }
        int target = sc.nextInt();
        
        Solution solution = new Solution();
        int[] result = solution.twoSum(nums, target);
        System.out.println("[" + result[0] + "," + result[1] + "]");
    }
}`;
        } else {
          executableCode = `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = solution.twoSum(nums, target);
        System.out.println("[" + result[0] + "," + result[1] + "]");
    }
}`;
        }
      }
      
      const response = await fetch('http://localhost:3002/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          code: executableCode,
          input: testInput,
          timeLimit: 5000,
          memoryLimit: 256
        })
      });
      
      const result = await response.json();
      
      const outputText = result.status === 'success' 
        ? (result.output || '(No output)')
        : `Error: ${result.error || result.stderr || 'Execution failed'}\n\nStderr: ${result.stderr || 'None'}`;
      
      setOutput(outputText);
      
      // Share with other participants
      if (socket && isInRoom) {
        socket.emit('code-run', {
          roomId,
          userId: user.id,
          output: outputText
        });
      }
    } catch (error: any) {
      const errorMsg = `Failed to connect to server: ${error.message}\n\nMake sure backend is running on port 3002`;
      setOutput(errorMsg);
      
      if (socket && isInRoom) {
        socket.emit('code-run', {
          roomId,
          userId: user.id,
          output: errorMsg
        });
      }
    } finally {
      setIsRunning(false);
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionResult(null);
    setOutput('Running all test cases...\n\n');
    
    try {
      const testCases = selectedProblem.testCases;
      const results = [];
      let passedCount = 0;
      
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        let executableCode = code;
        
        // Create executable wrapper (similar to ProblemView)
        if (language === 'java' && selectedProblem.id === '1') {
          executableCode = `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] numsStr = sc.nextLine().split("\\\\s+");
        int[] nums = new int[numsStr.length];
        for (int i = 0; i < numsStr.length; i++) {
            nums[i] = Integer.parseInt(numsStr[i]);
        }
        int target = sc.nextInt();
        
        Solution solution = new Solution();
        int[] result = solution.twoSum(nums, target);
        System.out.println("[" + result[0] + "," + result[1] + "]");
    }
}`;
        }
        
        const response = await fetch('http://localhost:3002/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language,
            code: executableCode,
            input: testCase.input,
            timeLimit: 5000,
            memoryLimit: 256
          })
        });
        
        const result = await response.json();
        const actualOutput = result.status === 'success' ? (result.output || '').trim() : '';
        const expectedOutput = testCase.expectedOutput.trim();
        const passed = actualOutput === expectedOutput;
        
        if (passed) passedCount++;
        
        results.push({
          testCase: i + 1,
          input: testCase.input,
          expected: expectedOutput,
          actual: actualOutput,
          passed
        });
        
        setOutput(prev => prev + `Test Case ${i + 1}: ${passed ? '✓ PASSED' : '✗ FAILED'}\n`);
      }
      
      const finalResult = {
        passed: passedCount,
        total: testCases.length,
        results
      };
      
      const finalOutput = output + `\n\nResult: ${passedCount}/${testCases.length} test cases passed`;
      
      setSubmissionResult(finalResult);
      setOutput(finalOutput);
      
      // Share with other participants
      if (socket && isInRoom) {
        socket.emit('code-submit', {
          roomId,
          userId: user.id,
          result: finalResult,
          output: finalOutput
        });
      }
    } catch (error: any) {
      const errorMsg = `Failed to submit: ${error.message}`;
      setOutput(errorMsg);
      
      if (socket && isInRoom) {
        socket.emit('code-submit', {
          roomId,
          userId: user.id,
          result: null,
          output: errorMsg
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize WebRTC when joining room or when participants change
  useEffect(() => {
    if (isInRoom && participants.length > 1 && socket) {
      // Small delay to ensure socket is ready
      setTimeout(() => {
        initiatePeerConnections();
      }, 1500);
    }
  }, [isInRoom, participants.length, socket]);

  // Create peer connections when local stream becomes available
  useEffect(() => {
    if (isInRoom && localStream && participants.length > 1 && socket) {
      console.log('Local stream available, setting up peer connections');
      // Add tracks to existing peer connections
      peersRef.current.forEach(peer => {
        localStream.getTracks().forEach(track => {
          const sender = peer.getSenders().find(s => s.track && s.track.kind === track.kind);
          if (!sender) {
            console.log(`Adding ${track.kind} track to peer connection`);
            peer.addTrack(track, localStream);
          }
        });
      });
      
      // If no peer connections exist, create them
      if (peersRef.current.size === 0) {
        console.log('No peer connections, creating new ones');
        setTimeout(() => initiatePeerConnections(), 1000);
      }
    }
  }, [localStream, isInRoom, socket, participants.length]);

  // Update video element when stream changes
  useEffect(() => {
    if (videoRef.current && localStream && isVideoEnabled) {
      videoRef.current.srcObject = localStream;
      videoRef.current.play().catch(console.error);
    }
  }, [localStream, isVideoEnabled]);

  // Update remote video elements when streams change
  useEffect(() => {
    remoteStreams.forEach((stream, userId) => {
      const videoEl = remoteVideoRefs.current.get(userId);
      if (videoEl && videoEl.srcObject !== stream) {
        console.log(`Updating video element for ${userId}`);
        videoEl.srcObject = stream;
        videoEl.play().catch(err => console.error(`Failed to play video for ${userId}:`, err));
      }
      
      // Setup audio analyser if not already set up
      if (stream.getAudioTracks().length > 0 && !audioAnalyserRef.current.has(userId)) {
        try {
          const audioContext = new AudioContext();
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.8;
          source.connect(analyser);
          audioAnalyserRef.current.set(userId, analyser);
          console.log(`Audio analyser set up for remote user ${userId}`);
        } catch (error) {
          console.error(`Failed to setup audio analyser for ${userId}:`, error);
        }
      }
    });
  }, [remoteStreams]);

  // Setup audio level detection for local stream
  useEffect(() => {
    if (localStream && isAudioEnabled) {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(localStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioAnalyserRef.current.set(user.id, analyser);
    }
  }, [localStream, isAudioEnabled, user.id]);

  // Audio level monitoring
  useEffect(() => {
    const updateAudioLevels = () => {
      const levels = new Map<string, number>();
      
      audioAnalyserRef.current.forEach((analyser, userId) => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const normalizedLevel = Math.min(average / 128, 1); // Normalize to 0-1
        levels.set(userId, normalizedLevel);
      });
      
      setAudioLevels(levels);
      animationFrameRef.current = requestAnimationFrame(updateAudioLevels);
    };
    
    if (audioAnalyserRef.current.size > 0) {
      animationFrameRef.current = requestAnimationFrame(updateAudioLevels);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioAnalyserRef.current.size]);

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert('Room ID copied to clipboard!');
  };

  if (!isInRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <Card className="border-2 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Join or Create Room</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  {isConnected ? (
                    <>
                      <Wifi className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-500">Connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600 dark:text-red-500">Connecting...</span>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Room ID</label>
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
                      className="h-12"
                    />
                    <Button onClick={handleCreateRoom} disabled={!isConnected} size="lg">
                      Create Room
                    </Button>
                    <Button onClick={handleJoinRoom} disabled={!roomId.trim() || !isConnected} size="lg" variant="default">
                      Join Room
                    </Button>
                  </div>
                </div>
                {!isConnected && (
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      Waiting for connection to server... Please wait
                    </p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Create a new room or join an existing one with a room ID from your friend
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b-2 bg-card p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Leave Room
          </Button>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="cursor-pointer hover:bg-accent shrink-0" onClick={handleCopyRoomId}>
              <Copy className="h-3 w-3 mr-1" />
              Room: {roomId}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleCopyRoomId} className="shrink-0">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Pair Programming
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isCallActive && participants.length > 1 && (
            <Button
              variant="default"
              size="sm"
              onClick={handleStartCall}
              disabled={isCallRequestPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <Video className="h-4 w-4 mr-1" />
              {isCallRequestPending ? 'Calling...' : 'START VOICE CALL'}
            </Button>
          )}
          {isCallActive && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndCall}
            >
              End Call
            </Button>
          )}
          <Button
            variant={isAudioEnabled ? "default" : "outline"}
            size="sm"
            onClick={handleToggleAudio}
            disabled={!isCallActive}
          >
            {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          <Button
            variant={isVideoEnabled ? "default" : "outline"}
            size="sm"
            onClick={handleToggleVideo}
            disabled={!isCallActive}
          >
            {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>
          <div className="flex items-center gap-2 ml-4 px-3 py-1 rounded-lg bg-muted">
            <Users className="h-4 w-4" />
            <span className="font-medium">{participants.length}</span>
          </div>
        </div>
      </div>

      {/* Call Request Notification */}
      {callRequestFrom && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-96 border-2 border-primary shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Incoming Call
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-lg font-semibold">
                {callRequestFrom.username} is calling you
              </p>
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleRejectCall}
                >
                  Reject
                </Button>
                <Button
                  variant="default"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleAcceptCall}
                >
                  Accept
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {/* Combined Draggable Video Container - Always visible when call is active */}
        {isCallActive && (
          <div
            ref={videoWindowRef}
            className="fixed z-[55] cursor-move shadow-2xl border-2 border-primary/50 rounded-lg bg-card overflow-hidden"
            style={{
              left: `${Math.max(450, Math.min(videoPosition.x, window.innerWidth - 50))}px`,
              top: `${Math.max(80, Math.min(videoPosition.y, window.innerHeight - 350))}px`,
              width: participants.length > 2 ? '500px' : '400px',
              minHeight: '300px',
              maxWidth: `${Math.max(400, window.innerWidth - 470)}px`
            }}
            onMouseDown={handleVideoMouseDown}
          >
            <div className="bg-primary/10 px-3 py-2 flex items-center justify-between border-b">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Video className="h-4 w-4" />
                Video Call
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVideoWindowMinimized(!isVideoWindowMinimized)}
                  className="h-6 w-6 p-0"
                >
                  {isVideoWindowMinimized ? '□' : '−'}
                </Button>
              </div>
            </div>
            
            {!isVideoWindowMinimized && (
              <div className="p-3">
                {/* Grid layout - Always show both participants */}
                <div className="grid grid-cols-1 gap-3">
                  {/* Local Video/Name - Always shown */}
                  <div className="relative rounded-lg overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5 aspect-video flex items-center justify-center">
                    {isVideoEnabled && localStream ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/70 px-2 py-1 rounded">
                          <div className={`w-2 h-2 rounded-full ${isAudioEnabled && (audioLevels.get(user.id) || 0) > 0.1 ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                          <span className="text-xs font-medium text-white">
                            {user.username} (You)
                          </span>
                          {isAudioEnabled && (audioLevels.get(user.id) || 0) > 0.1 && (
                            <Mic className="h-3 w-3 text-green-500" />
                          )}
                          {!isAudioEnabled && (
                            <MicOff className="h-3 w-3 text-gray-400" />
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-16 h-16 rounded-full bg-primary/30 flex items-center justify-center text-2xl font-bold text-primary">
                          {user.username[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-medium">{user.username} (You)</span>
                        {!isAudioEnabled && <MicOff className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    )}
                  </div>

                  {/* Remote Videos/Names - Always shown for all participants */}
                  {participants.filter(p => p.id !== user.id).map((participant) => {
                    const stream = remoteStreams.get(participant.id);
                    const audioLevel = audioLevels.get(participant.id) || 0;
                    const isSpeaking = audioLevel > 0.1;
                    const hasAudio = stream ? stream.getAudioTracks().length > 0 : false;
                    const hasVideo = stream ? stream.getVideoTracks().length > 0 : false;
                    
                    return (
                      <div key={participant.id} className="relative rounded-lg overflow-hidden border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-blue-500/5 aspect-video flex items-center justify-center">
                        {hasVideo && stream ? (
                          <>
                            <video
                              ref={(el) => {
                                if (el) {
                                  remoteVideoRefs.current.set(participant.id, el);
                                  if (el.srcObject !== stream) {
                                    el.srcObject = stream;
                                  }
                                  el.play().catch(err => console.error(`Failed to play remote video for ${participant.username}:`, err));
                                }
                              }}
                              autoPlay
                              playsInline
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/70 px-2 py-1 rounded">
                              <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : hasAudio ? 'bg-yellow-500' : 'bg-gray-500'}`}></div>
                              <span className="text-xs font-medium text-white">
                                {participant.username}
                              </span>
                              {isSpeaking && (
                                <Mic className="h-3 w-3 text-green-500" />
                              )}
                              {hasAudio && !isSpeaking && (
                                <Mic className="h-3 w-3 text-yellow-500" />
                              )}
                              {!hasAudio && (
                                <MicOff className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="w-16 h-16 rounded-full bg-blue-500/30 flex items-center justify-center text-2xl font-bold text-blue-500">
                              {participant.username[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">{participant.username}</span>
                            {!hasAudio && <MicOff className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Left Panel - Fixed width, chat always visible */}
        <div className="w-[420px] border-r-2 bg-muted/20 flex flex-col overflow-hidden">
          {/* Participants - Fixed height */}
          <Card className="m-3 mb-2 border-2 shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participants ({participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {participants.map(p => (
                  <div 
                    key={p.id} 
                    className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${
                      p.id === user.id 
                        ? 'bg-primary/10 border-primary/50' 
                        : 'bg-card border-border hover:border-primary/30'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      p.id === user.id ? 'bg-primary/20 text-primary' : 'bg-muted'
                    }`}>
                      {p.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {p.username}
                        {p.id === user.id && <span className="ml-1 text-xs text-muted-foreground">(You)</span>}
                      </p>
                    </div>
                    {p.isActive && (
                      <Badge variant="success" className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Problem Selector - Fixed height */}
          <Card className="m-3 mb-2 border-2 shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Problem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedProblem.id} onValueChange={handleProblemChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROBLEMS.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="space-y-2">
                <p className="text-sm font-semibold">{selectedProblem.title}</p>
                <div className="flex gap-2">
                  <Badge variant="outline">{selectedProblem.difficulty}</Badge>
                  <Badge variant="outline">{selectedProblem.category}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat - Takes remaining space, input ALWAYS visible */}
          <Card className="m-3 mb-3 flex-1 flex flex-col min-h-[300px] border-2 border-primary/20 overflow-hidden">
            <CardContent className="flex-1 flex flex-col min-h-0 p-0 h-full relative">
              {/* Messages area - scrollable, takes available space */}
              <div className="flex-1 overflow-y-auto p-4 min-h-[200px]">
                <div className="space-y-3">
                  {chatMessages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No messages yet. Type below to start chatting!</p>
                  ) : (
                    chatMessages.map(msg => (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col ${msg.userId === user.id ? 'items-end' : 'items-start'}`}
                      >
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          {msg.userId === user.id ? 'You' : msg.username}
                        </div>
                        <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm break-words ${
                          msg.userId === user.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          {msg.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Input area - FIXED at bottom, ALWAYS VISIBLE - Higher z-index to stay above video window */}
              <div className="border-t-2 bg-card p-3 flex gap-2 shrink-0 relative z-[60]">
                <Input
                  placeholder="Type a message and press Enter..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 h-10"
                  disabled={!isInRoom || !socket?.connected}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || !isInRoom || !socket?.connected}
                  className="h-10 px-4"
                >
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="border-b-2 bg-card p-3 flex items-center justify-between gap-3">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={handleRun} disabled={isRunning || isSubmitting}>
                <Play className="h-4 w-4 mr-2" />
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
              <Button variant="default" onClick={handleSubmit} disabled={isRunning || isSubmitting}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>

          {/* Problem Description & I/O */}
          <div className="h-48 border-b-2 bg-muted/20 overflow-auto p-4 flex flex-col">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">{selectedProblem.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{selectedProblem.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className="text-xs font-medium mb-1 block">Custom Input (optional)</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter test input..."
                  className="w-full h-16 p-2 text-xs border rounded bg-background font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Output</label>
                <div className="w-full h-16 p-2 text-xs border rounded bg-background font-mono overflow-auto">
                  {output || 'Output will appear here...'}
                </div>
              </div>
            </div>
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
