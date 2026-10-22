import { useState } from 'react';
import { CalendarCheck, MapPin, Package, Plus, UserCheck } from 'lucide-react';
import { useStore } from '../lib/store';
import { Modal, NavyButton, SectionTitle } from '../components/ui';
import type { Visit } from '../lib/data';

export default function Visits() {
  const { visits, addVisit, stock, setStock, addStock, session, pushNotif } = useStore();
  const [showVisit, setShowVisit] = useState(false);
  const [showStock, setShowStock] = useState(false);
  const [v, setV] = useState({ visitor: '', area: 'Station Goreng', purpose: '', result: '', status: 'selesai' as Visit['status'], date: new Date().toISOString().slice(0, 10) });
  const [s, setS] = useState({ name: '', unit: 'kg', stockN: 0, min: 0 });
  const canEdit = session && (session.role === 'komandan' || session.role === 'wakil' || session.role === 'koki');

  const low = stock.filter(x => x.stock <= x.min);

  return (
    <div>
      {/* stok bahan baku */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/60 mb-3">
        <SectionTitle title="Stok Bahan Baku" sub={low.length ? `${low.length} bahan di bawah minimum!` : 'Semua stok aman'} right={canEdit ? <button onClick={() => setShowStock(true)} className="flex items-center gap-1 rounded-xl bg-green-600 px-3 py-2 text-[11px] font-extrabold text-white"><Plus size={13} /> Bahan</button> : undefined} />
        {low.length > 0 && (
          <div className="mb-2.5 rounded-2xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-[12px] font-bold text-red-700">Stok menipis: {low.map(x => x.name).join(', ')}. Segera order ke supplier.</div>
        )}
        <div className="space-y-2">
          {stock.map(it => {
            const danger = it.stock <= it.min;
            const pct = Math.min(100, Math.round((it.stock / (it.min * 2.2)) * 100));
            return (
              <div key={it.id} className={`rounded-2xl border-2 p-3 ${danger ? 'border-red-200 bg-red-50/50' : 'border-slate-100 bg-slate-50/60'}`}>
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-extrabold text-slate-900">{it.name} {danger && <span className="ml-1 text-[10px] font-extrabold bg-red-600 text-white px-2 py-0.5 rounded-full">HABIS / MENIPIS</span>}</p>
                  <p className="text-[13px] font-extrabold text-[#0A2540]">{it.stock} <span className="text-[11px] font-semibold text-slate-400">{it.unit}</span></p>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden"><div className={`h-full rounded-full ${danger ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: pct + '%' }} /></div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10.5px] text-slate-400 font-semibold">Min. {it.min} {it.unit} · update {it.updatedAt}</p>
                  {canEdit && (
                    <div className="flex gap-1.5">
                      <button onClick={() => { setStock(it.id, -1); if (it.stock - 1 <= it.min) pushNotif({ type: 'stok', title: 'Bahan baku habis', message: `${it.name} tersisa ${Math.max(0, it.stock - 1)} ${it.unit}.` }); }} className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-extrabold text-slate-600">−</button>
                      <button onClick={() => setStock(it.id, 1)} className="w-7 h-7 rounded-lg bg-[#0A2540] font-extrabold text-white">+</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* kunjungan / sidak */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/60">
        <SectionTitle title="Kunjungan & Sidak" sub="Pemeriksaan area oleh atasan" right={canEdit ? <button onClick={() => setShowVisit(true)} className="flex items-center gap-1 rounded-xl bg-[#0A2540] px-3 py-2 text-[11px] font-extrabold text-white"><Plus size={13} /> Kunjungan</button> : undefined} />
        <div className="space-y-2.5">
          {visits.map(vs => (
            <div key={vs.id} className="rounded-2xl border border-slate-200 p-3.5 bg-slate-50/60">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500"><CalendarCheck size={12} /> {vs.date}</span>
                <span className={`ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full ${vs.status === 'selesai' ? 'bg-green-100 text-green-800' : vs.status === 'temuan' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>{vs.status.toUpperCase()}</span>
              </div>
              <p className="text-[13.5px] font-extrabold text-slate-900 mt-1.5 flex items-center gap-1.5"><UserCheck size={14} className="text-[#0A2540]" /> {vs.visitor}</p>
              <p className="text-[12px] font-bold text-[#0A2540] flex items-center gap-1 mt-0.5"><MapPin size={12} /> {vs.area}</p>
              <p className="text-[12px] text-slate-600 mt-1"><b>Tujuan:</b> {vs.purpose}</p>
              <p className="text-[12px] text-slate-600"><b>Hasil:</b> {vs.result}</p>
            </div>
          ))}
        </div>
      </div>

      <Modal open={showVisit} onClose={() => setShowVisit(false)}>
        <h3 className="font-extrabold text-slate-900 mb-1">Catat Kunjungan / Sidak</h3>
        <p className="text-xs text-slate-500 mb-4">Hanya Komandan, Wakil & Koki</p>
        {[['visitor', 'Nama pengunjung'], ['purpose', 'Tujuan kunjungan'], ['result', 'Hasil / temuan']].map(([k, l]) => (
          <div key={k} className="mb-2.5">
            <label className="text-[11px] font-bold text-slate-600">{l}</label>
            <input value={(v as any)[k]} onChange={e => setV({ ...v, [k]: e.target.value })} placeholder={l as string} className="mt-1 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium outline-none focus:border-[#0A2540]" />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div><label className="text-[11px] font-bold text-slate-600">Area</label>
            <select value={v.area} onChange={e => setV({ ...v, area: e.target.value })} className="mt-1 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold">
              {['Station Goreng', 'Station Bakar', 'Racik & Sambal', 'Gudang Bahan', 'Kasir & Prasmanan', 'Area Cuci'].map(a => <option key={a}>{a}</option>)}
            </select></div>
          <div><label className="text-[11px] font-bold text-slate-600">Status</label>
            <select value={v.status} onChange={e => setV({ ...v, status: e.target.value as any })} className="mt-1 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold">
              <option value="terjadwal">Terjadwal</option><option value="selesai">Selesai</option><option value="temuan">Ada Temuan</option>
            </select></div>
        </div>
        <NavyButton onClick={() => { if (!v.visitor || !v.purpose) return; addVisit({ ...v }); pushNotif({ type: 'tugas', title: 'Kunjungan baru dicatat', message: `${v.visitor} — ${v.area}: ${v.purpose}` }); setShowVisit(false); setV({ visitor: '', area: 'Station Goreng', purpose: '', result: '', status: 'selesai', date: new Date().toISOString().slice(0, 10) }); }}><Plus size={15} /> Simpan Kunjungan</NavyButton>
      </Modal>

      <Modal open={showStock} onClose={() => setShowStock(false)}>
        <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2"><Package size={17} /> Tambah Bahan Baku</h3>
        <label className="text-[11px] font-bold text-slate-600">Nama bahan</label>
        <input value={s.name} onChange={e => setS({ ...s, name: e.target.value })} placeholder="cth: Tahu putih" className="mt-1 mb-2.5 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#0A2540]" />
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div><label className="text-[11px] font-bold text-slate-600">Satuan</label><input value={s.unit} onChange={e => setS({ ...s, unit: e.target.value })} className="mt-1 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold" /></div>
          <div><label className="text-[11px] font-bold text-slate-600">Stok</label><input type="number" value={s.stockN} onChange={e => setS({ ...s, stockN: Number(e.target.value) })} className="mt-1 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold" /></div>
          <div><label className="text-[11px] font-bold text-slate-600">Minimum</label><input type="number" value={s.min} onChange={e => setS({ ...s, min: Number(e.target.value) })} className="mt-1 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold" /></div>
        </div>
        <NavyButton onClick={() => { if (!s.name) return; addStock(s.name, s.unit, s.stockN, s.min); setShowStock(false); setS({ name: '', unit: 'kg', stockN: 0, min: 0 }); }}><Plus size={15} /> Simpan Bahan</NavyButton>
      </Modal>
    </div>
  );
}
