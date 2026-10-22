import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppNotif, Reminder, Report, ScheduleRow, SEED_REMINDERS, SEED_STOCK, SEED_TASKS, SEED_USERS, SEED_VISITS, StockItem, TaskTemplate, todayKey, uid, User, Visit, CheckState, nowTime } from './data';

type Checks = Record<string, Record<string, Record<string, CheckState>>>;

interface Store {
  users: User[];
  session: User | null;
  login: (id: string, pass: string) => { ok: boolean; msg?: string };
  logout: () => void;
  upsertUser: (u: Partial<User> & { id?: string }) => void;
  toggleUser: (id: string) => void;
  checks: Checks;
  setCheck: (taskId: string, patch: Partial<CheckState>) => void;
  customTasks: TaskTemplate[];
  addTask: (t: Omit<TaskTemplate, 'id'>) => void;
  removeTask: (id: string) => void;
  reports: Report[];
  submitReport: (summary: string) => Report;
  reviewReport: (id: string, status: 'disetujui' | 'ditolak', note: string, by: string) => void;
  stock: StockItem[];
  setStock: (id: string, delta: number) => void;
  addStock: (name: string, unit: string, stockN: number, min: number) => void;
  visits: Visit[];
  addVisit: (v: Omit<Visit, 'id'>) => void;
  schedules: ScheduleRow[];
  addSchedule: (s: Omit<ScheduleRow, 'id'>) => void;
  removeSchedule: (id: string) => void;
  reminders: Reminder[];
  upsertReminder: (r: Partial<Reminder> & { id?: string }) => void;
  removeReminder: (id: string) => void;
  notifs: AppNotif[];
  pushNotif: (n: Omit<AppNotif, 'id' | 'time' | 'read'>) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  dateKey: string;
  setDateKey: (d: string) => void;
  seedDemo: () => void;
}

const Ctx = createContext<Store | null>(null);
const LS = 'kkm-bekasi-v1';

function load(): any {
  try { const raw = localStorage.getItem(LS); if (raw) return JSON.parse(raw); } catch { /* noop */ }
  return null;
}

function defaultChecks(): Checks { return {}; }

function seedReports(): Report[] {
  return [
    { id: 'R-2401', date: '2026-10-20', userId: 'u4', userName: 'Andi Pratama', jabatan: 'Goreng · Station Ayam', role: 'goreng', shift: 'Pagi', totalTasks: 10, doneCount: 10, okCount: 8, perluCount: 1, masalahCount: 1, percent: 100, summary: 'Semua station goreng beres. Fryer 2 sempat overheat siang hari, sudah didinginkan 20 menit.', problemNotes: ['Fryer 2 overheat pkl 13.40 — perlu servis thermostat'], status: 'disetujui', createdAt: '2026-10-20 21:45', reviewedBy: 'Rahmat', reviewNote: 'OK, jadwalkan servis fryer.' },
    { id: 'R-2402', date: '2026-10-20', userId: 'u5', userName: 'Siti Rahayu', jabatan: 'Goreng · Station Lele & Sambal', role: 'goreng', shift: 'Siang', totalTasks: 10, doneCount: 9, okCount: 8, perluCount: 1, masalahCount: 0, percent: 90, summary: 'Sambal & lalapan refill lancar. 1 tugas refill terakhir terlewat karena antrian kasir.', problemNotes: [], status: 'menunggu', createdAt: '2026-10-20 21:50' },
  ];
}

function seedSchedules(): ScheduleRow[] {
  const t = todayKey();
  return [
    { id: 'sc1', userId: 'u1', date: t, shift: 'Full', note: 'Komandan — kontrol total' },
    { id: 'sc2', userId: 'u2', date: t, shift: 'Pagi', note: 'Sidak fryer & gudang' },
    { id: 'sc3', userId: 'u3', date: t, shift: 'Pagi', note: 'Kalibrasi rasa' },
    { id: 'sc4', userId: 'u4', date: t, shift: 'Pagi', note: 'Station ayam' },
    { id: 'sc5', userId: 'u5', date: t, shift: 'Siang', note: 'Station lele & sambal' },
    { id: 'sc6', userId: 'u6', date: t, shift: 'Siang', note: 'Operasional sore' },
  ];
}

