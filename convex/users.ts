import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Login: cek username & password, return data user
export const login = mutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_username', q => q.eq('username', args.username))
      .first();
    if (!user || user.password !== args.password)
      throw new Error('Username atau password salah');
    return {
      _id: user._id, username: user.username, name: user.name, role: user.role,
      nim: user.nim, prodi: user.prodi, angkatan: user.angkatan,
      maxSks: user.maxSks, activeUntil: user.activeUntil,
    };
  },
});

// Daftar akun baru (role student otomatis)
export const register = mutation({
  args: { name: v.string(), username: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_username', q => q.eq('username', args.username))
      .first();
    if (existing) throw new Error('Username sudah dipakai');
    const nim = `22${Date.now().toString().slice(-6)}`;
    const id = await ctx.db.insert('users', {
      name: args.name, username: args.username, password: args.password,
      role: 'student', nim,
      prodi: 'Teknik Informatika',
      angkatan: new Date().getFullYear().toString(),
      maxSks: 24,
      activeUntil: `${new Date().getFullYear() + 6}/${new Date().getFullYear() + 7} Genap`,
    });
    const user = await ctx.db.get(id);
    return {
      _id: id, name: user!.name, username: user!.username, role: user!.role,
      nim: user!.nim, prodi: user!.prodi, angkatan: user!.angkatan,
      maxSks: user!.maxSks, activeUntil: user!.activeUntil,
    };
  },
});

// Ambil semua mahasiswa (untuk admin input nilai)
export const listStudents = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query('users').filter(q => q.eq(q.field('role'), 'student')).collect();
  },
});

export const getById = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => ctx.db.get(args.userId),
});

