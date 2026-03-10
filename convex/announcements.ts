import { mutation, query } from './_generated/server';

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query('announcements').collect(),
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('announcements').first();
    if (existing) return 'sudah ada';
    await ctx.db.insert('announcements', {
      title: 'Batas Studi',
      message: 'Maksimum masa studi mahasiswa adalah 7 tahun sejak terdaftar.',
      color: 'yellow',
    });
    await ctx.db.insert('announcements', {
      title: 'Jadwal UAS',
      message: 'Ujian Akhir Semester dimulai 15 Januari 2025. Cek jadwal di portal akademik.',
      color: 'blue',
    });
    await ctx.db.insert('announcements', {
      title: 'Pembayaran SPP',
      message: 'Batas pembayaran SPP semester genap: 31 Januari 2025.',
      color: 'red',
    });
    return 'ok';
  },
});