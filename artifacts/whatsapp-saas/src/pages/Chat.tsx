import { useState, useEffect, useRef } from "react";
import { useGetConversations, useGetConversationMessages, useSendConversationMessage, getGetConversationsQueryKey, getGetConversationMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { MessageCircle, Send, Bot, User } from "lucide-react";

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
      <div className="flex flex-col lg:flex-row h-[calc(100vh-65px)] lg:h-full">
        <div className={`${selectedContactId ? "hidden lg:flex" : "flex"} lg:w-80 border-b lg:border-b-0 lg:border-r border-border flex-col bg-card max-h-[45vh] lg:max-h-none`}>
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm text-foreground">Conversaciones</h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">Sin conversaciones</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  data-testid={`conv-${conv.id}`}
                  onClick={() => setSelectedContactId(conv.contactId)}
                  className={`flex items-center gap-3 p-4 cursor-pointer border-b border-border transition-all ${
                    selectedContactId === conv.contactId ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-muted/30"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{conv.contactName.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground truncate">{conv.contactName}</span>
                      {conv.unreadCount > 0 && (
                        <span className="text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage ?? "Sin mensajes"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`${selectedContactId ? "flex" : "hidden lg:flex"} flex-1 flex-col bg-background min-h-0`}>
          {selectedContactId ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-border bg-card flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedContactId(null)}
                  className="lg:hidden text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground"
                >
                  Volver
                </button>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{selectedConversation?.contactName.charAt(0)}</span>
                </div>
                <div>
                  <div className="font-medium text-sm text-foreground">{selectedConversation?.contactName}</div>
                  <div className="text-xs text-muted-foreground">{selectedConversation?.contactPhone}</div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    data-testid={`msg-${msg.id}`}
                    className={`flex items-end gap-2 ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.direction === "inbound" && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-1 bg-muted/50">
                        {msg.isBot ? <Bot className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    )}
                    <div
                      className={`max-w-[78vw] sm:max-w-xs lg:max-w-md rounded-2xl px-4 py-2.5 ${
                        msg.direction === "outbound"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-card border border-border text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.isBot && msg.direction === "inbound" && (
                        <div className="text-xs text-primary font-medium mb-1">Bot IA</div>
                      )}
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <div className={`text-xs mt-1 ${msg.direction === "outbound" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {new Date(msg.sentAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <form onSubmit={handleSend} className="p-4 border-t border-border bg-card">
                <div className="flex items-center gap-3">
                  <input
                    data-testid="input-chat-message"
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-background border border-border rounded-full px-5 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all"
                  />
                  <button
                    data-testid="btn-send-message"
                    type="submit"
                    disabled={!newMessage.trim() || sendMutation.isPending}
                    className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-all glow-green-sm disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                <h3 className="font-semibold text-foreground mb-2">Selecciona una conversacion</h3>
                <p className="text-sm text-muted-foreground">Elige un contacto de la lista para ver el historial</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
