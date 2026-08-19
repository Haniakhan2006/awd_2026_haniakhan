import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Languages, 
  Clock, 
  Trash2,
  Sprout,
  HelpCircle,
  Play
} from "lucide-react";
import { ChatMessage, ChatSession, UserProfile } from "../types";
import { db, safeAddDoc } from "../lib/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, limit } from "firebase/firestore";

interface FarmingAssistantProps {
  user: UserProfile;
}

export default function FarmingAssistant({ user }: FarmingAssistantProps) {
  const [queryText, setQueryText] = useState("");
  const [language, setLanguage] = useState("English");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Suggested quick prompts
  const suggestions = {
    English: [
      "Why are my wheat leaves turning bright yellow?",
      "How many water bags are needed per acre of maize?",
      "What is the best fertilizer timeline for Basmati Rice?"
    ],
    Urdu: [
      "گندم کے پتے پیلے ہونے کی کیا وجہ ہے؟",
      "مکئی کی فصل کو کتنا پانی دینا چاہیے؟",
      "چاول کی بہترین کھاد کا شیڈول کیا ہے؟"
    ]
  };

  useEffect(() => {
    // Load local history if any
    const savedHistory = localStorage.getItem(`assistant-chat-${user.uid}`);
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    } else {
      // Welcome message
      setChatHistory([
        {
          role: "assistant",
          content: `### PROBLEM:
Ready to assist you with agricultural queries.

### REASON:
I am configured to provide specialized plant, soil, and crop advisory support.

### SOLUTION:
Type your crop issue or click any suggestion bubble below to get a detailed diagnosis.

### PREVENTION:
Consistently monitor foliage spots and balance Nitrogen input.

### ESTIMATED COST:
Free diagnostic support.

### CONFIDENCE SCORE:
99%`,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [user.uid]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  const saveHistory = (newHistory: ChatMessage[]) => {
    setChatHistory(newHistory);
    localStorage.setItem(`assistant-chat-${user.uid}`, JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    const defaultHistory: ChatMessage[] = [{
      role: "assistant",
      content: "Hello! I am your AI Agriculture Expert. Ask me anything about crop diseases, fertilizers, soil prep, or planting schedules.",
      timestamp: new Date().toISOString()
    }];
    saveHistory(defaultHistory);
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userMsg: ChatMessage = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [...chatHistory, userMsg];
    saveHistory(updatedHistory);
    setQueryText("");
    setIsTyping(true);

    try {
      // POST user query to Express Farming Assistant API
      const res = await fetch("/api/farming-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToSend,
          language: language,
          history: updatedHistory
        })
      });

      if (!res.ok) throw new Error("Connection failed");
      const data = await res.json();
      
      // Simulate real-time streaming text (HACKATHON REQUIREMENT: Streaming AI Responses)
      let fullText = data.response;
      let currentText = "";
      let index = 0;
      
      setIsTyping(false);
      
      const streamMsg: ChatMessage = {
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString()
      };
      
      // Add empty assistant bubble
      const streamHistory = [...updatedHistory, streamMsg];
      setChatHistory(streamHistory);

      const interval = setInterval(() => {
        if (index < fullText.length) {
          currentText += fullText[index];
          index += 3; // Type 3 chars at a time to keep it energetic yet visibly streaming
          
          const tempHistory = [...streamHistory];
          tempHistory[tempHistory.length - 1] = {
            ...streamMsg,
            content: currentText.slice(0, fullText.length)
          };
          setChatHistory(tempHistory);
        } else {
          clearInterval(interval);
          
          // Final save
          const finalHistory = [...streamHistory];
          finalHistory[finalHistory.length - 1] = {
            ...streamMsg,
            content: fullText
          };
          saveHistory(finalHistory);
          
          // Optionally sync to Firestore collection
          safeAddDoc("chats", {
            userId: user.uid,
            language: language,
            messages: finalHistory,
            createdAt: new Date().toISOString()
          });
        }
      }, 15);

    } catch (err) {
      console.error(err);
      setIsTyping(false);
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: "### PROBLEM:\nDiagnostic connection lost.\n\n### REASON:\nUnable to fetch AI responses in streaming mode.\n\n### SOLUTION:\nPlease retry sending your message or check your internet link.",
        timestamp: new Date().toISOString()
      };
      saveHistory([...updatedHistory, errorMsg]);
    }
  };

  // Module 17: Voice Input / Speech Synthesis simulation
  const startSpeechRecognition = () => {
    setIsRecording(true);
    // Simulate speaking
    setTimeout(() => {
      setIsRecording(false);
      const voiceQueries = language === "Urdu" 
        ? "گندم کے پتے پیلے ہونے کی کیا وجہ ہے؟" 
        : "Why are my wheat leaves turning bright yellow?";
      setQueryText(voiceQueries);
    }, 2500);
  };

  const handleSpeakResponse = (text: string, index: number) => {
    if (isPlayingAudio === index) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(null);
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlayingAudio(index);
    
    // Clean markdown formatting before reading out loud
    const cleanText = text
      .replace(/###\s+\w+:/g, "")
      .replace(/[*#`_\-]/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Attempt language selector
    if (language === "Urdu") utterance.lang = "ur-PK";
    else utterance.lang = "en-US";

    utterance.onend = () => {
      setIsPlayingAudio(null);
    };
    utterance.onerror = () => {
      setIsPlayingAudio(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const currentSuggestions = language === "Urdu" ? suggestions.Urdu : suggestions.English;

  return (
    <div className="space-y-6 max-w-4xl mx-auto h-[80vh] flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white/40 dark:bg-[#122214]/40 p-4 rounded-2xl border border-[#2E7D32]/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#2E7D32] rounded-xl text-white">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-sm">Farming Assistant</h2>
            <span className="text-[10px] text-gray-500 block">Multilingual Text & Audio consults</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language select */}
          <div className="flex items-center gap-1.5 bg-white/60 dark:bg-[#0A140B]/60 border border-[#2E7D32]/15 px-2.5 py-1.5 rounded-xl">
            <Languages className="w-3.5 h-3.5 text-[#2E7D32]" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-none text-[11px] font-bold focus:outline-none cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Urdu">Urdu (اردو)</option>
              <option value="Punjabi">Punjabi (پنجابی)</option>
              <option value="Pashto">Pashto (پښتو)</option>
            </select>
          </div>

          <button
            onClick={clearHistory}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            title="Clear Chat History"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl border border-[#2E7D32]/10 bg-white/20 dark:bg-[#122214]/10 min-h-[300px]">
        {chatHistory.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-xs flex-shrink-0">
                  🌱
                </div>
              )}
              <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm border ${
                isUser 
                  ? "bg-[#2E7D32] text-white border-transparent rounded-tr-none" 
                  : "bg-white dark:bg-[#122214] border-black/5 dark:border-white/5 text-gray-700 dark:text-gray-200 rounded-tl-none"
              }`}>
                
                {/* Parse Markdown-like templates requested by user */}
                {!isUser ? (
                  <div className="space-y-3.5 text-xs md:text-sm">
                    {msg.content.split("\n\n").map((chunk, i) => {
                      if (chunk.startsWith("###")) {
                        const parts = chunk.split("\n");
                        const title = parts[0].replace("###", "").trim();
                        const val = parts.slice(1).join("\n");
                        return (
                          <div key={i} className="border-l-2 border-[#2E7D32] pl-2.5 py-0.5">
                            <strong className="text-[10px] uppercase text-[#2E7D32] dark:text-[#4CAF50] block tracking-wider">{title}</strong>
                            <span className="mt-1 block font-medium leading-relaxed">{val}</span>
                          </div>
                        );
                      }
                      return <p key={i} className="leading-relaxed">{chunk}</p>;
                    })}

                    {/* Speech response synthesis button */}
                    <button
                      onClick={() => handleSpeakResponse(msg.content, idx)}
                      className="mt-2.5 px-3 py-1 bg-[#2E7D32]/10 hover:bg-[#2E7D32]/20 rounded-lg text-[10px] font-bold text-[#2E7D32] dark:text-[#8BC34A] flex items-center gap-1.5 transition-colors"
                    >
                      {isPlayingAudio === idx ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" /> Stop Speaking
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" /> Listen Response
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs md:text-sm font-semibold">{msg.content}</p>
                )}
                
                <span className={`text-[8px] block mt-1.5 text-right ${isUser ? "text-green-200" : "text-gray-400"}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
            <div className="p-1 bg-[#2E7D32] rounded-full text-white animate-bounce">🌱</div>
            <span>AI Agriculture Expert is typing...</span>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Suggestion Bubbles */}
      {chatHistory.length < 3 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block pl-1">Frequently Asked Questions</span>
          <div className="flex flex-wrap gap-2">
            {currentSuggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSend(sug)}
                className="bg-[#2E7D32]/5 hover:bg-[#2E7D32]/10 text-[#2E7D32] dark:text-[#8BC34A] border border-[#2E7D32]/10 px-3 py-1.5 rounded-full text-[11px] font-semibold text-left transition-colors"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-center gap-3">
        {/* Microphone simulation (Module 17) */}
        <button
          onClick={startSpeechRecognition}
          className={`p-3.5 rounded-xl transition-all shadow-sm flex-shrink-0 ${
            isRecording 
              ? "bg-red-500 text-white animate-pulse" 
              : "bg-white/60 dark:bg-[#122214]/60 border border-[#2E7D32]/10 hover:bg-[#2E7D32]/10"
          }`}
          title="Simulate Voice Input"
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-[#2E7D32]" />}
        </button>

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(queryText); }}
          className="flex-1 flex gap-2"
        >
          <input
            type="text"
            placeholder={isRecording ? "Listening to your speech..." : "Ask about symptoms, fertilizers, watering cycle..."}
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            disabled={isRecording}
            className="flex-1 bg-white dark:bg-[#122214] border border-[#2E7D32]/15 rounded-xl px-4 py-3 text-xs md:text-sm font-medium focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent outline-none"
          />
          <button
            type="submit"
            disabled={!queryText.trim()}
            className="p-3.5 bg-[#2E7D32] hover:bg-[#235F26] disabled:bg-gray-400 text-white rounded-xl shadow-md transition-all flex items-center justify-center"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>

    </div>
  );
}
