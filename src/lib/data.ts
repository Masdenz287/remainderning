export type Role = 'komandan' | 'wakil' | 'koki' | 'goreng';
export type Shift = 'Pagi' | 'Siang' | 'Malam' | 'Full';
export type Phase = 'open' | 'operasional' | 'closing';
export type TaskStatus = 'ok' | 'perlu' | 'masalah';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  role: Role;
  jabatan: string;
  shift: Shift;
  active: boolean;
  color: string;
}

export interface TaskTemplate {
  id: string;
  title: string;
  time: string;
  phase: Phase;
  position: string;
  desc: string;
}

export interface CheckState {
  done: boolean;
  status: TaskStatus;
  keterangan: string;
  catatan: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  date: string;
  userId: string;
  userName: string;
  jabatan: string;
  role: Role;
  shift: Shift;
  totalTasks: number;
  doneCount: number;
  okCount: number;
  perluCount: number;
  masalahCount: number;
  percent: number;
  summary: string;
  problemNotes: string[];
  status: 'menunggu' | 'disetujui' | 'ditolak';
  createdAt: string;
  reviewedBy?: string;
  reviewNote?: string;
}

export interface StockItem {
  id: string;
  name: string;
  unit: string;
  stock: number;
  min: number;
  updatedAt: string;
}

export interface Visit {
  id: string;
  date: string;
  visitor: string;
  area: string;
  purpose: string;
  result: string;
  status: 'terjadwal' | 'selesai' | 'temuan';
}

export interface ScheduleRow {
  id: string;
  userId: string;
  date: string;
  shift: Shift;
  note: string;
}

export interface Reminder {
  id: string;
  label: string;
  time: string;
  phase: Phase;
  active: boolean;
}

