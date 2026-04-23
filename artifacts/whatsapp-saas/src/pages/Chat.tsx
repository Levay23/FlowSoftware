import { useState, useEffect, useRef } from "react";
import { useGetConversations, useGetConversationMessages, useSendConversationMessage, getGetConversationsQueryKey, getGetConversationMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, Send, Bot, User, 
  ChevronLeft, Info, Search, Phone, 
  Settings, MoreVertical, Zap
} from "lucide-react";

export default function Chat() {
  const queryClient = useQueryClient();
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useGetConversations({ query: { queryKey: getGetConversationsQueryKey() } });

  const { data: messages = [] } = useGetConversationMessages(
    selectedContactId ?? 0,
    { limit: 50 },
    { query: { enabled: !!selectedContactId, queryKey: getGetConversationMessagesQueryKey(selectedContactId ?? 0) } }
  );

  const sendMutation = useSendConversationMessage({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetConversationMessagesQueryKey(selectedContactId ?? 0) });
        queryClient.invalidateQueries({ queryKey: getGetConversationsQueryKey() });
        setNewMessage("");
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: getGetConversationMessagesQueryKey(selectedContactId ?? 0) });
        }, 2000);
      },
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedConversation = conversations.find(c => c.contactId === selectedContactId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContactId) return;
    sendMutation.mutate({ contactId: selectedContactId!, data: { content: newMessage.trim() } });
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] lg:h-[calc(100vh-80px)] glass-premium rounded-3xl overflow-hidden border-white/5">
        {/* Conversations Sidebar */}
        <div className={`${selectedContactId ? "hidden lg:flex" : "flex"} lg:w-96 border-b lg:border-b-0 lg:border-r border-white/5 flex-col bg-black/20 backdrop-blur-sm max-h-[45vh] lg:max-h-none`}>
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Mensajes</h2>
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Settings className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar contacto..."
                className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-foreground focus:outline-none focus:border-primary/30 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <AnimatePresence>
              {conversations.length === 0 ? (
                <div className="p-10 text-center opacity-30">
                  <MessageCircle className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Sin Chats Activos</p>
                </div>
              ) : (
                conversations.map((conv, idx) => (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedContactId(conv.contactId)}
                    className={`flex items-center gap-4 p-5 cursor-pointer border-b border-white/5 transition-all group ${
                      selectedContactId === conv.contactId ? "bg-primary/10 border-l-4 border-l-primary" : "hover:bg-white/5"
                    }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-all shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                        <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{conv.contactName.charAt(0).toUpperCase()}</span>
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black rounded-full flex items-center justify-center text-[10px] font-black shadow-[0_0_10px_#00ff88]">
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">{conv.contactName}</span>
                        <span className="text-[9px] font-mono text-muted-foreground uppercase opacity-60">12:45</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate group-hover:text-foreground/70 transition-colors opacity-60">{conv.lastMessage ?? "Iniciando chat..."}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${selectedContactId ? "flex" : "hidden lg:flex"} flex-1 flex-col bg-black/40 min-h-0 relative`}>
          {selectedContactId ? (
            <>
              {/* Chat header */}
              <div className="p-6 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedContactId(null)}
                    className="lg:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(0,255,136,0.1)]">
                    <span className="text-sm font-black text-primary">{selectedConversation?.contactName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="text-sm font-black text-foreground uppercase tracking-tight">{selectedConversation?.contactName}</div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-tighter opacity-60">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      {selectedConversation?.contactPhone}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground hover:text-primary transition-all border border-white/5">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground hover:text-primary transition-all border border-white/5">
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6 scrollbar-hide">
                <AnimatePresence initial={false}>
                  {messages.map((msg, idx) => {
                    const isOutbound = msg.direction === "outbound";
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex items-end gap-3 ${isOutbound ? "justify-end" : "justify-start"}`}
                      >
                        {!isOutbound && (
                          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                            {msg.isBot ? <Bot className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-muted-foreground" />}
                          </div>
                        )}
                        <div className="flex flex-col gap-1 max-w-[80%] sm:max-w-[60%] lg:max-w-[50%]">
                          <div
                            className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                              isOutbound
                                ? "bg-primary text-black font-medium rounded-br-none glow-green shadow-[0_10px_20px_-10px_rgba(0,255,136,0.3)]"
                                : "glass border-white/10 text-foreground rounded-bl-none shadow-[0_10px_20px_-10px_rgba(0,0,0,0.4)]"
                            }`}
                          >
                            {msg.isBot && !isOutbound && (
                              <div className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase tracking-widest mb-1 opacity-70">
                                <Zap className="w-3 h-3 fill-current" />
                                Asistente IA
                              </div>
                            )}
                            {msg.content}
                          </div>
                          <div className={`text-[9px] font-mono uppercase tracking-tighter px-1 ${isOutbound ? "text-right text-primary/60" : "text-left text-muted-foreground/60"}`}>
                            {new Date(msg.sentAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 lg:p-10 pt-0">
                <form 
                  onSubmit={handleSend}
                  className="glass-premium rounded-2xl p-2 flex items-center gap-3 border-white/10 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)] focus-within:border-primary/40 transition-all"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-transparent border-none px-4 py-3 text-sm text-foreground focus:outline-none placeholder-muted-foreground/50"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!newMessage.trim() || sendMutation.isPending}
                    className="w-12 h-12 rounded-xl bg-primary text-black flex items-center justify-center hover:bg-primary/90 transition-all glow-green disabled:opacity-30 disabled:grayscale"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-10">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/5 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,255,255,0.02)]">
                  <MessageCircle className="w-10 h-10 text-muted-foreground opacity-20" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-foreground uppercase tracking-[0.3em]">Centro de Mensajes</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-60">Selecciona una conversación para comenzar</p>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
