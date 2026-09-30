import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Radio, Activity, AlertCircle, PhoneCall, PhoneOff } from 'lucide-react';

export const LiveVoiceView: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextInputRef = useRef<AudioContext | null>(null);
  const audioContextOutputRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  // Helper to convert float32 audio buffer to 16kHz 16-bit PCM base64
  const pcmToBase64 = (channelData: Float32Array): string => {
    const buffer = new ArrayBuffer(channelData.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < channelData.length; i++) {
      const s = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Helper to play 24kHz PCM audio chunk received from Gemini Live API
  const playAudioChunk = (audioCtx: AudioContext, base64Data: string) => {
    try {
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);

      const currentTime = audioCtx.currentTime;
      const startTime = Math.max(currentTime, nextStartTimeRef.current);
      source.start(startTime);
      nextStartTimeRef.current = startTime + audioBuffer.duration;
    } catch (e) {
      console.error('Audio playback error:', e);
    }
  };

  const startVoiceSession = async () => {
    setErrorMsg(null);
    try {
      // Connect to server WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      audioContextOutputRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      ws.onopen = async () => {
        setIsConnected(true);
        // Start microphone capture at 16kHz
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              channelCount: 1,
              sampleRate: 16000,
              echoCancellation: true,
              noiseSuppression: true,
            },
          });
          mediaStreamRef.current = stream;

          const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 16000,
          });
          audioContextInputRef.current = inputCtx;

          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (ws.readyState === WebSocket.OPEN) {
              const channelData = e.inputBuffer.getChannelData(0);
              const base64 = pcmToBase64(channelData);
              ws.send(JSON.stringify({ audio: base64 }));
            }
          };

          source.connect(processor);
          processor.connect(inputCtx.destination);
          setIsTalking(true);
        } catch (micErr: any) {
          setErrorMsg('Microphone access denied or unsupported.');
          endVoiceSession();
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.error) {
            setErrorMsg(msg.error);
          }
          if (msg.text) {
            setLiveTranscript((prev) => `${prev} ${msg.text}`);
          }
          if (msg.audio && audioContextOutputRef.current) {
            playAudioChunk(audioContextOutputRef.current, msg.audio);
          }
          if (msg.interrupted) {
            if (audioContextOutputRef.current) {
              nextStartTimeRef.current = audioContextOutputRef.current.currentTime;
            }
          }
        } catch (parseErr) {
          console.error('Error parsing live WS payload:', parseErr);
        }
      };

      ws.onerror = (e) => {
        setErrorMsg('Live WebSocket connection failed. Verify GEMINI_API_KEY on the server.');
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsTalking(false);
      };
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start Live Voice session.');
    }
  };

  const endVoiceSession = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextInputRef.current) {
      audioContextInputRef.current.close();
      audioContextInputRef.current = null;
    }
    if (audioContextOutputRef.current) {
      audioContextOutputRef.current.close();
      audioContextOutputRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsTalking(false);
  };

  useEffect(() => {
    return () => {
      endVoiceSession();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="p-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Real-Time Voice Assistant
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Gemini 3.8 Live Voice Conversations
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Hands-free voice consultation powered by the Gemini 3.8 Live API. Speak directly into your microphone for real-time triage guidance and emergency dispatch instructions.
        </p>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-xs flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Live API Notice:</div>
            <div>{errorMsg}</div>
          </div>
        </div>
      )}

      {/* Main Interactive Mic Card */}
      <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xs text-center flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
              isTalking
                ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 scale-105'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400'
            }`}
          >
            {isTalking ? <Mic className="w-12 h-12 animate-pulse" /> : <MicOff className="w-12 h-12" />}
          </div>

          {isTalking && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
            </span>
          )}
        </div>

        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            {isTalking ? 'Listening to your speech...' : 'Start Real-Time Voice Conversation'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            {isTalking
              ? 'Speak naturally about IV saline shortages, ambulance re-routing, or emergency cold-chain supplies.'
              : 'Press the button below to initiate bidirectional low-latency audio stream with Gemini 3.8 Live.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isConnected ? (
            <button
              onClick={startVoiceSession}
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 flex items-center gap-2 shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Connect Live Voice API</span>
            </button>
          ) : (
            <button
              onClick={endVoiceSession}
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 flex items-center gap-2 shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Disconnect Voice Session</span>
            </button>
          )}
        </div>

        {/* Live Audio Telemetry Indicator */}
        <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
          <span className="flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300 dark:bg-zinc-700'}`}
            />
            {isConnected ? '16kHz PCM Streaming' : 'Ready'}
          </span>
          <span>·</span>
          <span>Output: 24kHz WebAudio</span>
          <span>·</span>
          <span>Model: gemini-3.8-live</span>
        </div>
      </div>

      {/* Live Transcript Log */}
      {liveTranscript && (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Real-time Voice Output Transcript</span>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800 text-xs text-gray-800 dark:text-gray-100 font-sans leading-relaxed">
            {liveTranscript}
          </div>
        </div>
      )}
    </div>
  );
};
