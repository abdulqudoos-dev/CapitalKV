"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, X, Pause, Play, Camera, Bot } from "lucide-react";
import axios from "axios";
import { useAssistant } from "../context/Assistant-context";
import { BASE_URL } from "@/utils/api";

/**
 * NOTE:
 * - If your project uses a different path for Assistant-context or api utils,
 * update the imports accordingly.
 * - This file assumes the project is configured to allow "window" usage in client code.
 */

// Simple toast hook (replace with your real toast implementation)
const useToast = () => ({
  toast: (options: { title: string; description?: string; variant?: string }) =>
    console.log("Toast:", options),
});

type Message = { sender: "user" | "ai"; text: string };

export function AssistantGuide() {
  const { isOpen, toggle } = useAssistant();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Browser API refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const { toast } = useToast();

  // Keep scroll pinned to bottom when messages or typing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ADDED: This new effect starts listening when the assistant is opened.
  useEffect(() => {
    if (isOpen) {
      startListening();
    }
    // Cleanup function to stop listening and speech synthesis when the assistant closes
    return () => {
      document.body.style.overflow = "";
      stopListening();
      window.speechSynthesis.cancel();
    };
  }, [isOpen]);

  // Speak text using Web Speech API with safer voice selection
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast({
        title: "Error",
        description: "Your browser doesn't support Text-to-Speech.",
        variant: "destructive",
      });
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    // get voices; note: getVoices may return empty initially
    let voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) {
      const onVoicesChanged = () => {
        voices = window.speechSynthesis.getVoices() || [];
        const v = voices.find(
          (vv) => vv.lang?.startsWith("en") && vv.name.toLowerCase().includes("female")
        );
        if (v) utterance.voice = v;
        window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
      };
      window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
    } else {
      const voice = voices.find(
        (v) => v.lang?.startsWith("en") && v.name.toLowerCase().includes("female")
      );
      if (voice) utterance.voice = voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };
    utterance.onerror = (ev) => {
      console.error("Speech synthesis error", ev);
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
      toast({
        title: "Speech error",
        description: "An error occurred during speech synthesis.",
        variant: "destructive",
      });
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Pause / resume speaking
  const togglePauseResume = () => {
    if (!utteranceRef.current) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast({ title: "Error", description: "Web Speech API not supported", variant: "destructive" });
      return;
    }
    try {
      const recognition: SpeechRecognition = new SR();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (transcript) {
          setInputMessage(transcript);
          sendMessage(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        toast({ title: "Error", description: "Speech recognition failed.", variant: "destructive" });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      toast({ title: "Voice Input", description: "Listening...", variant: "default" });
    } catch (err) {
      toast({ title: "Error", description: "Could not start microphone", variant: "destructive" });
    }
  };

  // Send message to backend assistant endpoint
  const sendMessage = async (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    // Optimistic add user message
    setMessages((prev) => [...prev, { sender: "user", text: trimmedText }]);
    setInputMessage("");
    setIsTyping(true);
    stopListening(); // Ensure listening is off when sending a message

    try {
      // The URL for the backend is correct. The issue is likely in the backend server.
      const url = `${BASE_URL ?? ""}/assistant/voice`;
      const res = await axios.post(url, { user_query: trimmedText });
      const aiResponse = res?.data?.response ?? "Sorry — no response.";

      // Slight delay to feel natural
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "ai", text: aiResponse }]);
        setIsTyping(false);
        // The assistant will speak its response, regardless of input method.
        speakText(aiResponse);
      }, 600);
    } catch (error) {
      console.error("sendMessage error", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "KV-AI is rebooting. Try again shortly.",
      });
      setIsTyping(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleCameraClick = () => {
    toast({
      title: "Camera",
      description: "Image recognition is coming soon!",
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={toggle} />

      <motion.div
        className="
          fixed bottom-4 right-[3%] sm:right-6 sm:bottom-6
          w-[94vw] max-w-md max-h-[90vh]
          z-50
          bg-gradient-to-br from-[#0a192f]/70 via-[#001f3f]/70 to-[#002b54]/70
          rounded-3xl
          border border-cyan-500/30
          shadow-[0_0_30px_4px_rgba(0,255,255,0.25),0_0_50px_10px_rgba(0,255,255,0.1)]
          flex flex-col overflow-hidden transition-all duration-500
          ring-1 ring-cyan-600/30
        "
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div
          className="
            flex items-center justify-between px-5 py-4
            bg-gradient-to-r from-cyan-700/60 to-cyan-900/40
            shadow-[0_0_15px_2px_rgba(0,255,255,0.5)]
            rounded-t-3xl
            text-cyan-200
          "
        >
          <div className="flex items-center gap-3">
            <Bot
              className="text-cyan-400 animate-pulse drop-shadow-[0_0_8px_cyan]"
              size={24}
            />
            <h2 className="text-sm font-extrabold tracking-wide uppercase drop-shadow-[0_0_6px_cyan]">
              CapitalKV AI
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="hover:bg-cyan-500/40 p-2 rounded-full transition shadow-[0_0_15px_cyan]"
              aria-label="Close assistant"
            >
              <X className="text-white drop-shadow-[0_0_10px_cyan]" size={20} />
            </button>
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto p-5 text-sm text-white scrollbar-thin scrollbar-thumb-cyan-700 scrollbar-track-transparent"
          role="log"
        >
          <AnimatePresence mode="wait">
            {!isListening ? (
              <motion.div
                key="chat-mode"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex flex-col h-full space-y-4"
              >
                <div className="flex-1 overflow-y-auto space-y-3 pb-5">
                  {messages.length === 0 && (
                    <p className="text-center text-white/50 italic pt-4 drop-shadow-[0_0_5px_cyan]">
                      👋{" "}
                      <span className="text-cyan-400 drop-shadow-[0_0_5px_cyan] font-semibold">
                        Hi! I’m CapitalKV's AI Assistant.
                      </span>{" "}
                      How can I help you today?
                    </p>
                  )}
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`max-w-[85%] p-4 rounded-3xl backdrop-blur-md text-sm leading-relaxed shadow-[0_0_10px_cyan] ${
                        msg.sender === "user"
                          ? "ml-auto bg-gradient-to-br from-purple-600/70 to-purple-900/90 text-white drop-shadow-[0_0_15px_purple]"
                          : "bg-gradient-to-br from-cyan-400/20 to-white/10 text-cyan-100 drop-shadow-[0_0_10px_cyan]"
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                  {isTyping && (
                    <motion.div
                      className="flex items-center gap-1 px-5 py-3 w-fit rounded-full bg-white/10 text-white text-sm shadow-[0_0_15px_cyan]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <span className="animate-pulse drop-shadow-[0_0_10px_cyan]">Typing</span>
                      <motion.div
                        className="w-3 h-3 bg-cyan-400 rounded-full"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                      />
                      <motion.div
                        className="w-3 h-3 bg-cyan-400 rounded-full"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-3 h-3 bg-cyan-400 rounded-full"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
                      />
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1 min-w-0 px-4 py-3 rounded-full bg-white/10 text-white placeholder-white/60 border border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 text-sm"
                    disabled={isListening}
                  />

                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={handleMicClick}
                      className="flex-1 sm:flex-none w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center shadow-md transition shadow-cyan-400/80"
                      aria-label={isListening ? "Stop Listening" : "Start Speaking"}
                    >
                      <Mic size={20} />
                    </button>
                    <button
                      type="submit"
                      className="flex-1 sm:flex-none w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white flex items-center justify-center shadow-md transition shadow-cyan-400/80"
                      aria-label="Send message"
                      disabled={isListening}
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="voice-mode"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center space-y-6 h-full select-none"
              >
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-cyan-400/70 bg-white/10 flex items-center justify-center shadow-[0_0_40px_5px_cyan,0_0_60px_12px_cyan]">
                  <motion.div
                    className="w-14 h-14 rounded-full bg-cyan-500 shadow-[0_0_30px_10px_cyan]"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.6, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </div>
                <p className="text-xs text-cyan-300 uppercase tracking-widest font-mono text-center drop-shadow-[0_0_5px_cyan]">
                  Listening... Tap mic to stop
                </p>

                <div className="flex items-center justify-center gap-6 sm:gap-8">
                  <button
                    onClick={handleCameraClick}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center justify-center shadow-[0_0_20px_5px_cyan] hover:scale-110 transition"
                    aria-label="Camera feature"
                  >
                    <Camera size={20} />
                  </button>
                  <button
                    onClick={handleMicClick}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-[0_0_30px_15px_cyan] hover:scale-105 transition"
                    aria-label="Toggle listening"
                  >
                    <X size={28} />
                  </button>
                  {isSpeaking && (
                    <button
                      onClick={togglePauseResume}
                      aria-label={isPaused ? "Resume speech" : "Pause speech"}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center justify-center shadow-[0_0_20px_5px_cyan] hover:scale-110 transition"
                    >
                      {isPaused ? <Play size={20} className="text-white" /> : <Pause size={20} className="text-white" />}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
