import { useMemo, useState } from 'react';
import { CheckCircle2, Clock, Download, FileSpreadsheet, FileText, Search, XCircle } from 'lucide-react';
import { toCSV, type Report } from '../lib/data';
import { useStore } from '../lib/store';
import { Modal, SectionTitle } from '../components/ui';

export default function History() {
  const { reports, session, reviewReport } = useStore();
  const [q, setQ] = useState('');
  const [f, setF] = useState<'semua' | Report['status']>('semua');
  const [detail, setDetail] = useState<Report | null>(null);
  const [note, setNote] = useState('');

  const canReview = session && (session.role === 'komandan' || session.role === 'wakil' || session.role === 'koki');

  const list = useMemo(() => reports.filter(r => {
    const hit = (r.userName + r.jabatan + r.id + r.summary).toLowerCase().includes(q.toLowerCase());
    const fs = f === 'semua' || r.status === f;
    return hit && fs;
  }), [reports, q, f]);

  const exportCSV = () => {
    const blob = new Blob([toCSV(list)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `riwayat-laporan-kampung-kecil-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <div>
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/60 mb-3">
        <SectionTitle title="Riwayat Laporan" sub={`${list.length} laporan tersimpan`} right={
          <div className="flex gap-1.5">
            <button onClick={exportCSV} className="flex items-center gap-1 rounded-xl bg-green-600 px-3 py-2 text-[11px] font-extrabold text-white shadow"><FileSpreadsheet size={13} /> Excel</button>
            <button onClick={exportPDF} className="flex items-center gap-1 rounded-xl bg-[#0A2540] px-3 py-2 text-[11px] font-extrabold text-white shadow"><FileText size={13} /> PDF</button>
          </div>
        } />
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cari nama, jabatan, ID laporan..."
            className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-[13px] font-medium outline-none focus:border-[#0A2540] focus:bg-white" />
        </div>
        <div className="flex gap-1.5 mt-2.5">
          {([['semua', 'Semua'], ['menunggu', 'Menunggu'], ['disetujui', 'Disetujui'], ['ditolak', 'Ditolak']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setF(k)} className={`rounded-full px-3.5 py-1.5 text-[11px] font-extrabold transition ${f === k ? 'bg-[#0A2540] text-white' : 'bg-slate-100 text-slate-500'}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        {list.map((r, i) => (
          <button key={r.id} onClick={() => { setDetail(r); setNote(r.reviewNote || ''); }} className="w-full text-left bg-white rounded-3xl p-4 shadow-sm border border-slate-200/60 hover:border-[#0A2540] transition anim-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-2xl grid place-content-center text-white text-sm font-extrabold bg-[#0A2540]">{r.userName.charAt(0)}</div>
                <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full grid place-content-center border-2 border-white ${r.status === 'disetujui' ? 'bg-green-500' : r.status === 'ditolak' ? 'bg-red-500' : 'bg-amber-400'}`}>
                  {r.status === 'disetujui' ? <CheckCircle2 size={11} className="text-white" /> : r.status === 'ditolak' ? <XCircle size={11} className="text-white" /> : <Clock size={11} className="text-white" />}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13.5px] font-extrabold text-slate-900 truncate">{r.userName}</p>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${r.status === 'disetujui' ? 'bg-green-100 text-green-800' : r.status === 'ditolak' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>{r.status.toUpperCase()}</span>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold">{r.jabatan} · Shift {r.shift} · {r.date}</p>
              </div>
              <p className="text-lg font-extrabold text-[#0A2540]">{r.percent}%</p>
            </div>
            <div className="mt-2.5 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-green-500" style={{ width: r.percent + '%' }} /></div>
            <div className="flex gap-1.5 mt-2.5 text-[10.5px] font-bold">
              <span className="bg-slate-100 rounded-lg px-2 py-1 text-slate-600">{r.doneCount}/{r.totalTasks} selesai</span>
              <span className="bg-green-50 border border-green-200 rounded-lg px-2 py-1 text-green-700">OK {r.okCount}</span>
              {r.perluCount > 0 && <span className="bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 text-amber-700">Cek {r.perluCount}</span>}
              {r.masalahCount > 0 && <span className="bg-red-50 border border-red-200 rounded-lg px-2 py-1 text-red-700">Masalah {r.masalahCount}</span>}
              <span className="ml-auto text-slate-400 font-mono">{r.id}</span>
            </div>
          </button>
        ))}
        {list.length === 0 && (
          <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-300">
            <FileText size={28} className="mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-500 mt-2">Belum ada laporan</p>
            <p className="text-xs text-slate-400">Laporan yang dikirim dari menu Hari Ini akan muncul di sini.</p>
          </div>
        )}
      </div>

      {/* printable table for PDF */}
      <div className="print-only">
        <h2 style={{ fontWeight: 800 }}>Kampung Kecil Metropolitan Bekasi — Riwayat Laporan</h2>
        <table border={1} cellPadding={6} style={{ fontSize: 11, width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
          <thead><tr><th>ID</th><th>Tanggal</th><th>Nama</th><th>Shift</th><th>Selesai</th><th>%</th><th>Status</th></tr></thead>
          <tbody>{list.map(r => <tr key={r.id}><td>{r.id}</td><td>{r.date}</td><td>{r.userName}</td><td>{r.shift}</td><td>{r.doneCount}/{r.totalTasks}</td><td>{r.percent}%</td><td>{r.status}</td></tr>)}</tbody>
        </table>
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} wide>
        {detail && (
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900">Detail {detail.id}</h3>
              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${detail.status === 'disetujui' ? 'bg-green-100 text-green-800' : detail.status === 'ditolak' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>{detail.status.toUpperCase()}</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">{detail.userName} · {detail.jabatan} · Shift {detail.shift} · {detail.date} · {detail.createdAt}</p>
            <div className="rounded-2xl bg-[#0A2540] p-4 text-white mb-3">
              <div className="flex justify-between items-center"><p className="text-xs text-slate-300 font-semibold">Penyelesaian</p><p className="text-2xl font-extrabold">{detail.percent}%</p></div>
              <div className="mt-1.5 h-2 rounded-full bg-white/20 overflow-hidden"><div className="h-full bg-green-500" style={{ width: detail.percent + '%' }} /></div>
              <p className="text-[11.5px] mt-2.5 leading-relaxed text-slate-100">"{detail.summary}"</p>
            </div>
            {detail.problemNotes.length > 0 && (
              <div className="rounded-2xl bg-red-50 border border-red-200 p-3 mb-3">
                <p className="text-xs font-extrabold text-red-700 mb-1">Catatan masalah:</p>
                {detail.problemNotes.map((p, i) => <p key={i} className="text-[12px] text-red-700">• {p}</p>)}
              </div>
            )}
            {detail.reviewedBy && <p className="text-[12px] text-slate-600 bg-slate-100 rounded-xl px-3 py-2 mb-3">Direview oleh <b>{detail.reviewedBy}</b>: {detail.reviewNote}</p>}
            {canReview && detail.status === 'menunggu' ? (
              <div>
                <label className="text-[11px] font-extrabold text-slate-600 uppercase">Catatan review</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="cth: OK, tindak lanjuti servis fryer..." className="mt-1 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-[13px] outline-none focus:border-[#0A2540]" />
                <div className="grid grid-cols-2 gap-2 mt-2.5">
                  <button onClick={() => { reviewReport(detail.id, 'ditolak', note || 'Perlu perbaikan.', session!.name); setDetail(null); }} className="rounded-2xl border-2 border-red-200 text-red-600 py-3 text-sm font-extrabold">Tolak</button>
                  <button onClick={() => { reviewReport(detail.id, 'disetujui', note || 'OK, terima kasih.', session!.name); setDetail(null); }} className="rounded-2xl bg-green-600 text-white py-3 text-sm font-extrabold shadow-lg">Setujui</button>
                </div>
              </div>
            ) : (
              <button onClick={exportCSV} className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0A2540] py-3 text-sm font-bold text-white"><Download size={15} /> Unduh Data (Excel/CSV)</button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
