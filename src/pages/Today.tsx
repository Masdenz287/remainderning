import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Filter, Plus, Send, Users } from 'lucide-react';
import { PHASE_LABEL, PHASE_TIME, SEED_TASKS, canSeeAll, nowTime, type Phase, type TaskStatus } from '../lib/data';
import { useStore } from '../lib/store';
import { Modal, NavyButton, ProgressBarLight, StatusBadge } from '../components/ui';

function isLate(taskTime: string, done: boolean): boolean {
  if (done) return false;
  const norm = taskTime.replace('.', ':');
  const [h, m] = norm.split(':').map(Number);
  const now = new Date();
  const t = new Date(); t.setHours(h, m, 0, 0);
  return now > t;
}

export default function Today() {
  const { session, checks, setCheck, customTasks, addTask, users, dateKey, submitReport, pushNotif } = useStore();
  const [phase, setPhase] = useState<'semua' | Phase>('semua');
  const [watchId, setWatchId] = useState<string>('me');
  const [showSend, setShowSend] = useState(false);
  const [summary, setSummary] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [nt, setNt] = useState({ title: '', time: '10:00', phase: 'operasional' as Phase, desc: '' });
  const [sentOk, setSentOk] = useState(false);

  const allTasks = useMemo(() => [...SEED_TASKS, ...customTasks], [customTasks]);
  const relevant = useMemo(() => {
    if (!session) return [];
    if (session.role === 'goreng') return allTasks.filter(t => t.position === 'Goreng' || t.position === 'Semua');
    return allTasks;
  }, [allTasks, session]);

  const filtered = relevant.filter(t => phase === 'semua' || t.phase === phase);
  const watchedUser = watchId === 'me' ? session! : users.find(u => u.id === watchId)!;
  const mine = checks[dateKey]?.[watchedUser.id] || {};
  const readOnly = watchId !== 'me';

  const done = relevant.filter(t => mine[t.id]?.done).length;
  const pct = relevant.length ? Math.round((done / relevant.length) * 100) : 0;
  const late = relevant.filter(t => isLate(t.time, !!mine[t.id]?.done)).length;
  const okC = relevant.filter(t => mine[t.id]?.done && mine[t.id]?.status === 'ok').length;
  const perluC = relevant.filter(t => mine[t.id]?.done && mine[t.id]?.status === 'perlu').length;
  const masalahC = relevant.filter(t => mine[t.id]?.done && mine[t.id]?.status === 'masalah').length;
  const incomplete = relevant.filter(t => !mine[t.id]?.done);
  const problems = relevant.filter(t => mine[t.id]?.done && mine[t.id]?.status === 'masalah');

  const grouped: { key: Phase; items: typeof relevant }[] = (['open', 'operasional', 'closing'] as Phase[])
    .map(k => ({ key: k, items: filtered.filter(t => t.phase === k) }))
    .filter(g => g.items.length > 0);

  const doSend = () => {
    const r = submitReport(summary || `${done} dari ${relevant.length} tugas selesai (${pct}%). ${masalahC ? `${masalahC} masalah perlu tindak lanjut. ` : ''}${perluC ? `${perluC} perlu diperiksa ulang.` : 'Semua sesuai standar.'}`);
    setShowSend(false); setSummary(''); setSentOk(true);
    setTimeout(() => setSentOk(false), 4000);
    void r;
  };

  const cycleStatus = (taskId: string, cur: TaskStatus) => {
    if (readOnly) return;
    setCheck(taskId, { status: cur });
    if (!mine[taskId]?.done) setCheck(taskId, { done: true, status: cur });
  };

  if (!session) return null;

  return (
    <div className="pb-2">
      {sentOk && (
        <div className="mb-3 flex items-center gap-2.5 rounded-2xl bg-green-600 px-4 py-3 text-white shadow-lg anim-pop">
          <CheckCircle2 size={20} />
          <div><p className="text-sm font-extrabold">Laporan terkirim ke Kepala Koki!</p><p className="text-[11px] text-green-100">Pantau status persetujuan di menu Riwayat.</p></div>
        </div>
      )}

      {/* pantau anggota */}
      {canSeeAll(session.role) && (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/60 mb-3">
          <div className="flex items-center gap-2 mb-2.5">
            <Users size={15} className="text-[#0A2540]" />
            <p className="text-[12px] font-extrabold text-slate-800">Pantau checklist anggota</p>
          </div>
          <div className="flex gap-2 overflow-x-auto nice-scroll pb-1">
            <button onClick={() => setWatchId('me')} className={`shrink-0 rounded-2xl px-3.5 py-2 text-xs font-bold border-2 transition ${watchId === 'me' ? 'bg-[#0A2540] text-white border-[#0A2540]' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>Checklist Saya</button>
            {users.filter(u => u.active && u.id !== session.id).map(u => (
              <button key={u.id} onClick={() => setWatchId(u.id)} className={`shrink-0 flex items-center gap-2 rounded-2xl pl-1.5 pr-3 py-1.5 text-xs font-bold border-2 transition ${watchId === u.id ? 'border-[#0A2540] bg-navy-50' : 'border-slate-200 bg-slate-50'}`}>
                <span className="w-7 h-7 rounded-xl grid place-content-center text-white text-[11px] font-extrabold" style={{ background: u.color }}>{u.name.charAt(0)}</span>
                <span className="text-slate-700">{u.name.split(' ')[0]}<span className="block text-[10px] font-semibold text-slate-400">{u.shift}</span></span>
              </button>
            ))}
          </div>
          {readOnly && <p className="mt-2 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">Mode pantau — melihat checklist <b>{watchedUser.name}</b> ({watchedUser.jabatan}). Perubahan hanya oleh pemilik akun.</p>}
        </div>
      )}

      {/* ringkasan */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/60 mb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[12px] font-extrabold text-slate-800">{readOnly ? `Progres ${watchedUser.name}` : 'Progres checklist saya'}</p>
          <span className="text-xl font-extrabold text-[#0A2540]">{pct}%</span>
        </div>
        <ProgressBarLight percent={pct} />
        <div className="grid grid-cols-4 gap-2 mt-3">
          {[['Selesai', done, 'text-green-700 bg-green-50 border-green-200'], ['Sisa', relevant.length - done, 'text-slate-700 bg-slate-100 border-slate-200'], ['Terlambat', late, 'text-red-700 bg-red-50 border-red-200'], ['Masalah', masalahC, 'text-amber-700 bg-amber-50 border-amber-200']].map(([l, v, c]) => (
            <div key={l as string} className={`rounded-2xl border px-2 py-2 text-center ${c}`}>
              <p className="text-lg font-extrabold leading-none">{v}</p>
              <p className="text-[10px] font-bold mt-1">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* filter fase */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto nice-scroll pb-0.5">
        <Filter size={14} className="text-slate-400 shrink-0" />
        {([['semua', 'Semua'], ['open', 'Open'], ['operasional', 'Operasional'], ['closing', 'Closing']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setPhase(k)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition ${phase === k ? 'bg-[#0A2540] text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'}`}>{l}</button>
        ))}
        {canSeeAll(session.role) && (
          <button onClick={() => setShowAdd(true)} className="shrink-0 ml-auto flex items-center gap-1 rounded-full bg-green-600 px-3.5 py-2 text-xs font-extrabold text-white"><Plus size={13} /> Tugas</button>
        )}
      </div>

      {/* daftar tugas */}
      {grouped.map(g => (
        <div key={g.key} className="mb-4">
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[#0A2540] bg-[#0A2540]/10 px-2.5 py-1 rounded-full">{PHASE_LABEL[g.key]}</span>
            <span className="text-[11px] font-semibold text-slate-400">{PHASE_TIME[g.key]}</span>
            <span className="ml-auto text-[11px] font-bold text-slate-500">{g.items.filter(t => mine[t.id]?.done).length}/{g.items.length}</span>
          </div>
          <div className="space-y-2.5">
            {g.items.map((t, idx) => {
              const c = mine[t.id] || { done: false, status: 'ok' as TaskStatus, keterangan: '', catatan: '', updatedAt: '' };
              const lateFlag = isLate(t.time, c.done);
              return (
                <div key={t.id} className={`bg-white rounded-3xl p-4 shadow-sm border-2 transition anim-slide-up ${c.done ? 'border-green-200' : lateFlag ? 'border-red-200' : 'border-transparent'}`} style={{ animationDelay: `${idx * 30}ms` }}>
                  <div className="flex gap-3">
                    <input type="checkbox" className="big-check mt-0.5" checked={!!c.done} disabled={readOnly} onChange={e => setCheck(t.id, { done: e.target.checked })} aria-label={t.title} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <p className={`text-[13.5px] font-extrabold leading-snug ${c.done ? 'text-slate-500 line-through decoration-green-500/60' : 'text-slate-900'}`}>{t.title}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#0A2540] px-2 py-0.5 text-[11px] font-bold text-white"><Clock size={11} /> {t.time}</span>
                        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">{t.position}</span>
                        {lateFlag && <span className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white"><AlertTriangle size={11} /> Terlambat</span>}
                        {c.done && <StatusBadge status={c.status} />}
                      </div>
                      <p className="text-[11.5px] text-slate-500 mt-1.5 leading-relaxed">{t.desc}</p>

                      {/* kolom keterangan */}
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mt-3 mb-1">Keterangan</label>
                      <input value={c.keterangan} disabled={readOnly} onChange={e => setCheck(t.id, { keterangan: e.target.value })}
                        placeholder="cth: suhu 175°C stabil, 15 ekor siap..."
                        className="w-full rounded-xl border-[1.5px] border-slate-200 bg-slate-50 px-3 py-2.5 text-[12.5px] font-medium outline-none focus:border-[#0A2540] focus:bg-white transition disabled:opacity-70" />

                      {/* status pekerjaan */}
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mt-3 mb-1.5">Status pekerjaan</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {([['ok', 'OK'], ['perlu', 'Perlu Cek'], ['masalah', 'Masalah']] as [TaskStatus, string][]).map(([s, l]) => (
                          <button key={s} disabled={readOnly} onClick={() => cycleStatus(t.id, s)}
                            className={`rounded-xl px-2 py-2 text-[11px] font-extrabold border-2 transition active:scale-95 ${c.status === s && c.done
                              ? s === 'ok' ? 'bg-green-600 border-green-600 text-white' : s === 'perlu' ? 'bg-amber-400 border-amber-400 text-amber-950' : 'bg-red-600 border-red-600 text-white'
                              : 'bg-white border-slate-200 text-slate-400'}`}>{l}</button>
                        ))}
                      </div>

                      {/* catatan masalah */}
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mt-3 mb-1">Catatan masalah <span className="normal-case font-semibold">(wajib jika ada temuan)</span></label>
                      <textarea value={c.catatan} disabled={readOnly} onChange={e => setCheck(t.id, { catatan: e.target.value })} rows={1}
                        placeholder="Tulis masalah yang ditemukan... cth: thermostat fryer 2 error"
                        className={`w-full rounded-xl border-[1.5px] px-3 py-2.5 text-[12.5px] font-medium outline-none transition disabled:opacity-70 ${c.status === 'masalah' ? 'border-red-300 bg-red-50 focus:border-red-500' : 'border-slate-200 bg-slate-50 focus:border-[#0A2540] focus:bg-white'}`} />
                      {c.updatedAt && <p className="text-[10px] text-slate-400 font-semibold mt-1.5">Terakhir diubah pkl {c.updatedAt}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {!readOnly && (
        <div className="sticky bottom-[86px] mt-4">
          <NavyButton onClick={() => setShowSend(true)} className="!py-4 !text-[15px] !rounded-2xl shadow-2xl">
            <Send size={17} /> Kirim ke Kepala Koki
          </NavyButton>
          <p className="text-center text-[11px] font-semibold text-slate-400 mt-1.5">{done}/{relevant.length} tugas · {pct}% selesai</p>
        </div>
      )}

      {/* modal ringkasan laporan */}
      <Modal open={showSend} onClose={() => setShowSend(false)} wide>
        <h3 className="font-extrabold text-slate-900 text-[16px]">Ringkasan Laporan</h3>
        <p className="text-xs text-slate-500 mb-4">Periksa sebelum dikirim ke Kepala Koki</p>
        <div className="rounded-2xl bg-[#0A2540] p-4 text-white mb-3">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-slate-300 font-semibold">{session.name} · {session.jabatan}</p><p className="text-sm font-extrabold">Shift {session.shift}</p></div>
            <p className="text-3xl font-extrabold">{pct}%</p>
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/20 overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: pct + '%' }} /></div>
          <div className="grid grid-cols-4 gap-1.5 mt-3 text-center">
            {[['Total', relevant.length], ['Selesai', done], ['OK', okC], ['Masalah', masalahC]].map(([l, v]) => (
              <div key={l as string} className="bg-white/10 rounded-xl py-1.5"><p className="font-extrabold text-sm">{v}</p><p className="text-[10px] text-slate-300 font-bold">{l}</p></div>
            ))}
          </div>
        </div>
        {incomplete.length > 0 && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 mb-2.5">
            <p className="text-xs font-extrabold text-amber-800 mb-1">Belum selesai ({incomplete.length})</p>
            {incomplete.slice(0, 5).map(t => <p key={t.id} className="text-[11.5px] text-amber-800 font-medium">• {t.title} ({t.time})</p>)}
            {incomplete.length > 5 && <p className="text-[11px] text-amber-600 font-bold">+ {incomplete.length - 5} lainnya</p>}
          </div>
        )}
        {problems.length > 0 && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-3 mb-2.5">
            <p className="text-xs font-extrabold text-red-700 mb-1">Masalah ditemukan ({problems.length})</p>
            {problems.map(t => <p key={t.id} className="text-[11.5px] text-red-700 font-medium">• {t.title}{mine[t.id]?.catatan ? ` — ${mine[t.id].catatan}` : ''}</p>)}
          </div>
        )}
        {perluC > 0 && <p className="text-[11.5px] font-bold text-amber-700 mb-2">{perluC} tugas bertanda Perlu Diperiksa.</p>}
        <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wide">Ringkasan laporan</label>
        <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={3}
          placeholder="Tulis ringkasan shift ini... cth: Semua station goreng beres, fryer 2 sempat overheat sudah ditangani."
          className="mt-1.5 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium outline-none focus:border-[#0A2540] focus:bg-white" />
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button onClick={() => setShowSend(false)} className="rounded-2xl border-2 border-slate-200 py-3 text-sm font-bold text-slate-500">Batal</button>
          <button onClick={doSend} className="rounded-2xl bg-green-600 py-3 text-sm font-extrabold text-white shadow-lg flex items-center justify-center gap-2"><Send size={15} /> Kirim Laporan</button>
        </div>
      </Modal>

      {/* modal tambah tugas */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)}>
        <h3 className="font-extrabold text-slate-900">Tambah Tugas Harian</h3>
        <p className="text-xs text-slate-500 mb-4">Berlaku untuk semua anggota sesuai posisi</p>
        <label className="text-[11px] font-bold text-slate-600">Nama tugas</label>
        <input value={nt.title} onChange={e => setNt({ ...nt, title: e.target.value })} placeholder="cth: Cuci grease trap" className="mt-1 mb-3 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#0A2540]" />
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div><label className="text-[11px] font-bold text-slate-600">Jam</label>
            <input type="time" value={nt.time} onChange={e => setNt({ ...nt, time: e.target.value })} className="mt-1 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold" /></div>
          <div><label className="text-[11px] font-bold text-slate-600">Fase</label>
            <select value={nt.phase} onChange={e => setNt({ ...nt, phase: e.target.value as Phase })} className="mt-1 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold">
              <option value="open">Open</option><option value="operasional">Operasional</option><option value="closing">Closing</option>
            </select></div>
        </div>
        <label className="text-[11px] font-bold text-slate-600">Keterangan</label>
        <input value={nt.desc} onChange={e => setNt({ ...nt, desc: e.target.value })} placeholder="Detail pengerjaan..." className="mt-1 mb-4 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#0A2540]" />
        <NavyButton onClick={() => { if (!nt.title) return; addTask({ title: nt.title, time: nt.time.replace(':', '.'), phase: nt.phase, position: 'Semua', desc: nt.desc || 'Tugas tambahan harian.' }); pushNotif({ type: 'tugas', title: 'Tugas baru ditambahkan', message: `${nt.title} — ${PHASE_LABEL[nt.phase]} pkl ${nt.time}.` }); setShowAdd(false); setNt({ title: '', time: '10:00', phase: 'operasional', desc: '' }); }}><Plus size={16} /> Simpan Tugas</NavyButton>
      </Modal>
    </div>
  );
}
