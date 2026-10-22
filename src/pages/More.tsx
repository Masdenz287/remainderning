import { useState } from 'react';
import { Bell, CalendarClock, ChevronRight, Crown, Download, FileSpreadsheet, Info, LogOut, Pencil, Plus, Power, Settings, ShieldCheck, Trash2, Users } from 'lucide-react';
import { PHASE_LABEL, ROLE_FULL, toCSV, type Phase, type Reminder, type Role, type Shift } from '../lib/data';
import { useStore } from '../lib/store';
import { Modal, NavyButton, SectionTitle } from '../components/ui';

export default function More() {
  const { session, logout, users, upsertUser, toggleUser, schedules, addSchedule, removeSchedule, reminders, upsertReminder, removeReminder, reports, notifs } = useStore();
  const [tab, setTab] = useState<'profil' | 'tim' | 'jadwal' | 'reminder' | 'info'>('profil');
  const [showUser, setShowUser] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [showSch, setShowSch] = useState(false);
  const [sch, setSch] = useState({ userId: '', date: new Date().toISOString().slice(0, 10), shift: 'Pagi' as Shift, note: '' });
  const [showRem, setShowRem] = useState(false);
  const [rem, setRem] = useState<Partial<Reminder>>({ label: '', time: '08:00', phase: 'operasional' as Phase });

  if (!session) return null;
  const isKomandan = session.role === 'komandan';
  const isWakil = session.role === 'wakil';
  const isKoki = session.role === 'koki';
  const canManageUsers = isKomandan;
  const canSchedule = isKomandan;
  const canReminder = isKomandan || isWakil;

  const openUser = (u?: any) => { setEdit(u ? { ...u } : { name: '', username: '', email: '', password: 'dapur123', role: 'goreng' as Role, jabatan: 'Goreng · Dapur', shift: 'Pagi' as Shift, color: '#15803D' }); setShowUser(true); };
  const saveUser = () => { if (!edit?.name || !edit?.username) return; upsertUser(edit); setShowUser(false); };

  const exportAll = () => {
    const blob = new Blob([toCSV(reports)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ekspor-laporan-keseluruhan-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div>
      {/* profil */}
      <div className="bg-[#0A2540] rounded-3xl p-5 text-white mb-3 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-14 w-44 h-44 rounded-full bg-white/5" />
        <div className="flex items-center gap-3 relative">
          <div className="w-14 h-14 rounded-2xl grid place-content-center text-xl font-extrabold text-white shadow-lg" style={{ background: session.color }}>{session.name.charAt(0)}</div>
          <div className="flex-1">
            <p className="font-extrabold text-[16px]">{session.name}</p>
            <p className="text-[12px] text-slate-300 font-semibold">{ROLE_FULL[session.role]} · {session.jabatan}</p>
            <div className="flex gap-1.5 mt-1.5">
              <span className="text-[10px] font-extrabold bg-white/15 px-2 py-0.5 rounded-full">Shift {session.shift}</span>
              <span className="text-[10px] font-extrabold bg-green-500 px-2 py-0.5 rounded-full">AKTIF</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 mb-3 overflow-x-auto nice-scroll pb-0.5">
        {([['profil', 'Profil'], ['tim', 'Tim Dapur'], ['jadwal', 'Jadwal'], ['reminder', 'Reminder'], ['info', 'Info']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition ${tab === k ? 'bg-[#0A2540] text-white shadow' : 'bg-white text-slate-500 border border-slate-200'}`}>{l}</button>
        ))}
      </div>

      {tab === 'profil' && (
        <div className="space-y-2.5">
          <div className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm">
            <SectionTitle title="Data Akun" sub="Terdaftar di sistem dapur" />
            {[['Nama', session.name], ['Username', '@' + session.username], ['Email', session.email], ['Jabatan', session.jabatan], ['Peran', ROLE_FULL[session.role]], ['Shift', session.shift]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-slate-100 last:border-0"><span className="text-xs font-bold text-slate-400">{k}</span><span className="text-[13px] font-extrabold text-slate-800">{v}</span></div>
            ))}
          </div>
          <div className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm">
            <SectionTitle title="Hak Akses Saya" />
            <ul className="text-[12.5px] font-medium text-slate-600 space-y-1.5 leading-relaxed">
              {isKomandan && ['Kelola akun seluruh anggota dapur (tambah / ubah / nonaktifkan)','Atur jadwal kerja & shift harian','Atur reminder waktu & notifikasi','Setujui / tolak semua laporan'].map(x => <li key={x}>• {x}</li>)}
              {isWakil && ['Melihat checklist semua anggota','Memantau pekerjaan yang belum selesai','Menangani & menyetujui laporan','Mencatat kunjungan / sidak'].map(x => <li key={x}>• {x}</li>)}
              {isKoki && ['Memantau pekerjaan anggota dapur','Membuat laporan kepada kepala koki','Update stok bahan baku','Menyetujui laporan anggota'].map(x => <li key={x}>• {x}</li>)}
              {session.role === 'goreng' && ['Melihat checklist sesuai tugas & shift','Mengisi keterangan & status pekerjaan','Mengirim laporan kepada atasan','Menerima reminder & notifikasi'].map(x => <li key={x}>• {x}</li>)}
            </ul>
          </div>
          {(isKomandan || isWakil || isKoki) && (
            <button onClick={exportAll} className="w-full flex items-center justify-center gap-2 rounded-2xl bg-green-600 py-3.5 text-sm font-extrabold text-white shadow-lg"><FileSpreadsheet size={16} /> Ekspor Semua Laporan (Excel)</button>
          )}
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-50 border-2 border-red-200 py-3.5 text-sm font-extrabold text-red-600"><LogOut size={16} /> Keluar Akun</button>
        </div>
      )}

      {tab === 'tim' && (
        <div>
          <div className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm mb-3">
            <SectionTitle title="Anggota Dapur" sub={`${users.filter(u => u.active).length} aktif · ${users.length} total`} right={canManageUsers ? <button onClick={() => openUser()} className="flex items-center gap-1 rounded-xl bg-[#0A2540] px-3 py-2 text-[11px] font-extrabold text-white"><Plus size={13} /> Anggota</button> : undefined} />
            {!canManageUsers && <p className="mb-2 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">Hanya Komandan Mispin yang dapat mengelola akun.</p>}
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className={`flex items-center gap-3 rounded-2xl border-2 p-3 ${u.active ? 'border-slate-100 bg-slate-50/60' : 'border-red-200 bg-red-50/50 opacity-75'}`}>
                  <div className="w-10 h-10 rounded-xl grid place-content-center text-white font-extrabold" style={{ background: u.color }}>{u.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-extrabold text-slate-900 truncate">{u.name} {!u.active && <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded-full ml-1">NONAKTIF</span>}</p>
                    <p className="text-[11px] text-slate-500 font-semibold truncate">{ROLE_FULL[u.role]} · {u.jabatan} · Shift {u.shift}</p>
                    <p className="text-[10.5px] text-slate-400 font-mono">@{u.username}</p>
                  </div>
                  {canManageUsers && (
                    <div className="flex gap-1">
                      <button onClick={() => openUser(u)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 grid place-content-center text-slate-500"><Pencil size={13} /></button>
                      <button onClick={() => toggleUser(u.id)} className={`w-8 h-8 rounded-lg grid place-content-center ${u.active ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}><Power size={13} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'jadwal' && (
        <div className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm">
          <SectionTitle title="Jadwal Kerja" sub="Shift harian anggota dapur" right={canSchedule ? <button onClick={() => setShowSch(true)} className="flex items-center gap-1 rounded-xl bg-[#0A2540] px-3 py-2 text-[11px] font-extrabold text-white"><Plus size={13} /> Jadwal</button> : undefined} />
          {!canSchedule && <p className="mb-2 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">Hanya Komandan Mispin yang dapat mengatur jadwal.</p>}
          <div className="space-y-2">
            {[...schedules].sort((a, b) => a.date.localeCompare(b.date)).map(s => {
              const u = users.find(x => x.id === s.userId);
              return (
                <div key={s.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-200/70 p-3">
                  <div className="w-10 h-10 rounded-xl grid place-content-center text-white font-extrabold" style={{ background: u?.color || '#0A2540' }}>{u?.name.charAt(0) || '?'}</div>
                  <div className="flex-1">
                    <p className="text-[13px] font-extrabold text-slate-900">{u?.name || '—'}</p>
                    <p className="text-[11px] text-slate-500 font-semibold">{s.date} · Shift {s.shift}{s.note ? ` · ${s.note}` : ''}</p>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-1 rounded-full ${s.shift === 'Pagi' ? 'bg-amber-100 text-amber-800' : s.shift === 'Siang' ? 'bg-sky-100 text-sky-800' : s.shift === 'Malam' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>{s.shift.toUpperCase()}</span>
                  {canSchedule && <button onClick={() => removeSchedule(s.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={15} /></button>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'reminder' && (
        <div className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm">
          <SectionTitle title="Pengaturan Reminder" sub="Diatur berdasarkan waktu oleh admin" right={canReminder ? <button onClick={() => { setRem({ label: '', time: '08:00', phase: 'operasional' }); setShowRem(true); }} className="flex items-center gap-1 rounded-xl bg-[#0A2540] px-3 py-2 text-[11px] font-extrabold text-white"><Plus size={13} /> Reminder</button> : undefined} />
          {!canReminder && <p className="mb-2 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">Hanya Komandan & Wakil yang dapat mengatur reminder.</p>}
          <div className="space-y-2">
            {reminders.map(r => (
              <div key={r.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-200/70 p-3">
                <div className={`w-10 h-10 rounded-xl grid place-content-center ${r.active ? 'bg-[#0A2540] text-white' : 'bg-slate-200 text-slate-400'}`}><Bell size={16} /></div>
                <div className="flex-1">
                  <p className="text-[13px] font-extrabold text-slate-900">{r.label}</p>
                  <p className="text-[11px] text-slate-500 font-semibold">Pkl {r.time} · {PHASE_LABEL[r.phase]}</p>
                </div>
                {canReminder && (
                  <div className="flex gap-1.5 items-center">
                    <button onClick={() => upsertReminder({ id: r.id, active: !r.active })} className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-full ${r.active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>{r.active ? 'ON' : 'OFF'}</button>
                    <button onClick={() => removeReminder(r.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={15} /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'info' && (
        <div className="space-y-2.5">
          <div className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm">
            <SectionTitle title="Petunjuk Instalasi & Konfigurasi" />
            <div className="text-[12.5px] text-slate-600 leading-relaxed space-y-2 font-medium">
              <p><b>1. Frontend (aplikasi ini):</b> dibangun dengan React + Vite + Tailwind. Jalankan <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">npm install</code> lalu <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">npm run dev</code>. Build produksi: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">npm run build</code>.</p>
              <p><b>2. Backend (Node.js + Express):</b> buat folder <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">server/</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">npm init -y && npm i express pg cors jsonwebtoken bcryptjs</code>. Endpoint: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">POST /api/login</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">GET /api/checklist</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">POST /api/reports</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">GET /api/reports/export</code>.</p>
              <p><b>3. Database (PostgreSQL / Supabase):</b> buat project di supabase.com → SQL editor → jalankan skema tabel <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">users, tasks, checks, reports, stock, visits, schedules, reminders</code>. Salin <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">SUPABASE_URL</code> & <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">ANON_KEY</code> ke <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">.env</code>.</p>
              <p><b>4. Skema SQL contoh:</b> <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">create table users(id uuid primary key, name text, username text unique, email text unique, password_hash text, role text, jabatan text, shift text, active bool default true)</code>.</p>
              <p><b>5. Mode demo saat ini:</b> data tersimpan di localStorage browser (<code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">kkm-bekasi-v1</code>) sehingga aplikasi benar-benar berfungsi tanpa server.</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm">
            <SectionTitle title="Tentang" sub="Kampung Kecil Metropolitan Bekasi" />
            <p className="text-[12.5px] text-slate-600 leading-relaxed font-medium">Aplikasi checklist dapur profesional untuk memastikan standar rasa & kebersihan Sunda di setiap shift. Dibangun responsif untuk HP & desktop.</p>
            <p className="text-[11px] text-slate-400 font-semibold mt-2">v1.0 · React + Node.js + PostgreSQL-ready · © 2026</p>
          </div>
        </div>
      )}

      {/* modal user */}
      <Modal open={showUser} onClose={() => setShowUser(false)}>
        <h3 className="font-extrabold text-slate-900 mb-4">{edit?.id ? 'Ubah Akun' : 'Tambah Anggota'}</h3>
        {[['name', 'Nama lengkap'], ['username', 'Username'], ['email', 'Email'], ['password', 'Password']].map(([k, l]) => (
          <div key={k} className="mb-2.5"><label className="text-[11px] font-bold text-slate-600">{l}</label>
            <input value={edit?.[k] || ''} onChange={e => setEdit({ ...edit, [k]: e.target.value })} className="mt-1 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#0A2540]" /></div>
        ))}
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div><label className="text-[11px] font-bold text-slate-600">Peran</label>
            <select value={edit?.role} onChange={e => setEdit({ ...edit, role: e.target.value })} className="mt-1 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold">
              <option value="komandan">Komandan Mispin</option><option value="wakil">Wakil Rahmat</option><option value="koki">Koki</option><option value="goreng">Goreng</option>
            </select></div>
          <div><label className="text-[11px] font-bold text-slate-600">Shift</label>
            <select value={edit?.shift} onChange={e => setEdit({ ...edit, shift: e.target.value })} className="mt-1 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold">
              <option>Pagi</option><option>Siang</option><option>Malam</option><option>Full</option>
            </select></div>
        </div>
        <div className="mb-4"><label className="text-[11px] font-bold text-slate-600">Jabatan</label>
          <input value={edit?.jabatan || ''} onChange={e => setEdit({ ...edit, jabatan: e.target.value })} placeholder="cth: Goreng · Station Ayam" className="mt-1 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#0A2540]" /></div>
        <NavyButton onClick={saveUser}><ShieldCheck size={15} /> Simpan Akun</NavyButton>
      </Modal>

      <Modal open={showSch} onClose={() => setShowSch(false)}>
        <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2"><CalendarClock size={17} /> Tambah Jadwal</h3>
        <label className="text-[11px] font-bold text-slate-600">Anggota</label>
        <select value={sch.userId} onChange={e => setSch({ ...sch, userId: e.target.value })} className="mt-1 mb-2.5 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold">
          <option value="">— pilih —</option>{users.filter(u => u.active).map(u => <option key={u.id} value={u.id}>{u.name} · Shift {u.shift}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div><label className="text-[11px] font-bold text-slate-600">Tanggal</label><input type="date" value={sch.date} onChange={e => setSch({ ...sch, date: e.target.value })} className="mt-1 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold" /></div>
          <div><label className="text-[11px] font-bold text-slate-600">Shift</label><select value={sch.shift} onChange={e => setSch({ ...sch, shift: e.target.value as Shift })} className="mt-1 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold"><option>Pagi</option><option>Siang</option><option>Malam</option><option>Full</option></select></div>
        </div>
        <label className="text-[11px] font-bold text-slate-600">Catatan</label>
        <input value={sch.note} onChange={e => setSch({ ...sch, note: e.target.value })} placeholder="cth: Station ayam" className="mt-1 mb-4 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold" />
        <NavyButton onClick={() => { if (!sch.userId) return; addSchedule(sch); setShowSch(false); }}><Plus size={15} /> Simpan Jadwal</NavyButton>
      </Modal>

      <Modal open={showRem} onClose={() => setShowRem(false)}>
        <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2"><Bell size={17} /> Tambah Reminder</h3>
        <label className="text-[11px] font-bold text-slate-600">Label</label>
        <input value={rem.label || ''} onChange={e => setRem({ ...rem, label: e.target.value })} placeholder="cth: Cek minyak sore" className="mt-1 mb-2.5 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold" />
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div><label className="text-[11px] font-bold text-slate-600">Waktu</label><input type="time" value={rem.time} onChange={e => setRem({ ...rem, time: e.target.value })} className="mt-1 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold" /></div>
          <div><label className="text-[11px] font-bold text-slate-600">Fase</label><select value={rem.phase} onChange={e => setRem({ ...rem, phase: e.target.value as Phase })} className="mt-1 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold"><option value="open">Open</option><option value="operasional">Operasional</option><option value="closing">Closing</option></select></div>
        </div>
        <NavyButton onClick={() => { if (!rem.label) return; upsertReminder(rem); setShowRem(false); }}><Bell size={15} /> Simpan Reminder</NavyButton>
      </Modal>
    </div>
  );
}
