import { mutation } from './_generated/server';

// Seed semua data awal: users, courses, registrasi, nilai, ospek, evaluasi, pengumuman
// File ini harus bernama seedAll.ts → diakses via api.seedAll.seedAll
// Pastikan sudah run: npx convex dev setelah menambahkan file ini
export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // ── 1. Users ──────────────────────────────────────────────
    let yeremia = await ctx.db.query('users').withIndex('by_username', q => q.eq('username', 'yeremia')).first();
    if (!yeremia) {
      const id = await ctx.db.insert('users', {
        username: 'yeremia', password: '12345', name: 'Yeremia Tumbelaka', role: 'student',
        nim: '22101001', prodi: 'Teknik Informatika', angkatan: '2022', maxSks: 24, activeUntil: '2028/2029 Genap',
      });
      yeremia = await ctx.db.get(id);
    }

    const maria = await ctx.db.query('users').withIndex('by_username', q => q.eq('username', 'maria')).first();
    if (!maria) {
      await ctx.db.insert('users', {
        username: 'maria', password: '12345', name: 'Maria Pontoh', role: 'student',
        nim: '22101002', prodi: 'Sistem Informasi', angkatan: '2022', maxSks: 24, activeUntil: '2028/2029 Genap',
      });
    }

    const admin = await ctx.db.query('users').withIndex('by_username', q => q.eq('username', 'admin')).first();
    if (!admin) {
      await ctx.db.insert('users', { username: 'admin', password: 'admin123', name: 'Administrator', role: 'admin' });
    }

    // ── 2. Courses ─────────────────────────────────────────────
    let courses = await ctx.db.query('courses').collect();
    if (courses.length === 0) {
      const defs = [
        { code:'IF101', name:'Pemrograman Dasar',  credits:3, semester:'2024/2025 Ganjil', quota:30, schedule:'Senin 08:00-10:00',   day:'Senin',  time:'08:00-10:00', room:'Lab A.101', lecturer:'Dr. Budi Santoso' },
        { code:'IF102', name:'Struktur Data',       credits:3, semester:'2024/2025 Ganjil', quota:25, schedule:'Selasa 10:00-12:00',  day:'Selasa', time:'10:00-12:00', room:'R. B.202',  lecturer:'Dr. Ani Wijaya' },
        { code:'IF103', name:'Basis Data',          credits:3, semester:'2024/2025 Ganjil', quota:25, schedule:'Rabu 13:00-15:00',    day:'Rabu',   time:'13:00-15:00', room:'Lab A.103', lecturer:'Dr. Candra Kusuma' },
        { code:'IF104', name:'Pemrograman Web',     credits:3, semester:'2024/2025 Ganjil', quota:30, schedule:'Kamis 09:00-11:00',   day:'Kamis',  time:'09:00-11:00', room:'Lab B.101', lecturer:'Dr. Dewi Lestari' },
        { code:'IF105', name:'Jaringan Komputer',   credits:2, semester:'2024/2025 Ganjil', quota:28, schedule:'Jumat 08:00-10:00',   day:'Jumat',  time:'08:00-10:00', room:'R. C.301',  lecturer:'Dr. Eko Prasetyo' },
        { code:'IF106', name:'Kecerdasan Buatan',   credits:3, semester:'2024/2025 Ganjil', quota:25, schedule:'Senin 13:00-15:00',   day:'Senin',  time:'13:00-15:00', room:'R. B.303',  lecturer:'Dr. Fanny Sirait' },
        { code:'IF107', name:'Sistem Operasi',      credits:3, semester:'2024/2025 Ganjil', quota:30, schedule:'Rabu 08:00-10:00',    day:'Rabu',   time:'08:00-10:00', room:'R. A.201',  lecturer:'Dr. Gideon Kalangi' },
        { code:'MK201', name:'Kalkulus',            credits:3, semester:'2024/2025 Ganjil', quota:35, schedule:'Selasa 07:00-09:00',  day:'Selasa', time:'07:00-09:00', room:'R. D.101',  lecturer:'Dr. Hana Roring' },
      ];
      for (const c of defs) await ctx.db.insert('courses', c);
      courses = await ctx.db.query('courses').collect();
    }

    if (!yeremia) return 'gagal: user tidak ditemukan';

    // ── 3. Registrasi Yeremia (4 MK) ──────────────────────────
    const existingRegs = await ctx.db.query('registrations').withIndex('by_user', q => q.eq('userId', yeremia!._id)).collect();
    if (existingRegs.length === 0) {
      for (const c of courses.slice(0, 4)) {
        await ctx.db.insert('registrations', { userId: yeremia!._id, courseId: c._id, status: 'registered', registeredAt: Date.now() });
      }
    }

    // ── 4. Nilai historis Yeremia (3 MK) ──────────────────────
    const existingGrades = await ctx.db.query('grades').withIndex('by_user', q => q.eq('userId', yeremia!._id)).collect();
    if (existingGrades.length === 0) {
      const gradeData = [
        { course: courses[5], grade: 'A',  score: 92, semester: '2023/2024 Genap' },
        { course: courses[6], grade: 'B+', score: 85, semester: '2023/2024 Genap' },
        { course: courses[7], grade: 'A-', score: 88, semester: '2023/2024 Genap' },
      ];
      for (const g of gradeData) {
        await ctx.db.insert('grades', { userId: yeremia!._id, courseId: g.course._id, grade: g.grade, score: g.score, semester: g.semester, updatedAt: Date.now() });
      }
    }

    // ── 5. Ospek & KKN ─────────────────────────────────────────
    const existingOspek = await ctx.db.query('ospekKkn').withIndex('by_user', q => q.eq('userId', yeremia!._id)).collect();
    if (existingOspek.length === 0) {
      await ctx.db.insert('ospekKkn', { userId: yeremia!._id, type: 'ospek', status: 'completed',   year: '2022', notes: 'OSPEK Universitas Klabat 2022' });
      await ctx.db.insert('ospekKkn', { userId: yeremia!._id, type: 'kkn',   status: 'in_progress', year: '2025', notes: 'KKN Desa Pineleng, Minahasa' });
      await ctx.db.insert('ospekKkn', { userId: yeremia!._id, type: 'kku',   status: 'not_started', year: '2026' });
    }

    // ── 6. Evaluasi Dosen ───────────────────────────────────────
    const existingEval = await ctx.db.query('teacherEvaluations').withIndex('by_user', q => q.eq('userId', yeremia!._id)).collect();
    if (existingEval.length === 0) {
      await ctx.db.insert('teacherEvaluations', { userId: yeremia!._id, courseId: courses[5]._id, rating: 5, comment: 'Dosen sangat menguasai materi.', createdAt: Date.now() });
    }

    // ── 7. Pengumuman ───────────────────────────────────────────
    const existingAnn = await ctx.db.query('announcements').first();
    if (!existingAnn) {
      await ctx.db.insert('announcements', { title: 'Batas Studi',    message: 'Maksimum masa studi mahasiswa adalah 7 tahun sejak terdaftar.', color: 'yellow' });
      await ctx.db.insert('announcements', { title: 'Jadwal UAS',     message: 'Ujian Akhir Semester dimulai 15 Januari 2025.', color: 'blue' });
      await ctx.db.insert('announcements', { title: 'Pembayaran SPP', message: 'Batas pembayaran SPP semester genap: 31 Januari 2025.', color: 'red' });
    }

    return 'Seed selesai!';
  },
});