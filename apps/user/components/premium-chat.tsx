"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Check, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
    id: string;
    text: string;
    sender: "user" | "captain";
    timestamp: Date;
    status: "sent" | "delivered" | "read";
};

const LUXURY_QUICK_MESSAGES = [
    "Estou pronto, pode vir.",
    "Estou saindo agora.",
    "Onde você está exatamente?",
    "Por favor, ar condicionado no máximo.",
    "Gostaria de silêncio durante a viagem, obrigado.",
    "Excelente condução, obrigado.",
];

export function PremiumChat({ isOpen, onClose, driverName }: { isOpen: boolean; onClose: () => void; driverName: string }) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "Olá! Já estou a caminho para buscá-lo em seu local premium.",
            sender: "captain",
            timestamp: new Date(),
            status: "read",
        },
    ]);
    const [inputText, setInputText] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const sendMessage = (text: string) => {
        if (!text.trim()) return;
        const newMessage: Message = {
            id: Date.now().toString(),
            text,
            sender: "user",
            timestamp: new Date(),
            status: "sent",
        };
        setMessages((prev) => [...prev, newMessage]);
        setInputText("");

        // Simulate driver reply
        setTimeout(() => {
            setMessages((prev) =>
                prev.map((m) => m.id === newMessage.id ? { ...m, status: "read" } : m)
            );
        }, 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="fixed inset-x-4 bottom-24 z-50 max-w-lg mx-auto bg-black/90 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden h-[60vh]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                <Crown className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-black text-white">{driverName}</h3>
                                <span className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                                    Elite Captain
                                </span>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <X className="w-5 h-5 text-white/50" />
                        </button>
                    </div>

                    {/* Messages List */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-none">
                        {messages.map((m) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, x: m.sender === "user" ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={cn(
                                    "flex flex-col max-w-[80%]",
                                    m.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "p-4 rounded-2xl text-sm font-medium",
                                        m.sender === "user"
                                            ? "bg-primary text-black rounded-tr-none"
                                            : "bg-white/5 text-white border border-white/10 rounded-tl-none"
                                    )}
                                >
                                    {m.text}
                                </div>
                                <div className="flex items-center gap-1 mt-1 px-1">
                                    <span className="text-[10px] text-white/30 font-bold">
                                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {m.sender === "user" && (
                                        <Check className={cn("w-3 h-3", m.status === "read" ? "text-primary" : "text-white/30")} />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Quick Replies */}
                    <div className="px-6 py-2 overflow-x-auto flex gap-2 no-scrollbar">
                        {LUXURY_QUICK_MESSAGES.map((msg, i) => (
                            <button
                                key={i}
                                onClick={() => sendMessage(msg)}
                                className="whitespace-nowrap px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all"
                            >
                                {msg}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-6 pt-2">
                        <div className="relative">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage(inputText)}
                                placeholder="Escreva sua mensagem personalizada..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all"
                            />
                            <button
                                onClick={() => sendMessage(inputText)}
                                className="absolute right-2 top-2 bottom-2 w-10 rounded-xl bg-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                            >
                                <Send className="w-4 h-4 text-black" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
