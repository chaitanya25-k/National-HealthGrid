import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  MapPin,
  Bot,
  User,
  ExternalLink,
  RotateCcw,
  Zap,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  groundingChunks?: Array<{
    maps?: {
      uri?: string;
      title?: string;
      placeAnswerSources?: {
        reviewSnippets?: Array<{ reviewText?: string }>;
      };
    };
    web?: {
      uri?: string;
      title?: string;
    };
  }>;
}

export const GeminiChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'model',
      content:
        "Namaste. I am your National HealthGrid AI Assistant. I can assist with clinical drug run-rate analysis, NLEM stock replenishment, inter-district transfer calculations, and locate nearby district hospitals, blood banks, or cold-chain depots using Google Maps grounding. How can I help your healthcare facility today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [enableMaps, setEnableMaps] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Try getting user geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          // Default to Pune coordinates if blocked
          setUserLocation({ latitude: 18.5204, longitude: 73.8567 });
        }
      );
    }
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model,
          enableMaps,
          location: userLocation,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'model',
          content: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          groundingChunks: data.groundingChunks || [],
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'model',
          content: `Error: ${data.detail || 'Unable to retrieve answer from Gemini.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          content: 'Network communication error with the HealthGrid AI backend.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'msg-init-reset',
        role: 'model',
        content: 'Conversation thread refreshed. Ready for clinical or logistics questions.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const samplePrompts = [
    'Find nearest 24/7 blood bank and cold-chain vaccine depot in Pune district',
    'Calculate IV Normal Saline run-rate for a 20-bed PHC with 40 daily admissions',
    'What is the emergency triage protocol when Anti-Snake Venom is depleted below 4 vials?',
    'Locate District Hospitals with operational ICU ventilators within 50 km',
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              HealthGrid Intelligence Assistant
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Gemini Clinical & Logistics Chatbot
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Multi-turn medical logistics consultation with real-time Google Maps health facility grounding.
          </p>
        </div>

        {/* Controls: Model & Maps Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Model Selector */}
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as any)}
            className="text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-gray-700 dark:text-gray-200 outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
          >
            <option value="gemini-3.5-flash">gemini-3.5-flash (Standard)</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
          </select>

          {/* Maps Grounding Toggle */}
          <button
            type="button"
            onClick={() => setEnableMaps(!enableMaps)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              enableMaps
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                : 'bg-gray-50 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 border-gray-300 dark:border-zinc-700'
            }`}
            title="Toggle Google Maps data grounding"
          >
            <Compass className={`w-3.5 h-3.5 ${enableMaps ? 'text-emerald-600' : 'text-gray-400'}`} />
            <span>Maps Grounding: {enableMaps ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={clearChat}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Thread Container */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[560px]">
        {/* Messages Scroll Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-gray-800 text-white'
                      : 'bg-emerald-700 text-white shadow-2xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-gray-900 text-white rounded-tr-none'
                      : 'bg-gray-50 dark:bg-zinc-800/80 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200/80 dark:border-zinc-700/60'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                  {/* Google Maps Grounding Links */}
                  {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-700 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>Google Maps Verified Places & Locations</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.groundingChunks.map((chunk, ci) => {
                          if (chunk.maps?.uri) {
                            return (
                              <a
                                key={ci}
                                href={chunk.maps.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-emerald-800 dark:text-emerald-200 bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-700 rounded-lg hover:underline shadow-2xs"
                              >
                                <span>{chunk.maps.title || 'View on Google Maps'}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
                              </a>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-1 text-[10px] opacity-60 text-right">{msg.timestamp}</div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-500 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                <span>Consulting Gemini healthcare model & Google Maps data...</span>
              </div>
            </div>
          )}
        </div>

        {/* Prompt Suggestions */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-zinc-800/40 border-t border-gray-100 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" /> Suggestions:
          </span>
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="text-[11px] font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about medicine run-rates, PHC emergency protocols, or find nearby health facilities..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 text-xs rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 shrink-0 shadow-xs"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
