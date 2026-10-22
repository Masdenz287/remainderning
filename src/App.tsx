import { useEffect, useMemo, useState } from 'react';
import { Bell, CalendarDays, ClipboardCheck, History, LayoutGrid, LogOut, MapPin, Store } from 'lucide-react';
import { StoreProvider, useStore } from './lib/store';
import { ROLE_FULL, SEED_TASKS, formatID, todayKey } from './lib/data';
import Login from './pages/Login';
import Today from './pages/Today';
import HistoryPage from './pages/History';
import Visits from './pages/Visits';
import More from './pages/More';
import { Modal } from './components/ui';

type Tab = 'today' | 'history' | 'visits' | 'more';

function Shell() {
  const { session, logout, checks, customTasks, dateKey, setDateKey, notifs, markAllRead, markRead, users, reports, schedules, reminders, pushNotif } = useStore();
  const [tab, setTab] = useState<Tab>('today');
  const [showNotif, setShowNotif] = useState(false);
  const [ring, setRing] = useState(false);

  const allTasks = useMemo(() => [...SEED_TASKS, ...customTasks], [customTasks]);
  const myTasks = useMemo(() => {
    if (!session) return [];
    if (session.role === 'goreng') return allTasks.filter(t => t.position === 'Goreng' || t.position === 'Semua');
    return allTasks;
  }, [allTasks, session]);

  const mine = (session && checks[dateKey]?.[session.id]) || {};
  const done = myTasks.filter(t => mine[t.id]?.done).length;
  const pct = myTasks.length ? Math.round((done / myTasks.length) * 100) : 0;
  const unread = notifs.filter(n => !n.read).length;

  // dashboard aggregate
  const activeUsers = users.filter(u => u.active);
  const todaySched = schedules.filter(s => s.date === dateKey);
  const onDuty = todaySched.length || activeUsers.length;
  const totalDoneAll = useMemo(() => {
    let s = 0;
    activeUsers.forEach(u => {
      const c = checks[dateKey]?.[u.id] || {};
      s += Object.values(c).filter((x: any) => x.done).length;
    });
    return s;
  }, [checks, dateKey, activeUsers]);
  const pending = reports.filter(r => r.status === 'menunggu').length;

  // reminder engine: fire once per reminder time match (check every 30s)
  const [fired, setFired] = useState<string[]>([]);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      reminders.filter(r => r.active && r.time === hh && !fired.includes(r.id + hh + now.toDateString())).forEach(r => {
        pushNotif({ type: 'tugas', title: `Reminder: ${r.label}`, message: `Waktunya ${r.label} (pkl ${r.time}). Segera cek checklist.` });
        setFired(f => [...f, r.id + hh + now.toDateString()]);
        setRing(true); setTimeout(() => setRing(false), 1200);
      });
    };
    const id = setInterval(tick, 30000);
    tick();
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminders]);

  // late-task detector → auto notif (once per day per session)
  useEffect(() => {
    if (!session) return;
    const key = `late-warned-${dateKey}-${session.id}`;
    if (localStorage.getItem(key)) return;
    const now = new Date();
    const lateList = myTasks.filter(t => {
      const [h, m] = t.time.replace('.', ':').split(':').map(Number);
      const tt = new Date(); tt.setHours(h || 0, m || 0, 0, 0);
      return now > tt && !mine[t.id]?.done;
    });
    if (lateList.length >= 2) {
      pushNotif({ type: 'terlambat', title: 'Checklist terlambat', message: `${lateList.length} tugas melewati jam pelaksanaan (${lateList[0].title}, ...). Segera selesaikan.` });
      localStorage.setItem(key, '1');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey, session]);

  // low stock → notif badge handled in visits; ensure one notif exists
  useEffect(() => {
    if (!session) return;
    // stock check lives in store seed; skip heavy logic here
  }, [session]);

  if (!session) return <Login />;

  const showDash = session.role === 'komandan' || session.role === 'wakil' || session.role === 'koki';

  return (
    <div className="min-h-dvh bg-[#E8EDF3] flex justify-center">
      <div className="w-full max-w-[520px] min-h-dvh flex flex-col relative">
        {/* ===== HEADER NAVY ===== */}
        <header className="bg-[#0A2540] px-5 pt-5 pb-5 rounded-b-[26px] relative overflow-hidden shrink-0">
          <div className="absolute -right-14 -top-14 w-52 h-52 rounded-full bg-white/5" />
          <div className="absolute right-24 top-16 w-20 h-20 rounded-full bg-white/5" />
          <div className="relative">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white grid place-content-center shrink-0">
                <Store size={20} className="text-[#0A2540]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold tracking-[.16em] text-sky-300 uppercase">Kampung Kecil</p>
                <h1 className="text-white text-[16px] font-extrabold leading-tight truncate">Metropolitan Bekasi</h1>
              </div>
              <button onClick={() => setShowNotif(true)} className={`relative w-10 h-10 rounded-2xl bg-white/10 border border-white/15 grid place-content-center text-white hover:bg-white/20 transition ${ring ? 'bell-ring' : ''}`} aria-label="Notifikasi">
                <Bell size={18} />
                {unread > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-extrabold grid place-content-center border-2 border-[#0A2540]">{unread}</span>}
              </button>
            </div>

            {/* tanggal operasional */}
            <div className="flex items-center gap-2 mt-3.5 bg-white/10 border border-white/15 rounded-2xl px-3 py-2">
              <CalendarDays size={15} className="text-sky-300 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Tanggal operasional</p>
                <p className="text-[12.5px] font-extrabold text-white truncate">{formatID(dateKey)}</p>
              </div>
              <input type="date" value={dateKey} max={todayKey()} onChange={e => setDateKey(e.target.value)} className="text-[11px] font-bold bg-white text-[#0A2540] rounded-xl px-2 py-1.5 outline-none" />
            </div>

            {/* user login */}
            <div className="flex items-center gap-3 mt-3">
              <div className="w-11 h-11 rounded-2xl grid place-content-center text-white text-lg font-extrabold shadow" style={{ background: session.color }}>{session.name.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[14px] font-extrabold truncate">{session.name}</p>
                <p className="text-[11px] text-slate-300 font-semibold truncate">{ROLE_FULL[session.role]} · {session.jabatan}</p>
                <span className="inline-block mt-1 text-[10px] font-extrabold bg-white/15 border border-white/15 text-white px-2 py-0.5 rounded-full">Shift {session.shift}</span>
              </div>
              <button onClick={logout} className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 grid place-content-center text-slate-300 hover:text-white" title="Keluar"><LogOut size={15} /></button>
            </div>

            {/* progress */}
            <div className="mt-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] font-bold text-slate-300">Checklist selesai · {done}/{myTasks.length} tugas</p>
                <p className="text-white text-lg font-extrabold">{pct}%</p>
              </div>
              <div className="h-[10px] w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,.22)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#22C55E,#16A34A)' }} />
              </div>
            </div>
          </div>
        </header>

        {/* dashboard kepala koki */}
        {showDash && tab === 'today' && (
          <div className="px-4 pt-3">
            <div className="bg-white rounded-3xl p-3.5 shadow-sm border border-slate-200/60">
              <p className="text-[11px] font-extrabold uppercase tracking-[.12em] text-slate-400 px-1 mb-2">Dashboard Kepala Koki</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-[#0A2540] p-3 text-white">
                  <p className="text-2xl font-extrabold">{onDuty}</p>
                  <p className="text-[10px] font-bold text-slate-300 leading-tight mt-0.5">Anggota bertugas</p>
                </div>
                <div className="rounded-2xl bg-green-50 border border-green-200 p-3">
                  <p className="text-2xl font-extrabold text-green-700">{totalDoneAll}</p>
                  <p className="text-[10px] font-bold text-green-600 leading-tight mt-0.5">Checklist selesai</p>
                </div>
                <button onClick={() => setTab('history')} className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-left active:scale-95 transition">
                  <p className="text-2xl font-extrabold text-amber-700">{pending}</p>
                  <p className="text-[10px] font-bold text-amber-600 leading-tight mt-0.5">Menunggu persetujuan</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== CONTENT ===== */}
        <main className="flex-1 px-4 pt-3 pb-28">
          {tab === 'today' && <Today />}
          {tab === 'history' && <HistoryPage />}
          {tab === 'visits' && <Visits />}
          {tab === 'more' && <More />}
        </main>

        {/* ===== BOTTOM NAV ===== */}
        <nav className="no-print fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[520px] z-[60]">
          <div className="mx-3 mb-3 rounded-3xl bg-[#0A2540] shadow-2xl shadow-navy-900/40 border border-white/10 px-2 py-2 flex">
            {([
              ['today', 'Hari Ini', ClipboardCheck],
              ['history', 'Riwayat', History],
              ['visits', 'Kunjungan', MapPin],
              ['more', 'Lainnya', LayoutGrid],
            ] as [Tab, string, any][]).map(([k, label, Icon]) => (
              <button key={k} onClick={() => { setTab(k); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition ${tab === k ? 'bg-white text-[#0A2540] shadow' : 'text-slate-300 hover:text-white'}`}>
                <span className="relative">
                  <Icon size={20} strokeWidth={tab === k ? 2.5 : 2} />
                  {k === 'history' && pending > 0 && <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-red-500 text-white text-[9px] font-extrabold grid place-content-center">{pending}</span>}
                </span>
                <span className="text-[10.5px] font-extrabold">{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* notif drawer */}
        <Modal open={showNotif} onClose={() => setShowNotif(false)} wide>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-extrabold text-slate-900 text-[16px]">Notifikasi</h3>
            <button onClick={markAllRead} className="text-[11px] font-extrabold text-[#0A2540] bg-slate-100 px-3 py-1.5 rounded-full">Tandai dibaca</button>
          </div>
          <p className="text-xs text-slate-500 mb-3">Tugas harian · keterlambatan · stok habis · persetujuan</p>
          <div className="space-y-2 max-h-[55vh] overflow-y-auto nice-scroll">
            {notifs.map(n => (
              <button key={n.id} onClick={() => markRead(n.id)} className={`w-full text-left rounded-2xl border-2 p-3.5 transition ${n.read ? 'border-slate-100 bg-slate-50' : 'border-[#0A2540]/15 bg-white shadow-sm'}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${n.type === 'stok' ? 'bg-red-100 text-red-700' : n.type === 'terlambat' ? 'bg-amber-100 text-amber-800' : n.type === 'persetujuan' ? 'bg-indigo-100 text-indigo-800' : 'bg-sky-100 text-sky-800'}`}>
                    {n.type === 'stok' ? 'STOK HABIS' : n.type === 'terlambat' ? 'TERLAMBAT' : n.type === 'persetujuan' ? 'PERSETUJUAN' : 'TUGAS'}
                  </span>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-red-500" />}
                  <span className="ml-auto text-[10.5px] font-bold text-slate-400">{n.time}</span>
                </div>
                <p className="text-[13px] font-extrabold text-slate-900 mt-1.5">{n.title}</p>
                <p className="text-[12px] text-slate-500 font-medium leading-relaxed">{n.message}</p>
              </button>
            ))}
            {notifs.length === 0 && <p className="text-center text-sm text-slate-400 font-semibold py-8">Belum ada notifikasi.</p>}
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
