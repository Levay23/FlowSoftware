import { useState } from "react";
import { useGetContacts, useCreateContact, useDeleteContact, getGetContactsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Plus, Search, Trash2, Tag, 
  Phone, Mail, X, UserPlus, Filter,
  ArrowUpRight, MoreHorizontal, User
} from "lucide-react";

export default function Contacts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", email: "", tags: "", notes: "" });

  const { data: contacts = [], isLoading } = useGetContacts({ search: search || undefined }, { query: { queryKey: getGetContactsQueryKey({ search: search || undefined }) } });

  const createMutation = useCreateContact({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetContactsQueryKey() });
        setShowAddModal(false);
        setNewContact({ name: "", phone: "", email: "", tags: "", notes: "" });
      },
    },
  });

  const deleteMutation = useDeleteContact({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetContactsQueryKey() });
      },
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      data: {
        name: newContact.name,
        phone: newContact.phone,
        email: newContact.email || null,
        tags: newContact.tags ? newContact.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        notes: newContact.notes || null,
      },
    });
  };

  return (
    <Layout>
      <div className="space-y-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest mb-3">
              <Users className="w-3 h-3 fill-current" />
              Gestión de Base de Datos de Clientes
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tight uppercase">
              Directorio <span className="gradient-cyber">Cyber</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Administra tus contactos y etiquetas para una segmentación inteligente.</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-black rounded-2xl text-xs font-black uppercase tracking-widest transition-all glow-green shadow-[0_0_20px_rgba(0,255,136,0.3)]"
          >
            <UserPlus className="w-4 h-4" />
            Vincular Contacto
          </motion.button>
        </motion.div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por identidad o frecuencia..."
              className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-mono"
            />
          </div>
          <button className="px-6 py-4 glass rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all border-white/5 hover:border-white/20">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {/* Contacts Table/Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-premium overflow-hidden border-white/5"
        >
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="text-left text-[10px] font-black text-muted-foreground px-8 py-6 uppercase tracking-[0.2em]">Entidad</th>
                  <th className="text-left text-[10px] font-black text-muted-foreground px-8 py-6 uppercase tracking-[0.2em]">Enlace (Teléfono)</th>
                  <th className="text-left text-[10px] font-black text-muted-foreground px-8 py-6 uppercase tracking-[0.2em]">Frecuencia (Email)</th>
                  <th className="text-left text-[10px] font-black text-muted-foreground px-8 py-6 uppercase tracking-[0.2em]">Segmentos</th>
                  <th className="text-right text-[10px] font-black text-muted-foreground px-8 py-6 uppercase tracking-[0.2em]">Protocolos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-8 py-6">
                          <div className="h-10 bg-white/5 rounded-xl w-full" />
                        </td>
                      </tr>
                    ))
                  ) : contacts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center opacity-30">
                        <Users className="w-16 h-16 mx-auto mb-4" />
                        <div className="text-xs font-black uppercase tracking-widest">Base de Datos Vacía</div>
                      </td>
                    </tr>
                  ) : (
                    contacts.map((contact, idx) => (
                      <motion.tr 
                        key={contact.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group hover:bg-white/5 transition-all"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.1)] group-hover:scale-110 transition-transform">
                              <span className="text-xs font-black text-primary">{contact.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{contact.name}</div>
                              <div className="text-[9px] text-muted-foreground font-mono uppercase opacity-60">ID: {contact.id.toString().slice(-6)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                            <Phone className="w-3.5 h-3.5 text-primary opacity-50" />
                            {contact.phone}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                            <Mail className="w-3.5 h-3.5 text-primary opacity-50" />
                            {contact.email ?? "N/A"}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-wrap gap-2">
                            {(contact.tags ?? []).map((tag: string) => (
                              <span key={tag} className="inline-flex items-center gap-1.5 text-[9px] font-black bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1 uppercase tracking-tighter">
                                <Tag className="w-2.5 h-2.5" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="w-9 h-9 flex items-center justify-center glass border-white/5 rounded-xl hover:text-primary transition-all">
                              <ArrowUpRight className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteMutation.mutate({ id: contact.id })}
                              className="w-9 h-9 flex items-center justify-center glass border-white/5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Add modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-premium p-10 border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(0,255,136,0.2)]">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Vincular Entidad</h2>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Nuevo registro en la red neuronal</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-muted-foreground hover:text-foreground transition-all border border-white/5">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Alias / Identidad *</label>
                    <input
                      type="text"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Enlace Móvil *</label>
                    <input
                      type="text"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all font-mono"
                      placeholder="+34 000 000 000"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Frecuencia de Red (Email)</label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Segmentos (Separar por comas)</label>
                  <input
                    type="text"
                    value={newContact.tags}
                    onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="VIP, CLIENTE, ACTIVO"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-4 glass border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 py-4 bg-primary text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all glow-green shadow-[0_0_15px_rgba(0,255,136,0.2)] disabled:opacity-50"
                  >
                    {createMutation.isPending ? "Procesando..." : "Confirmar Enlace"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
