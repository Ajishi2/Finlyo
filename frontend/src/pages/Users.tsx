import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getUsers, createUser, updateUser, updateUserStatus } from "@/api/users";
import { format } from "date-fns";
import { UserPlus, Edit2, Search, ChevronLeft, ChevronRight, Users as UsersIcon, UserCheck, Shield, Eye, EyeOff, X } from "lucide-react";
import { useCanManageUsers } from "@/hooks/useRolePermissions";
import { motion, AnimatePresence } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";
import { StatCardSkeleton } from "@/components/dashboard/SkeletonCards";
import { toast } from "@/hooks/use-toast";

interface User { id: number; firstName: string; lastName: string; email: string; role: string; status: string; createdAt: string; }
interface UsersResponse { content: User[]; totalElements: number; totalPages: number; number: number; size: number; }
interface FormErrors { firstName?: string; lastName?: string; email?: string; password?: string; role?: string; status?: string; general?: string; }

function MiniStatCard({ label, value, icon: Icon, accentColor, index }: { label: string; value: number; icon: any; accentColor: string; index: number }) {
  const displayValue = useCountUp(value);
  const glowMap: Record<string, string> = {
    "hsl(24 95% 53%)": "stat-glow-orange",
    "hsl(160 84% 39%)": "stat-glow-emerald",
    "hsl(347 77% 63%)": "stat-glow-rose",
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`glass-card card-highlight rounded-2xl p-5 ${glowMap[accentColor] || ''}`}
      style={{ borderTop: `2px solid ${accentColor}` }}>
      <motion.div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${accentColor}15` }} whileHover={{ rotate: 10, scale: 1.1 }}>
        <Icon size={18} style={{ color: accentColor }} />
      </motion.div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold text-foreground">{displayValue}</p>
    </motion.div>
  );
}

export default function UsersPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canManageUsers = useCanManageUsers();

  useEffect(() => { if (!isAuthenticated) navigate("/login"); }, [isAuthenticated, navigate]);
  useEffect(() => { if (isAuthenticated && !canManageUsers) navigate("/dashboard"); }, [isAuthenticated, canManageUsers, navigate]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") { setShowAddModal(false); setShowEditModal(false); setSelectedUser(null); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "", role: "VIEWER", status: "ACTIVE" });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const { data, isLoading, isError } = useQuery({ queryKey: ['users', page], queryFn: () => getUsers({ page, size: 10 }), retry: false });

  const createUserMutation = useMutation({
    mutationFn: (userData: any) => createUser(userData),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['users'] }); 
      queryClient.refetchQueries({ queryKey: ['users'] });
      setShowAddModal(false); 
      setFormData({ firstName: "", lastName: "", email: "", password: "", role: "VIEWER", status: "ACTIVE" }); 
      setFormErrors({}); 
      toast({ title: "User created", description: "New user has been added." }); 
    },
    onError: (error: any) => { if (error.response?.status === 409) setFormErrors({ email: "Email already registered." }); else setFormErrors({ general: "Failed to create user." }); }
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: any }) => updateUser(id, userData),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['users'] }); 
      queryClient.refetchQueries({ queryKey: ['users'] });
      setShowEditModal(false); 
      setSelectedUser(null); 
      setFormErrors({}); 
      toast({ title: "User updated", description: "User details have been saved." }); 
    },
    onError: () => { setFormErrors({ general: "Failed to update user." }); }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateUserStatus(id, status),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['users'] }); 
      queryClient.refetchQueries({ queryKey: ['users'] });
      toast({ title: "Status changed", description: "User status has been updated." }); 
    },
  });

  const handleLogout = () => { logout(); navigate("/login"); };
  const handleAddUser = () => { setFormData({ firstName: "", lastName: "", email: "", password: "", role: "VIEWER", status: "ACTIVE" }); setFormErrors({}); setShowAddModal(true); };
  const handleEditUser = (u: User) => { setSelectedUser(u); setFormData({ firstName: u.firstName, lastName: u.lastName, email: u.email, password: "", role: u.role, status: u.status }); setFormErrors({}); setShowEditModal(true); };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: any = {};
    if (!formData.firstName.trim()) errors.firstName = "Required";
    if (!formData.lastName.trim()) errors.lastName = "Required";
    if (!formData.email.trim()) errors.email = "Required";
    if (!formData.password.trim()) errors.password = "Required";
    if (Object.keys(errors).length) { setFormErrors(errors); return; }
    createUserMutation.mutate({ firstName: formData.firstName, lastName: formData.lastName, email: formData.email, password: formData.password, role: formData.role });
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    updateUserMutation.mutate({ id: selectedUser.id, userData: { role: formData.role, status: formData.status } });
  };

  const handleStatusToggle = (u: User) => {
    const newStatus = u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    updateStatusMutation.mutate({ id: u.id, status: newStatus });
  };

  const filteredUsers = (data as UsersResponse)?.content?.filter(u => {
    const matchesSearch = search === "" || u.firstName.toLowerCase().includes(search.toLowerCase()) || u.lastName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  const usersData = data as UsersResponse;
  const totalUsers = usersData?.totalElements || 0;
  const totalPages = usersData?.totalPages || 0;
  const activeUsersCount = usersData?.content?.filter(u => u.status === "ACTIVE").length || 0;
  const adminsCount = usersData?.content?.filter(u => u.role === "ADMIN").length || 0;
  const startRecord = page * 10 + 1;
  const endRecord = Math.min(startRecord + filteredUsers.length - 1, totalUsers);

  const getRoleBadgeClass = (role: string) => {
    switch (role) { case "ADMIN": return "badge-admin"; case "ANALYST": return "badge-analyst"; default: return "badge-viewer"; }
  };
  const formatDate = (d: string) => format(new Date(d), 'dd MMM yyyy');

  if (isError) {
    return (
      <DashboardLayout pageTitle="Users" userName={user?.name || user?.email || "User"} userRole={user?.role || "USER"} onLogout={handleLogout}>
        <div className="text-center py-12">
          <p className="text-destructive mb-4">Failed to load users.</p>
          <motion.button onClick={() => window.location.reload()} className="btn-primary px-4 py-2 rounded-xl text-sm"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Retry</motion.button>
        </div>
      </DashboardLayout>
    );
  }

  const renderModal = (isEdit: boolean) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
      onClick={() => { setShowAddModal(false); setShowEditModal(false); setSelectedUser(null); }}>
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="glass-card rounded-2xl p-6 w-full max-w-md" style={{ border: '1px solid hsl(var(--border))' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground">{isEdit ? 'Edit User' : 'Add New User'}</h2>
          <motion.button onClick={() => { setShowAddModal(false); setShowEditModal(false); setSelectedUser(null); }} className="text-muted-foreground p-1 rounded-lg"
            whileHover={{ scale: 1.1, rotate: 90 }}><X size={18} /></motion.button>
        </div>
        <form onSubmit={isEdit ? handleUpdateUser : handleCreateUser} className="space-y-4">
          {!isEdit && (
            <>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">First Name</label>
                <input type="text" value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))} className="dark-input w-full px-3 py-2.5 rounded-xl text-sm" />
                {formErrors.firstName && <p className="text-xs mt-1 text-destructive">{formErrors.firstName}</p>}
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Last Name</label>
                <input type="text" value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))} className="dark-input w-full px-3 py-2.5 rounded-xl text-sm" />
                {formErrors.lastName && <p className="text-xs mt-1 text-destructive">{formErrors.lastName}</p>}
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className="dark-input w-full px-3 py-2.5 rounded-xl text-sm" />
                {formErrors.email && <p className="text-xs mt-1 text-destructive">{formErrors.email}</p>}
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} className="dark-input w-full px-3 py-2.5 pr-10 rounded-xl text-sm" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {formErrors.password && <p className="text-xs mt-1 text-destructive">{formErrors.password}</p>}
              </div>
            </>
          )}
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Role</label>
            <select value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
              disabled={isEdit && selectedUser?.email === user?.email}
              className="dark-input w-full px-3 py-2.5 rounded-xl text-sm disabled:opacity-50">
              {isEdit && <option value="ADMIN">Admin</option>}
              <option value="ANALYST">Analyst</option>
              <option value="VIEWER">Viewer</option>
            </select>
            {isEdit && selectedUser?.email === user?.email && <p className="text-xs text-muted-foreground mt-1">Cannot change your own role.</p>}
          </div>
          {isEdit && (
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Status</label>
              <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))} className="dark-input w-full px-3 py-2.5 rounded-xl text-sm">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          )}
          {formErrors.general && <p className="text-xs text-destructive">{formErrors.general}</p>}
          <div className="flex gap-3 pt-2">
            <motion.button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); setSelectedUser(null); }} className="flex-1 px-4 py-2.5 rounded-xl text-sm btn-ghost"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Cancel</motion.button>
            <motion.button type="submit" disabled={createUserMutation.isPending || updateUserMutation.isPending} className="flex-1 px-4 py-2.5 rounded-xl text-sm btn-primary font-semibold"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {(createUserMutation.isPending || updateUserMutation.isPending) ? "Saving..." : isEdit ? "Update" : "Create"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );

  return (
    <DashboardLayout pageTitle="Users" userName={user?.name || user?.email || "User"} userRole={user?.role || "USER"} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map(i => <StatCardSkeleton key={i} index={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MiniStatCard label="Total Users" value={totalUsers} icon={UsersIcon} accentColor="hsl(24 95% 53%)" index={0} />
            <MiniStatCard label="Active Users" value={activeUsersCount} icon={UserCheck} accentColor="hsl(160 84% 39%)" index={1} />
            <MiniStatCard label="Admins" value={adminsCount} icon={Shield} accentColor="hsl(347 77% 63%)" index={2} />
          </div>
        )}

        {/* Filter Bar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="dark-input w-full pl-9 pr-4 py-2.5 rounded-xl text-sm" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="dark-input px-3 py-2.5 rounded-xl text-sm">
              <option value="ALL">All Roles</option><option value="ADMIN">Admin</option><option value="ANALYST">Analyst</option><option value="VIEWER">Viewer</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="dark-input px-3 py-2.5 rounded-xl text-sm">
              <option value="ALL">All Status</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
            </select>
            <motion.button onClick={handleAddUser} className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <UserPlus size={16} /> Add User
            </motion.button>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card card-highlight rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  {[100, 140, 60, 60, 80, 40].map((w, j) => <div key={j} className="skeleton h-4" style={{ width: w }} />)}
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <UsersIcon size={48} className="text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No users found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                      {["Name", "Email", "Role", "Status", "Joined", "Actions"].map(h => (
                        <th key={h} className="text-left py-3.5 px-6 text-muted-foreground font-medium" style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, i) => (
                      <motion.tr key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.3 }}
                        className="table-row-hover group" style={{ borderBottom: "1px solid hsl(var(--border) / 0.5)" }}>
                        <td className="py-4 px-6 text-sm font-medium text-foreground">{u.firstName} {u.lastName}</td>
                        <td className="py-4 px-6 text-sm text-muted-foreground">{u.email}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeClass(u.role)}`}>{u.role}</span>
                        </td>
                        <td className="py-4 px-6">
                          {u.email === user?.email ? (
                            <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${u.status === "ACTIVE" ? "badge-income" : "badge-viewer"}`}>{u.status}</span>
                          ) : (
                            <motion.button onClick={() => handleStatusToggle(u)} disabled={updateStatusMutation.isPending}
                              className="relative inline-flex h-6 w-11 items-center rounded-full status-toggle"
                              style={{ backgroundColor: u.status === "ACTIVE" ? "hsl(var(--emerald))" : "hsl(var(--muted))" }}
                              whileTap={{ scale: 0.95 }}>
                              <motion.span className="inline-block h-4 w-4 rounded-full toggle-circle bg-white shadow-sm"
                                animate={{ x: u.status === "ACTIVE" ? 24 : 4 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                            </motion.button>
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm text-muted-foreground">{formatDate(u.createdAt)}</td>
                        <td className="py-4 px-6">
                          <motion.button onClick={() => handleEditUser(u)} className="p-2 rounded-lg opacity-50 transition-opacity duration-200 text-muted-foreground hover:text-primary hover:opacity-100"
                            whileHover={{ scale: 1.15 }}>
                            <Edit2 size={14} />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                <p className="text-xs text-muted-foreground">Showing {startRecord} to {endRecord} of {totalUsers}</p>
                <div className="flex items-center gap-1">
                  <motion.button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground disabled:opacity-30 bg-muted"
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <ChevronLeft size={14} />
                  </motion.button>
                  <span className="px-3 py-1 text-xs text-muted-foreground">Page {page + 1} of {totalPages || 1}</span>
                  <motion.button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground disabled:opacity-30 bg-muted"
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <ChevronRight size={14} />
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showAddModal && renderModal(false)}
        {showEditModal && selectedUser && renderModal(true)}
      </AnimatePresence>
    </DashboardLayout>
  );
}