export interface AppNotif {
  id: string;
  type: 'tugas' | 'terlambat' | 'stok' | 'persetujuan';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const ROLE_LABEL: Record<Role, string> = {
  komandan: 'Komandan',
  wakil: 'Wakil',
  koki: 'Koki',
  goreng: 'Goreng',
};

export const ROLE_FULL: Record<Role, string> = {
  komandan: 'Komandan Mispin',
  wakil: 'Wakil Rahmat',
  koki: 'Koki',
  goreng: 'Goreng',
};

export const PHASE_LABEL: Record<Phase, string> = {
  open: 'Persiapan Open',
  operasional: 'Operasional',
  closing: 'Closing',
};

export const PHASE_TIME: Record<Phase, string> = {
  open: '06.00 – 10.00',
  operasional: '10.00 – 21.00',
  closing: '21.00 – 22.30',
};

export const SEED_USERS: User[] = [
  { id: 'u1', name: 'Mispin', username: 'mispin', email: 'mispin@kampungkecil.id', password: 'mispin123', role: 'komandan', jabatan: 'Komandan Dapur', shift: 'Full', active: true, color: '#0A2540' },
  { id: 'u2', name: 'Rahmat', username: 'rahmat', email: 'rahmat@kampungkecil.id', password: 'rahmat123', role: 'wakil', jabatan: 'Wakil Kepala Dapur', shift: 'Pagi', active: true, color: '#1A4A7A' },
  { id: 'u3', name: 'Chef Juna', username: 'koki', email: 'koki@kampungkecil.id', password: 'koki123', role: 'koki', jabatan: 'Kepala Koki', shift: 'Pagi', active: true, color: '#B45309' },
  { id: 'u4', name: 'Andi Pratama', username: 'andi', email: 'andi@kampungkecil.id', password: 'andi123', role: 'goreng', jabatan: 'Goreng · Station Ayam', shift: 'Pagi', active: true, color: '#15803D' },
  { id: 'u5', name: 'Siti Rahayu', username: 'siti', email: 'siti@kampungkecil.id', password: 'siti123', role: 'goreng', jabatan: 'Goreng · Station Lele & Sambal', shift: 'Siang', active: true, color: '#0E7490' },
  { id: 'u6', name: 'Budi Santoso', username: 'budi', email: 'budi@kampungkecil.id', password: 'budi123', role: 'koki', jabatan: 'Koki · Operasional', shift: 'Siang', active: true, color: '#7C3AED' },
];

export const SEED_TASKS: TaskTemplate[] = [
  { id: 't01', title: 'Nyalakan fryer & cek suhu minyak 170–180°C', time: '06:00', phase: 'open', position: 'Goreng', desc: 'Pastikan 2 unit fryer menyala, minyak bersih & cukup.' },
  { id: 't02', title: 'Marinasi ayam & ungkepan pagi', time: '06:30', phase: 'open', position: 'Goreng', desc: 'Ayam kampung 15 ekor + bumbu ungkep, cek rasa.' },
  { id: 't03', title: 'Siapkan sambal, lalapan & nasi liwet', time: '07:00', phase: 'open', position: 'Goreng', desc: 'Sambal terasi, lalapan segar, nasi liwet 2 dandang.' },
  { id: 't04', title: 'Cek stok bahan baku pagi (ayam, lele, beras)', time: '07:00', phase: 'open', position: 'Koki', desc: 'Timbang & catat sisa stok, laporkan jika < minimum.' },
  { id: 't05', title: 'Briefing tim & pembagian station shift', time: '07:30', phase: 'open', position: 'Koki', desc: 'Doa pagi, bagi station goreng, bakar & racik.' },
  { id: 't06', title: 'Kebersihan area dapur, lantai & wastafel', time: '08:00', phase: 'open', position: 'Semua', desc: 'Pel lantai, sikat wastafel, kosongkan sampah.' },
  { id: 't07', title: 'Kalibrasi rasa: goreng tester 2 potong', time: '09:30', phase: 'open', position: 'Goreng', desc: 'Goreng tester, cicipi kematangan & kegurihan.' },
  { id: 't08', title: 'Kontrol kualitas gorengan jam ramai', time: '12:00', phase: 'operasional', position: 'Goreng', desc: 'Jaga antrian, minyak tidak gosong, tiriskan sempurna.' },
  { id: 't09', title: 'Refill sambal, lalapan & nasi tiap 1 jam', time: '13:00', phase: 'operasional', position: 'Goreng', desc: 'Jangan sampai prasmanan kosong saat jam makan.' },
  { id: 't10', title: 'Pantau suhu & ganti minyak bila keruh', time: '15:00', phase: 'operasional', position: 'Koki', desc: 'Cek visual minyak, ganti jika sudah gelap/berbusa.' },
  { id: 't11', title: 'Stok opname sore & order bahan besok', time: '17:00', phase: 'operasional', position: 'Koki', desc: 'Catat pemakaian, buat order ke supplier.' },
  { id: 't12', title: 'Serah terima shift Pagi → Siang', time: '14:00', phase: 'operasional', position: 'Semua', desc: 'Catat sisa bahan, masalah fryer & pesan khusus.' },
  { id: 't13', title: 'Matikan fryer, saring & simpan minyak', time: '21:00', phase: 'closing', position: 'Goreng', desc: 'Saring minyak, simpan di drum bersih, matikan gas.' },
  { id: 't14', title: 'Cuci peralatan, kompor & exhaust', time: '21:30', phase: 'closing', position: 'Semua', desc: 'Degreasing kompor, cuci wajan, lap exhaust.' },
  { id: 't15', title: 'Rekap closing: sisa bahan & laporan harian', time: '22:00', phase: 'closing', position: 'Koki', desc: 'Tutup kas bahan, foto area bersih, kirim laporan.' },
];

export const SEED_STOCK: StockItem[] = [
  { id: 's1', name: 'Ayam kampung', unit: 'ekor', stock: 18, min: 10, updatedAt: '07:00' },
  { id: 's2', name: 'Lele', unit: 'kg', stock: 12, min: 8, updatedAt: '07:00' },
  { id: 's3', name: 'Beras', unit: 'kg', stock: 25, min: 15, updatedAt: '07:00' },
  { id: 's4', name: 'Minyak goreng', unit: 'liter', stock: 6, min: 10, updatedAt: '07:00' },
  { id: 's5', name: 'Cabai rawit', unit: 'kg', stock: 3, min: 2, updatedAt: '07:00' },
  { id: 's6', name: 'Gas LPG 12kg', unit: 'tabung', stock: 2, min: 2, updatedAt: '07:00' },
];

export const SEED_VISITS: Visit[] = [
  { id: 'v1', date: '2026-10-20', visitor: 'Rahmat (Wakil)', area: 'Station Goreng', purpose: 'Sidak kebersihan fryer', result: 'Fryer 2 perlu degreasing, sudah ditindaklanjuti.', status: 'selesai' },
  { id: 'v2', date: '2026-10-21', visitor: 'Mispin (Komandan)', area: 'Gudang Bahan', purpose: 'Cek stok minyak & gas', result: 'Minyak menipis, order 20 liter ke supplier.', status: 'temuan' },
];

export const SEED_REMINDERS: Reminder[] = [
  { id: 'r1', label: 'Reminder persiapan open', time: '06:00', phase: 'open', active: true },
  { id: 'r2', label: 'Kontrol jam ramai siang', time: '11:30', phase: 'operasional', active: true },
  { id: 'r3', label: 'Stok opname sore', time: '17:00', phase: 'operasional', active: true },
  { id: 'r4', label: 'Mulai closing dapur', time: '21:00', phase: 'closing', active: true },
];

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function formatID(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr + 'T07:00:00') : new Date();
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function nowTime(): string {
  const d = new Date();
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
}

export function uid(prefix = 'id'): string {
  return prefix + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

export function tasksForRole(role: Role): TaskTemplate[] {
  if (role === 'goreng') return SEED_TASKS.filter(t => t.position === 'Goreng' || t.position === 'Semua');
  if (role === 'koki') return SEED_TASKS.filter(t => t.position === 'Koki' || t.position === 'Semua' || t.position === 'Goreng');
  return SEED_TASKS;
}

export function canSeeAll(role: Role): boolean {
  return role === 'komandan' || role === 'wakil' || role === 'koki';
}

export function toCSV(reports: Report[]): string {
  const head = 'ID,Tanggal,Nama,Jabatan,Shift,Total,Selesai,OK,Perlu Diperiksa,Masalah,Persen,Status,Ringkasan';
  const esc = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`;
  const rows = reports.map(r => [r.id, r.date, r.userName, r.jabatan, r.shift, r.totalTasks, r.doneCount, r.okCount, r.perluCount, r.masalahCount, r.percent + '%', r.status, r.summary].map(esc).join(','));
  return head + '\n' + rows.join('\n');
}
