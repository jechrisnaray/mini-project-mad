import { mutation, query } from './_generated/server';

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('announcements').collect();
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('announcements').collect();

    if (existing.length > 0) {
      return 'Data announcements sudah ada';
    }

    await ctx.db.insert('announcements', {
      title: 'Academic',
      message: 'Maksimum waktu kuliah mahasiswa adalah 7 tahun sejak terdaftar.',
      color: 'yellow',
    });

    await ctx.db.insert('announcements', {
      title: 'Info',
      message: 'Periksa kembali jadwal sebelum mengikuti perkuliahan.',
      color: 'blue',
    });

    return 'Seed announcements berhasil';
  },
});