import { mutation } from './_generated/server';

export const seedCourses = mutation({
  args: {},
  handler: async (ctx) => {
    // Cek apakah sudah ada data
    const existing = await ctx.db.query('courses').first();
    if (existing) {
      return 'Data courses sudah ada';
    }

    const courses = [
      {
        code: 'IF101',
        name: 'Pemrograman Dasar',
        credits: 3,
        semester: '2024/2025 Ganjil',
        quota: 30,
        schedule: 'Senin 08:00-10:00',
        lecturer: 'Dr. Budi Santoso',
      },
      {
        code: 'IF102',
        name: 'Struktur Data',
        credits: 3,
        semester: '2024/2025 Ganjil',
        quota: 25,
        schedule: 'Selasa 10:00-12:00',
        lecturer: 'Dr. Ani Wijaya',
      },
      {
        code: 'IF103',
        name: 'Basis Data',
        credits: 3,
        semester: '2024/2025 Ganjil',
        quota: 25,
        schedule: 'Rabu 13:00-15:00',
        lecturer: 'Dr. Candra Kusuma',
      },
      {
        code: 'IF104',
        name: 'Pemrograman Web',
        credits: 3,
        semester: '2024/2025 Ganjil',
        quota: 30,
        schedule: 'Kamis 09:00-11:00',
        lecturer: 'Dr. Dewi Lestari',
      },
    ];

    for (const course of courses) {
      await ctx.db.insert('courses', course);
    }

    return 'Seed courses berhasil';
  },
});