function seedNotifs(): AppNotif[] {
  return [
    { id: 'n1', type: 'stok', title: 'Bahan baku menipis', message: 'Minyak goreng tersisa 6 liter (minimum 10 liter). Segera order ke supplier.', time: '07:15', read: false },
    { id: 'n2', type: 'persetujuan', title: 'Laporan menunggu persetujuan', message: 'Laporan Siti Rahayu (20 Okt) menunggu review Wakil/Komandan.', time: '21:50', read: false },
    { id: 'n3', type: 'tugas', title: 'Reminder: Kontrol jam ramai siang', message: 'Pukul 11.30 — pastikan station goreng & prasmanan siap.', time: '11:30', read: false },
  ];
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const saved = useMemo(load, []);
  const [users, setUsers] = useState<User[]>(saved?.users ?? SEED_USERS);
  const [session, setSession] = useState<User | null>(saved?.session ?? null);
  const [checks, setChecks] = useState<Checks>(saved?.checks ?? defaultChecks());
  const [customTasks, setCustomTasks] = useState<TaskTemplate[]>(saved?.customTasks ?? []);
  const [reports, setReports] = useState<Report[]>(saved?.reports ?? seedReports());
  const [stock, setStockState] = useState<StockItem[]>(saved?.stock ?? SEED_STOCK);
  const [visits, setVisits] = useState<Visit[]>(saved?.visits ?? SEED_VISITS);
  const [schedules, setSchedules] = useState<ScheduleRow[]>(saved?.schedules ?? seedSchedules());
  const [reminders, setReminders] = useState<Reminder[]>(saved?.reminders ?? SEED_REMINDERS);
  const [notifs, setNotifs] = useState<AppNotif[]>(saved?.notifs ?? seedNotifs());
  const [dateKey, setDateKey] = useState<string>(todayKey());

  useEffect(() => {
    try { localStorage.setItem(LS, JSON.stringify({ users, session, checks, customTasks, reports, stock, visits, schedules, reminders, notifs })); } catch { /* noop */ }
  }, [users, session, checks, customTasks, reports, stock, visits, schedules, reminders, notifs]);

  // keep session object in sync with users (role/shift edits)
  useEffect(() => {
    if (session) { const fresh = users.find(u => u.id === session.id); if (fresh && JSON.stringify(fresh) !== JSON.stringify(session)) setSession(fresh); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  const api: Store = {
    users, session, checks, customTasks, reports, stock, visits, schedules, reminders, notifs, dateKey, setDateKey,
    login: (id, pass) => {
      const u = users.find(x => x.username.toLowerCase() === id.toLowerCase() || x.email.toLowerCase() === id.toLowerCase());
      if (!u) return { ok: false, msg: 'Akun tidak ditemukan. Coba username / email demo di bawah.' };
      if (!u.active) return { ok: false, msg: 'Akun dinonaktifkan. Hubungi Komandan Mispin.' };
      if (u.password !== pass) return { ok: false, msg: 'Password salah. Periksa kembali.' };
      setSession(u);
      return { ok: true };
    },
    logout: () => setSession(null),
    upsertUser: (u) => setUsers(prev => {
      if (u.id) return prev.map(x => x.id === u.id ? { ...x, ...u } as User : x);
      const nu: User = { id: uid('u'), name: u.name || 'Anggota Baru', username: u.username || ('user' + Math.floor(Math.random() * 900 + 100)), email: u.email || '', password: u.password || 'dapur123', role: (u.role as any) || 'goreng', jabatan: u.jabatan || 'Goreng · Dapur', shift: (u.shift as any) || 'Pagi', active: true, color: u.color || '#0A2540' };
      return [...prev, nu];
    }),
    toggleUser: (id) => setUsers(prev => prev.map(x => x.id === id ? { ...x, active: !x.active } : x)),
    setCheck: (taskId, patch) => {
      if (!session) return;
      const dk = dateKey;
      setChecks(prev => {
        const cur = prev[dk]?.[session.id]?.[taskId] ?? { done: false, status: 'ok' as const, keterangan: '', catatan: '', updatedAt: '' };
        return { ...prev, [dk]: { ...(prev[dk] || {}), [session.id]: { ...(prev[dk]?.[session.id] || {}), [taskId]: { ...cur, ...patch, updatedAt: nowTime() } } } };
      });
    },
    addTask: (t) => setCustomTasks(prev => [...prev, { ...t, id: uid('c') }]),
    removeTask: (id) => setCustomTasks(prev => prev.filter(t => t.id !== id)),
    submitReport: (summary) => {
      if (!session) throw new Error('no session');
      const all = [...SEED_TASKS, ...customTasks];
      const mine = checks[dateKey]?.[session.id] || {};
      // tasks relevant to role
      const rel = all.filter(t => session.role === 'goreng' ? (t.position === 'Goreng' || t.position === 'Semua') : session.role === 'koki' ? true : true);
      let done = 0, ok = 0, perlu = 0, masalah = 0;
      const probs: string[] = [];
      rel.forEach(t => {
        const c = mine[t.id];
        if (c?.done) { done++; if (c.status === 'ok') ok++; else if (c.status === 'perlu') perlu++; else masalah++; if (c.catatan) probs.push(`${t.title} — ${c.catatan}`); }
      });
      const pct = rel.length ? Math.round((done / rel.length) * 100) : 0;
      const r: Report = { id: 'R-' + Math.floor(1000 + Math.random() * 9000), date: dateKey, userId: session.id, userName: session.name, jabatan: session.jabatan, role: session.role, shift: session.shift, totalTasks: rel.length, doneCount: done, okCount: ok, perluCount: perlu, masalahCount: masalah, percent: pct, summary, problemNotes: probs, status: 'menunggu', createdAt: `${dateKey} ${nowTime()}` };
      setReports(prev => [r, ...prev]);
      setNotifs(prev => [{ id: uid('n'), type: 'persetujuan', title: 'Laporan baru menunggu persetujuan', message: `${session.name} mengirim laporan ${r.id} (${pct}% selesai).`, time: nowTime(), read: false }, ...prev]);
      return r;
    },
    reviewReport: (id, status, note, by) => {
      setReports(prev => prev.map(r => r.id === id ? { ...r, status, reviewNote: note, reviewedBy: by } : r));
      setNotifs(prev => [{ id: uid('n'), type: 'persetujuan', title: status === 'disetujui' ? 'Laporan disetujui' : 'Laporan ditolak', message: `Laporan ${id} ${status} oleh ${by}.`, time: nowTime(), read: false }, ...prev]);
    },
    setStock: (id, delta) => setStockState(prev => prev.map(s => s.id === id ? { ...s, stock: Math.max(0, s.stock + delta), updatedAt: nowTime() } : s)),
    addStock: (name, unit, stockN, min) => setStockState(prev => [...prev, { id: uid('s'), name, unit, stock: stockN, min, updatedAt: nowTime() }]),
    addVisit: (v) => setVisits(prev => [{ ...v, id: uid('v') }, ...prev]),
    addSchedule: (s) => setSchedules(prev => [...prev, { ...s, id: uid('sc') }]),
    removeSchedule: (id) => setSchedules(prev => prev.filter(s => s.id !== id)),
    upsertReminder: (r) => setReminders(prev => r.id ? prev.map(x => x.id === r.id ? { ...x, ...r } as Reminder : x) : [...prev, { label: r.label || 'Reminder baru', time: r.time || '08:00', phase: r.phase || 'operasional', active: true, id: uid('r') }]),
    removeReminder: (id) => setReminders(prev => prev.filter(r => r.id !== id)),
    pushNotif: (n) => setNotifs(prev => [{ ...n, id: uid('n'), time: nowTime(), read: false }, ...prev]),
    markAllRead: () => setNotifs(prev => prev.map(n => ({ ...n, read: true }))),
    markRead: (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)),
    seedDemo: () => {
      // prefill today's checks for demo delight for Andi
      const dk = todayKey();
      setChecks(prev => ({
        ...prev,
        [dk]: {
          ...(prev[dk] || {}),
          u4: { t01: { done: true, status: 'ok', keterangan: 'Fryer 1&2 suhu 175°C stabil', catatan: '', updatedAt: '06:15' }, t02: { done: true, status: 'ok', keterangan: '15 ekor termarinasi', catatan: '', updatedAt: '06:45' }, t03: { done: true, status: 'perlu', keterangan: 'Sambal kurang pedas, tambah rawit', catatan: 'Cek ulang takaran cabai', updatedAt: '07:20' } },
        }
      }));
    },
  };
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('store missing');
  return s;
}
