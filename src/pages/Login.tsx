import { useState } from 'react';
import { Eye, EyeOff, LogIn, Store, ShieldCheck, ChefHat, Flame, Crown } from 'lucide-react';
import { useStore } from '../lib/store';
import { ROLE_FULL, type Role } from '../lib/data';

const QUICK: { role: Role; username: string; pass: string; icon: any; color: string; desc: string }[] = [
  { role: 'komandan', username: 'mispin', pass: 'mispin123', icon: Crown, color: '#0A2540', desc: 'Kelola akun & jadwal' },
  { role: 'wakil', username: 'rahmat', pass: 'rahmat123', icon: ShieldCheck, color: '#1A4A7A', desc: 'Pantau & setujui laporan' },
  { role: 'koki', username: 'koki', pass: 'koki123', icon: ChefHat, color: '#B45309', desc: 'Awasi dapur & lapor' },
  { role: 'goreng', username: 'andi', pass: 'andi123', icon: Flame, color: '#15803D', desc: 'Checklist shift' },
];

export default function Login() {
  const { login } = useStore();
  const [id, setId] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const doLogin = (u: string, p: string) => {
    setLoading(true);
    setErr('');
    setTimeout(() => {
      const r = login(u, p);
      if (!r.ok) setErr(r.msg || 'Gagal masuk');
      setLoading(false);
    }, 450);
  };

  return (
    <div className="min-h-dvh bg-[#E8EDF3] flex justify-center">
      <div className="w-full max-w-[480px] min-h-dvh bg-[#E8EDF3] flex flex-col">
        {/* navy header */}
        <div className="bg-[#0A2540] px-6 pt-10 pb-8 rounded-b-[28px] relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/5" />
          <div className="absolute right-10 top-24 w-24 h-24 rounded-full bg-white/5" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white grid place-content-center shadow-lg">
                <Store size={24} className="text-[#0A2540]" />
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-[.18em] text-sky-300 uppercase">Sistem Checklist Dapur</p>
                <h1 className="text-white text-xl font-extrabold leading-tight">Kampung Kecil<br />Metropolitan Bekasi</h1>
              </div>
            </div>
            <p className="text-slate-300 text-xs mt-3 leading-relaxed">Checklist harian dapur profesional — open, operasional & closing. Sesuai posisi, shift & hak akses.</p>
            <div className="flex gap-2 mt-4">
              {['Open 06.00', 'Operasional', 'Closing 22.30'].map(s => (
                <span key={s} className="text-[10px] font-bold bg-white/10 text-white px-2.5 py-1 rounded-full border border-white/15">{s}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 -mt-0 pt-5 pb-10 flex-1">
          <div className="bg-white rounded-3xl p-5 shadow-xl shadow-slate-300/40 anim-slide-up">
            <h2 className="font-extrabold text-slate-900 text-[16px]">Masuk ke Akun Dapur</h2>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">Gunakan email atau username + password</p>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Email / Username</label>
            <input value={id} onChange={e => setId(e.target.value)} placeholder="cth: andi / andi@kampungkecil.id"
              className="mt-1.5 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#0A2540] focus:bg-white transition" />
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mt-4 block">Password</label>
            <div className="relative mt-1.5">
              <input type={show ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && doLogin(id, pass)}
                className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#0A2540] focus:bg-white transition pr-12" />
              <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            {err && <div className="mt-3 rounded-2xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-semibold text-red-700">{err}</div>}
            <button disabled={loading || !id || !pass} onClick={() => doLogin(id, pass)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0A2540] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0A2540]/25 transition active:scale-[.98] hover:bg-[#12365C] disabled:opacity-50">
              <LogIn size={17} /> {loading ? 'Memeriksa...' : 'Masuk Dashboard'}
            </button>
          </div>

          <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[.14em] mt-6 mb-2 px-1">Masuk cepat — akun demo</p>
          <div className="grid grid-cols-2 gap-2.5">
            {QUICK.map(q => (
              <button key={q.username} onClick={() => doLogin(q.username, q.pass)}
                className="bg-white rounded-2xl p-3.5 text-left shadow-sm border border-slate-200/70 hover:border-[#0A2540] hover:shadow-md transition active:scale-[.98] anim-slide-up">
                <div className="w-9 h-9 rounded-xl grid place-content-center text-white mb-2" style={{ background: q.color }}><q.icon size={17} /></div>
                <p className="text-[13px] font-extrabold text-slate-900">{ROLE_FULL[q.role]}</p>
                <p className="text-[11px] text-slate-500 font-medium">{q.desc}</p>
                <p className="text-[11px] font-mono font-bold text-[#0A2540] mt-1.5 bg-slate-100 rounded-lg px-2 py-1 inline-block">{q.username} · {q.pass}</p>
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-[#0A2540] p-4 flex gap-3 items-start">
            <ShieldCheck size={20} className="text-green-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-slate-200"><b className="text-white">Hak akses terkunci per peran.</b> Komandan mengelola akun & jadwal · Wakil memantau & menyetujui · Koki mengawasi & melapor · Goreng mengisi checklist shift-nya.</p>
          </div>
          <p className="text-center text-[11px] text-slate-400 font-medium mt-5">© 2026 Kampung Kecil Metropolitan Bekasi · v1.0</p>
        </div>
      </div>
    </div>
  );
}
