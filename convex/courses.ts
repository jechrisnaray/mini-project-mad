import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query('courses').collect(),
});

export const getById = query({
  args: { id: v.id('courses') },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const seedCourses = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('courses').first();
    if (existing) return 'sudah ada';

    const courses = [
      { code: 'IF101', name: 'Pemrograman Dasar',        credits: 3, semester: '2024/2025 Ganjil', quota: 30, schedule: 'Senin 08:00-10:00',   day: 'Senin',  time: '08:00-10:00', room: 'Lab A.101', lecturer: 'Dr. Budi Santoso' },
      { code: 'IF102', name: 'Struktur Data',             credits: 3, semester: '2024/2025 Ganjil', quota: 25, schedule: 'Selasa 10:00-12:00',  day: 'Selasa', time: '10:00-12:00', room: 'R. B.202',  lecturer: 'Dr. Ani Wijaya' },
      { code: 'IF103', name: 'Basis Data',                credits: 3, semester: '2024/2025 Ganjil', quota: 25, schedule: 'Rabu 13:00-15:00',    day: 'Rabu',   time: '13:00-15:00', room: 'Lab A.103', lecturer: 'Dr. Candra Kusuma' },
      { code: 'IF104', name: 'Pemrograman Web',           credits: 3, semester: '2024/2025 Ganjil', quota: 30, schedule: 'Kamis 09:00-11:00',   day: 'Kamis',  time: '09:00-11:00', room: 'Lab B.101', lecturer: 'Dr. Dewi Lestari' },
      { code: 'IF105', name: 'Jaringan Komputer',         credits: 2, semester: '2024/2025 Ganjil', quota: 28, schedule: 'Jumat 08:00-10:00',   day: 'Jumat',  time: '08:00-10:00', room: 'R. C.301',  lecturer: 'Dr. Eko Prasetyo' },
      { code: 'IF106', name: 'Kecerdasan Buatan',         credits: 3, semester: '2024/2025 Ganjil', quota: 25, schedule: 'Senin 13:00-15:00',   day: 'Senin',  time: '13:00-15:00', room: 'R. B.303',  lecturer: 'Dr. Fanny Sirait' },
      { code: 'IF107', name: 'Sistem Operasi',            credits: 3, semester: '2024/2025 Ganjil', quota: 30, schedule: 'Rabu 08:00-10:00',    day: 'Rabu',   time: '08:00-10:00', room: 'R. A.201',  lecturer: 'Dr. Gideon Kalangi' },
      { code: 'MK201', name: 'Kalkulus',                  credits: 3, semester: '2024/2025 Ganjil', quota: 35, schedule: 'Selasa 07:00-09:00',  day: 'Selasa', time: '07:00-09:00', room: 'R. D.101',  lecturer: 'Dr. Hana Roring' },
    ];

    for (const c of courses) await ctx.db.insert('courses', c);
    return 'ok';
  },
});

export const create = mutation({
  args: {
    code: v.string(), name: v.string(), credits: v.number(),
    semester: v.string(), quota: v.number(), schedule: v.string(),
    day: v.string(), time: v.string(), room: v.string(), lecturer: v.string(),
  },
  handler: async (ctx, args) => ctx.db.insert('courses', args),
});