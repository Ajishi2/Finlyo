import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getRecords, createRecord, updateRecord, deleteRecord } from "@/api/records";
import { format } from "date-fns";
import { useCanCreateRecord, useCanEditRecord, useCanDeleteRecord } from "@/hooks/useRolePermissions";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X, Download, ArrowUpDown, ArrowUp, ArrowDown, FileX, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { TableRowSkeleton } from "@/components/dashboard/SkeletonCards";
import { toast } from "@/hooks/use-toast";

type SortKey = "recordDate" | "category" | "type" | "amount" | "description";
type SortDir = "asc" | "desc";

export default function Records() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const canCreateRecord = useCanCreateRecord();
  const canDeleteRecord = useCanDeleteRecord();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filters, setFilters] = useState({ type: '', category: '', from: '', to: '', search: '', minAmount: '', maxAmount: '' });
  const [formData, setFormData] = useState({ amount: '', type: 'EXPENSE', category: 'Food', recordDate: '', description: '' });
  
  // Import CSV state
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Escape key closes modals
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setShowAddModal(false); setEditingRecord(null); setDeletingId(null); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['records', page, pageSize, filters],
    queryFn: () => {
      const params: any = { page, size: pageSize };
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.from) params.startDate = filters.from;
      if (filters.to) params.endDate = filters.to;
      if (filters.minAmount) params.minAmount = filters.minAmount;
      if (filters.maxAmount) params.maxAmount = filters.maxAmount;
      return getRecords(params);
    },
    placeholderData: (prev) => prev,
  });

  const rawRecords = (data as any)?.data?.data?.content || [];
  const totalPages = (data as any)?.data?.data?.totalPages || 1;
  const totalElements = (data as any)?.data?.data?.totalElements || 0;

  const records = useMemo(() => {
    if (!sortKey) return rawRecords;
    return [...rawRecords].sort((a: any, b: any) => {
      let cmp = 0;
      if (sortKey === "amount") cmp = a.amount - b.amount;
      else cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rawRecords, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleLogout = () => { logout(); navigate("/login"); };
  const handleFilterChange = (key: string, value: string) => { setFilters(prev => ({ ...prev, [key]: value })); setPage(0); };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRecord(formData);
      queryClient.invalidateQueries({ queryKey: ['records'] });
      setShowAddModal(false);
      setFormData({ amount: '', type: 'EXPENSE', category: 'Food', recordDate: '', description: '' });
      toast({ title: "Record created", description: "New transaction has been added." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create record.", variant: "destructive" });
    }
  };

  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    try {
      await updateRecord(editingRecord.id, formData);
      queryClient.invalidateQueries({ queryKey: ['records'] });
      setEditingRecord(null);
      toast({ title: "Record updated", description: "Transaction has been updated." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update record.", variant: "destructive" });
    }
  };

  const handleDeleteRecord = async (id: number) => {
    try {
      await deleteRecord(id);
      queryClient.invalidateQueries({ queryKey: ['records'] });
      setDeletingId(null);
      toast({ title: "Record deleted", description: "Transaction has been removed." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete record.", variant: "destructive" });
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Category', 'Type', 'Amount', 'Description'];
    const rows = records.map((r: any) => [r.recordDate, r.category, r.type, r.amount, r.description].join(','));
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'records.csv'; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${records.length} records exported as CSV.` });
  };

  // CSV Import Functions
  const VALID_CATEGORIES = ['Salary', 'Rent', 'Food', 'Transport', 'Utilities', 'Freelance', 'Healthcare', 'Education', 'Entertainment', 'Shopping', 'Investment', 'Other'];
  const VALID_TYPES = ['INCOME', 'EXPENSE'];

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    
    // Accept flexible header names
    const getIndex = (names: string[]) => names.findIndex(n => headers.includes(n));
    const dateIdx     = getIndex(['date', 'recorddate', 'record_date']);
    const typeIdx     = getIndex(['type']);
    const categoryIdx = getIndex(['category']);
    const amountIdx   = getIndex(['amount']);
    const descIdx     = getIndex(['description', 'notes', 'desc']);

    if ([dateIdx, typeIdx, categoryIdx, amountIdx].includes(-1)) {
      throw new Error('CSV must have columns: Date, Type, Category, Amount (Description is optional)');
    }

    return lines.slice(1).map((line, i) => {
      const cols = line.split(',').map(c => c.trim().replace(/"/g, ''));
      return {
        lineNumber: i + 2,
        recordDate: cols[dateIdx] || '',
        type: cols[typeIdx]?.toUpperCase() || '',
        category: cols[categoryIdx] || '',
        amount: cols[amountIdx] || '',
        description: descIdx >= 0 ? cols[descIdx] || '' : '',
      };
    }).filter(row => row.recordDate || row.amount); // skip blank lines
  };

  const validateRow = (row: any): string | null => {
    if (!row.recordDate || isNaN(Date.parse(row.recordDate)))
      return `Line ${row.lineNumber}: Invalid date "${row.recordDate}"`;
    if (!VALID_TYPES.includes(row.type))
      return `Line ${row.lineNumber}: Type must be INCOME or EXPENSE, got "${row.type}"`;
    if (!VALID_CATEGORIES.includes(row.category))
      return `Line ${row.lineNumber}: Invalid category "${row.category}". Valid: ${VALID_CATEGORIES.join(', ')}`;
    const amt = parseFloat(row.amount);
    if (isNaN(amt) || amt <= 0)
      return `Line ${row.lineNumber}: Amount must be a positive number, got "${row.amount}"`;
    return null;
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      toast({ title: "Invalid file", description: "Please upload a .csv file", variant: "destructive" });
      return;
    }

    setImporting(true);
    setImportResults(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      if (rows.length === 0) {
        toast({ title: "Empty file", description: "No records found in the CSV.", variant: "destructive" });
        setImporting(false);
        return;
      }

      if (rows.length > 500) {
        toast({ title: "Too many rows", description: "Maximum 500 records per import.", variant: "destructive" });
        setImporting(false);
        return;
      }

      // Validate all rows first before sending anything
      const errors: string[] = [];
      const validRows: any[] = [];

      rows.forEach(row => {
        const error = validateRow(row);
        if (error) errors.push(error);
        else validRows.push({
          recordDate: row.recordDate,
          type: row.type,
          category: row.category,
          amount: parseFloat(row.amount),
          description: row.description,
        });
      });

      // Send valid rows to backend
      let success = 0;
      let failed = 0;

      await Promise.allSettled(
        validRows.map(row =>
          createRecord(row)
            .then(() => { success++; })
            .catch(() => { 
              failed++;
              errors.push(`Failed to save: ${row.recordDate} ${row.category} ₹${row.amount}`);
            })
        )
      );

      // Refresh table
      queryClient.invalidateQueries({ queryKey: ['records'] });

      setImportResults({ success, failed: failed + (rows.length - validRows.length), errors });

      toast({
        title: success > 0 ? "Import complete" : "Import failed",
        description: `${success} records imported successfully${failed + (rows.length - validRows.length) > 0 ? `, ${failed + (rows.length - validRows.length)} failed` : ''}.`,
        variant: success > 0 ? "default" : "destructive",
      });

    } catch (err: any) {
      toast({ title: "Parse error", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
      // Reset file input so same file can be re-imported after fixes
      if (csvInputRef.current) csvInputRef.current.value = '';
    }
  };

  const openEditModal = (record: any) => {
    setFormData({ amount: String(record.amount), type: record.type, category: record.category, recordDate: record.recordDate, description: record.description });
    setEditingRecord(record);
  };

  const formatDate = (d: string) => format(new Date(d), 'dd MMM yyyy');
  const formatAmount = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
  const startRecord = page * pageSize + 1;
  const endRecord = Math.min(startRecord + records.length - 1, totalElements);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={12} className="ml-1 opacity-30" />;
    return sortDir === "asc" ? <ArrowUp size={12} className="ml-1" /> : <ArrowDown size={12} className="ml-1" />;
  };

  const sortableHeaders: { key: SortKey; label: string }[] = [
    { key: "recordDate", label: "Date" },
    { key: "category", label: "Category" },
    { key: "type", label: "Type" },
    { key: "amount", label: "Amount" },
    { key: "description", label: "Notes" },
  ];

  if (isError) {
    return (
      <DashboardLayout pageTitle="Records" userName={user?.name || user?.email || "User"} userRole={user?.role || "USER"} onLogout={handleLogout}>
        <div className="text-destructive">Error loading records. Please try again.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Records" userName={user?.name || user?.email || "User"} userRole={user?.role || "USER"} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Filter Bar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-4 relative z-[10000]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input type="text" placeholder="Search description..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)}
                className="dark-input w-full pl-9 pr-4 py-2.5 rounded-xl text-sm" />
            </div>
            <select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)} className="dark-input px-3 py-2.5 rounded-xl text-sm">
              <option value="">All Types</option><option value="INCOME">Income</option><option value="EXPENSE">Expense</option>
            </select>
            <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} className="dark-input px-3 py-2.5 rounded-xl text-sm">
              <option value="">All Categories</option>
              {['Salary', 'Rent', 'Food', 'Transport', 'Utilities', 'Freelance', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" value={filters.from} onChange={(e) => handleFilterChange('from', e.target.value)} className="dark-input px-3 py-2.5 rounded-xl text-sm" />
            <input type="date" value={filters.to} onChange={(e) => handleFilterChange('to', e.target.value)} className="dark-input px-3 py-2.5 rounded-xl text-sm" />
            
            {/* Import CSV button with hover tooltip */}
            {canCreateRecord && (
              <div className="relative group">
                {/* Hidden file input */}
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleImportCSV}
                />

                <motion.button
                  onClick={() => csvInputRef.current?.click()}
                  disabled={importing}
                  className="btn-ghost flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border border-[hsl(var(--border))]"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {importing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full"
                      />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload size={14} /> Import CSV
                    </>
                  )}
                </motion.button>

                {/* Hover tooltip — shows CSV format */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 hidden group-hover:block z-[10000] pointer-events-none">
                  {/* Arrow pointing up */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0"
                    style={{
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderBottom: '6px solid hsl(var(--border))',
                    }}
                  />
                  <div
                    className="glass-card rounded-xl p-3.5 text-left"
                    style={{
                      border: '1px solid hsl(var(--border))',
                      minWidth: '280px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }}
                  >
                    <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                      <span>Expected CSV format</span>
                    </p>

                    {/* Column definitions */}
                    <div className="space-y-1 mb-3">
                      {[
                        { col: 'Date',        hint: 'YYYY-MM-DD',              example: '2026-04-01' },
                        { col: 'Type',        hint: 'INCOME or EXPENSE',       example: 'INCOME' },
                        { col: 'Category',    hint: 'Salary, Rent, Food...',   example: 'Salary' },
                        { col: 'Amount',      hint: 'Positive number',         example: '50000' },
                        { col: 'Description', hint: 'Optional',                example: 'Monthly salary' },
                      ].map(({ col, hint, example }) => (
                        <div key={col} className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-foreground w-20">{col}</span>
                            <span className="text-xs text-muted-foreground">{hint}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Mini CSV preview */}
                    <div
                      className="rounded-lg p-2.5 font-mono"
                      style={{ background: 'hsl(var(--muted))', fontSize: '10px', lineHeight: '1.6' }}
                    >
                      <p className="text-muted-foreground">Date,Type,Category,Amount,Description</p>
                      <p className="text-emerald-400">2026-04-01,INCOME,Salary,50000,Monthly salary</p>
                      <p className="text-rose-400">2026-04-05,EXPENSE,Rent,15000,Monthly rent</p>
                      <p className="text-emerald-400">2026-04-10,INCOME,Freelance,8000,Side project</p>
                    </div>

                    {/* Valid categories */}
                    <div className="mt-2.5">
                      <p className="text-xs text-muted-foreground mb-1">Valid categories:</p>
                      <div className="flex flex-wrap gap-1">
                        {['Salary','Rent','Food','Transport','Utilities','Freelance','Other'].map(c => (
                          <span key={c}
                            className="text-xs px-1.5 py-0.5 rounded-md"
                            style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Export CSV */}
            <motion.button onClick={exportCSV} className="btn-ghost flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border border-[hsl(var(--border))]"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Download size={14} /> CSV
            </motion.button>
            {canCreateRecord && (
              <motion.button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Plus size={16} /> Add Record
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Import Results Panel */}
        <AnimatePresence>
          {importResults && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-card rounded-2xl p-4"
              style={{ border: importResults.failed > 0 ? '1px solid hsl(var(--destructive) / 0.3)' : '1px solid hsl(142 76% 36% / 0.3)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {importResults.failed === 0 ? (
                    <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle size={18} className="text-amber-500 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Import complete — {importResults.success} succeeded
                      {importResults.failed > 0 && `, ${importResults.failed} failed`}
                    </p>
                    {importResults.errors.length > 0 && (
                      <ul className="mt-2 space-y-0.5">
                        {importResults.errors.slice(0, 5).map((err, i) => (
                          <li key={i} className="text-xs text-muted-foreground">• {err}</li>
                        ))}
                        {importResults.errors.length > 5 && (
                          <li className="text-xs text-muted-foreground">
                            • ...and {importResults.errors.length - 5} more errors
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
                <motion.button
                  onClick={() => setImportResults(null)}
                  className="text-muted-foreground p-1 rounded-lg shrink-0"
                  whileHover={{ scale: 1.1 }}
                >
                  <X size={14} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl overflow-hidden">
          {isLoading ? <TableRowSkeleton rows={pageSize} /> : records.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <FileX size={48} className="text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No records found</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">No records match your filters. Try clearing the search or adjusting the date range.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                      {sortableHeaders.map(h => (
                        <th key={h.key} onClick={() => handleSort(h.key)}
                          className="px-6 py-3.5 text-left text-muted-foreground font-medium cursor-pointer select-none hover:text-foreground transition-colors"
                          style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                          <span className="flex items-center">{h.label}<SortIcon col={h.key} /></span>
                        </th>
                      ))}
                      <th className="px-6 py-3.5 text-left text-muted-foreground font-medium" style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record: any, i: number) => (
                      <motion.tr key={record.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                        className="table-row-hover group" style={{ borderBottom: "1px solid hsl(var(--border) / 0.5)" }}>
                        <td className="px-6 py-4 text-sm text-foreground">{formatDate(record.recordDate)}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{record.category}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${record.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                            {record.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground text-right font-bold tabular-nums">{formatAmount(record.amount)}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{record.description || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 opacity-50 transition-opacity duration-200 hover:opacity-100">
                            {useCanEditRecord(record.userId) && (
                              <motion.button onClick={() => openEditModal(record)} className="p-2 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                                whileHover={{ scale: 1.15 }}>
                                <Pencil size={14} />
                              </motion.button>
                            )}
                            {canDeleteRecord && (
                              <div className="relative">
                                <motion.button onClick={() => setDeletingId(deletingId === record.id ? null : record.id)}
                                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                                  whileHover={{ scale: 1.15 }}>
                                  <Trash2 size={14} />
                                </motion.button>
                                <AnimatePresence>
                                  {deletingId === record.id && (
                                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 4 }}
                                      className="absolute bottom-full right-0 mb-2 glass-card rounded-xl p-2.5 flex items-center gap-2 z-10" style={{ whiteSpace: "nowrap" }}>
                                      <span className="text-xs text-muted-foreground">Delete?</span>
                                      <button onClick={() => handleDeleteRecord(record.id)} className="text-xs px-2.5 py-1 rounded-lg font-medium text-destructive" style={{ background: "hsl(var(--destructive) / 0.12)" }}>Yes</button>
                                      <button onClick={() => setDeletingId(null)} className="text-xs px-2.5 py-1 rounded-lg text-muted-foreground">Cancel</button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-muted-foreground">Showing {startRecord} to {endRecord} of {totalElements}</p>
                  <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(0); }}
                    className="dark-input px-2 py-1 rounded-lg text-xs">
                    <option value={10}>10 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <motion.button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground disabled:opacity-30"
                    style={{ background: "hsl(var(--muted))" }}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <ChevronLeft size={14} />
                  </motion.button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <motion.button key={i} onClick={() => setPage(i)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium"
                      style={{
                        background: page === i ? "linear-gradient(135deg, hsl(var(--primary)), hsl(24 90% 40%))" : "hsl(var(--muted))",
                        color: page === i ? "white" : "hsl(var(--muted-foreground))",
                        boxShadow: page === i ? "0 2px 10px hsl(var(--primary) / 0.3)" : "none",
                      }}
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      {i + 1}
                    </motion.button>
                  ))}
                  <motion.button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground disabled:opacity-30"
                    style={{ background: "hsl(var(--muted))" }}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <ChevronRight size={14} />
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {(showAddModal || editingRecord) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
            onClick={() => { setShowAddModal(false); setEditingRecord(null); }}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="glass-card rounded-2xl p-6 w-full max-w-md" style={{ border: '1px solid hsl(var(--border))' }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">{editingRecord ? 'Edit Record' : 'Add Record'}</h2>
                <motion.button onClick={() => { setShowAddModal(false); setEditingRecord(null); }} className="text-muted-foreground p-1 rounded-lg"
                  whileHover={{ scale: 1.1, rotate: 90 }}><X size={18} /></motion.button>
              </div>
              <form onSubmit={editingRecord ? handleUpdateRecord : handleAddRecord} className="space-y-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Amount</label>
                  <input type="number" value={formData.amount} onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))} className="dark-input w-full px-3 py-2.5 rounded-xl text-sm" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Type</label>
                    <select value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))} className="dark-input w-full px-3 py-2.5 rounded-xl text-sm">
                      <option value="INCOME">Income</option><option value="EXPENSE">Expense</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Category</label>
                    <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} className="dark-input w-full px-3 py-2.5 rounded-xl text-sm">
                      {['Salary', 'Rent', 'Food', 'Transport', 'Utilities', 'Freelance', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Date</label>
                  <input type="date" value={formData.recordDate} onChange={e => setFormData(p => ({ ...p, recordDate: e.target.value }))} className="dark-input w-full px-3 py-2.5 rounded-xl text-sm" required />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Description</label>
                  <input type="text" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="dark-input w-full px-3 py-2.5 rounded-xl text-sm" />
                </div>
                <div className="flex gap-3 pt-2">
                  <motion.button type="button" onClick={() => { setShowAddModal(false); setEditingRecord(null); }} className="flex-1 px-4 py-2.5 rounded-xl text-sm btn-ghost"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Cancel</motion.button>
                  <motion.button type="submit" className="flex-1 px-4 py-2.5 rounded-xl text-sm btn-primary font-semibold"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>{editingRecord ? 'Update' : 'Save'}</motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
