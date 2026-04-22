import { useState } from "react";
import { useGetContacts, useCreateContact, useDeleteContact, getGetContactsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Users, Plus, Search, Trash2, Tag, Phone, Mail, X } from "lucide-react";

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
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Contactos</h1>
            <p className="text-muted-foreground text-sm mt-1">{contacts.length} contactos registrados</p>
          </div>
          <button
            data-testid="btn-add-contact"
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-all glow-green-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo contacto
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            data-testid="input-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o telefono..."
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-4 uppercase tracking-wider">Nombre</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-4 uppercase tracking-wider">Telefono</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-4 uppercase tracking-wider">Email</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-4 uppercase tracking-wider">Etiquetas</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-4 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-8 bg-muted/50 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-sm text-muted-foreground">No hay contactos</p>
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr key={contact.id} data-testid={`row-contact-${contact.id}`} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{contact.name.charAt(0)}</span>
                          </div>
                          <span className="text-sm font-medium text-foreground">{contact.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3.5 h-3.5" />
                          {contact.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-3.5 h-3.5" />
                          {contact.email ?? "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {(contact.tags ?? []).map((tag: string) => (
                            <span key={tag} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-1">
                              <Tag className="w-2.5 h-2.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          data-testid={`btn-delete-contact-${contact.id}`}
                          onClick={() => deleteMutation.mutate({ id: contact.id })}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="md:hidden divide-y divide-border">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="p-4">
                  <div className="h-24 bg-muted/50 rounded-lg animate-pulse" />
                </div>
              ))
            ) : contacts.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No hay contactos</p>
              </div>
            ) : (
              contacts.map((contact) => (
                <div key={contact.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">{contact.name.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{contact.name}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span className="truncate">{contact.phone}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      data-testid={`btn-delete-contact-mobile-${contact.id}`}
                      onClick={() => deleteMutation.mutate({ id: contact.id })}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {contact.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {(contact.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {(contact.tags ?? []).map((tag: string) => (
                        <span key={tag} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-1">
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-foreground">Nuevo Contacto</h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nombre *</label>
                <input
                  data-testid="input-contact-name"
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Telefono *</label>
                <input
                  data-testid="input-contact-phone"
                  type="text"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                  placeholder="+34 612 345 678"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  data-testid="input-contact-email"
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Etiquetas (separadas por comas)</label>
                <input
                  data-testid="input-contact-tags"
                  type="text"
                  value={newContact.tags}
                  onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                  placeholder="cliente, vip, activo"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted/50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  data-testid="btn-save-contact"
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {createMutation.isPending ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