// ─────────────────────────────────────────────────────────────────────────────
// Seed semua data awal — dipanggil dari login screen
// Aman dipanggil berkali-kali (idempotent)
// ─────────────────────────────────────────────────────────────────────────────
export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {

    // ── USERS ────────────────────────────────────────────────────────────────
    const USERS = [
      {
        username: 'yeremia', password: '12345', name: 'Yeremia Tumbelaka', role: 'student' as const,
        nim: '22101001', prodi: 'Teknik Informatika', angkatan: '2022', maxSks: 24,
        activeUntil: '2028/2029 Genap',
      },
      {
        username: 'maria', password: '12345', name: 'Maria Pontoh', role: 'student' as const,
        nim: '22101002', prodi: 'Sistem Informasi', angkatan: '2022', maxSks: 24,
        activeUntil: '2028/2029 Genap',
      },
      {
        username: 'admin', password: 'admin123', name: 'Administrator', role: 'admin' as const,
      },
    ];

    let yerId: any = null;
    for (const u of USERS) {
      const exists = await ctx.db
        .query('users').withIndex('by_username', q => q.eq('username', u.username)).first();
      if (!exists) {
        const id = await ctx.db.insert('users', u);
        if (u.username === 'yeremia') yerId = id;
      } else {
        if (u.username === 'yeremia') yerId = exists._id;
      }
    }

    // ── COURSES ──────────────────────────────────────────────────────────────
    const COURSES = [
      { code:'IF101', name:'Pemrograman Dasar',   credits:3, semester:'2024/2025 Ganjil', quota:30,
        schedule:'Senin 08:00-10:00',   day:'Senin',  time:'08:00-10:00', room:'Lab A.101', lecturer:'Dr. Budi Santoso' },
      { code:'IF102', name:'Struktur Data',        credits:3, semester:'2024/2025 Ganjil', quota:25,
        schedule:'Selasa 10:00-12:00',  day:'Selasa', time:'10:00-12:00', room:'R. B.202',  lecturer:'Dr. Ani Wijaya' },
      { code:'IF103', name:'Basis Data',           credits:3, semester:'2024/2025 Ganjil', quota:25,
        schedule:'Rabu 13:00-15:00',    day:'Rabu',   time:'13:00-15:00', room:'Lab A.103', lecturer:'Dr. Candra Kusuma' },
      { code:'IF104', name:'Pemrograman Web',      credits:3, semester:'2024/2025 Ganjil', quota:30,
        schedule:'Kamis 09:00-11:00',   day:'Kamis',  time:'09:00-11:00', room:'Lab B.101', lecturer:'Dr. Dewi Lestari' },
      { code:'IF105', name:'Jaringan Komputer',    credits:2, semester:'2024/2025 Ganjil', quota:28,
        schedule:'Jumat 08:00-10:00',   day:'Jumat',  time:'08:00-10:00', room:'R. C.301',  lecturer:'Dr. Eko Prasetyo' },
      { code:'IF106', name:'Kecerdasan Buatan',    credits:3, semester:'2024/2025 Ganjil', quota:25,
        schedule:'Senin 13:00-15:00',   day:'Senin',  time:'13:00-15:00', room:'R. B.303',  lecturer:'Dr. Fanny Sirait' },
      { code:'IF107', name:'Sistem Operasi',       credits:3, semester:'2024/2025 Ganjil', quota:30,
        schedule:'Rabu 08:00-10:00',    day:'Rabu',   time:'08:00-10:00', room:'R. A.201',  lecturer:'Dr. Gideon Kalangi' },
      { code:'MK201', name:'Kalkulus',             credits:3, semester:'2024/2025 Ganjil', quota:35,
        schedule:'Selasa 07:00-09:00',  day:'Selasa', time:'07:00-09:00', room:'R. D.101',  lecturer:'Dr. Hana Roring' },
    ];

    // Patch courses yang sudah ada tapi belum punya day/time/room
    const allCourses = await ctx.db.query('courses').collect();
    for (const def of COURSES) {
      const existing = allCourses.find(c => c.code === def.code);
      if (!existing) {
        await ctx.db.insert('courses', def);
      } else if (!existing.day) {
        // Patch data lama dengan field baru
        await ctx.db.patch(existing._id, {
          day: def.day, time: def.time, room: def.room, schedule: def.schedule,
        });
      }
    }

    if (!yerId) return 'ok';

    // ── REGISTRASI YEREMIA ───────────────────────────────────────────────────
    const freshCourses = await ctx.db.query('courses').collect();
    const regs = await ctx.db
      .query('registrations').withIndex('by_user', q => q.eq('userId', yerId)).collect();
    if (regs.length === 0) {
      for (const c of freshCourses.slice(0, 4)) {
        await ctx.db.insert('registrations', {
          userId: yerId, courseId: c._id, status: 'registered', registeredAt: Date.now(),
        });
      }
    }

    // ── NILAI HISTORIS ───────────────────────────────────────────────────────
    const grades = await ctx.db
      .query('grades').withIndex('by_user', q => q.eq('userId', yerId)).collect();
    if (grades.length === 0 && freshCourses.length >= 8) {
      const hist: [number, string, number][] = [[4,'A',92],[5,'B+',85],[6,'A-',88]];
      for (const [idx, grade, score] of hist) {
        await ctx.db.insert('grades', {
          userId: yerId, courseId: freshCourses[idx]._id,
          grade, score, semester: '2023/2024 Genap', updatedAt: Date.now(),
        });
      }
    }

    // ── OSPEK / KKN / KKU ───────────────────────────────────────────────────
    const ospek = await ctx.db
      .query('ospekKkn').withIndex('by_user', q => q.eq('userId', yerId)).collect();
    if (ospek.length === 0) {
      await ctx.db.insert('ospekKkn', {
        userId: yerId, type: 'ospek', status: 'completed',   year: '2022',
        notes: 'OSPEK Universitas Klabat 2022',
      });
      await ctx.db.insert('ospekKkn', {
        userId: yerId, type: 'kkn',   status: 'in_progress', year: '2025',
        notes: 'KKN Desa Pineleng, Minahasa',
      });
      await ctx.db.insert('ospekKkn', {
        userId: yerId, type: 'kku',   status: 'not_started', year: '2026',
      });
    }

    // ── EVALUASI DOSEN ───────────────────────────────────────────────────────
    const evals = await ctx.db
      .query('teacherEvaluations').withIndex('by_user', q => q.eq('userId', yerId)).collect();
    if (evals.length === 0 && freshCourses.length > 0) {
      await ctx.db.insert('teacherEvaluations', {
        userId: yerId, courseId: freshCourses[0]._id,
        rating: 4, comment: 'Penjelasan mudah dipahami, tugas relevan.',
        createdAt: Date.now(),
      });
    }

    // ── PENGUMUMAN ───────────────────────────────────────────────────────────
    const ann = await ctx.db.query('announcements').first();
    if (!ann) {
      await ctx.db.insert('announcements', {
        title: 'Batas Studi',
        message: 'Maksimum masa studi mahasiswa adalah 7 tahun sejak terdaftar.',
        color: 'yellow',
      });
      await ctx.db.insert('announcements', {
        title: 'Jadwal UAS',
        message: 'Ujian Akhir Semester dimulai 15 Januari 2025. Pastikan semua tugas selesai.',
        color: 'blue',
      });
      await ctx.db.insert('announcements', {
        title: 'Pembayaran SPP',
        message: 'Batas pembayaran SPP semester genap: 31 Januari 2025.',
        color: 'red',
      });
    }

    return 'Seed selesai!';
  },
});