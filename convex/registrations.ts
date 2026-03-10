import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Ambil semua registrasi milik user, sertakan data course
export const listByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const regs = await ctx.db
      .query('registrations')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .collect();
    return Promise.all(regs.map(async r => ({
      ...r,
      course: await ctx.db.get(r.courseId),
    })));
  },
});

// Daftar ke mata kuliah
export const register = mutation({
  args: { userId: v.id('users'), courseId: v.id('courses') },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('registrations')
      .withIndex('by_user_course', q => q.eq('userId', args.userId).eq('courseId', args.courseId))
      .first();
    if (existing) {
      if (existing.status === 'registered') throw new Error('Sudah terdaftar di mata kuliah ini');
      await ctx.db.patch(existing._id, { status: 'registered', registeredAt: Date.now() });
      return { success: true };
    }
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error('Mata kuliah tidak ditemukan');
    const count = await ctx.db
      .query('registrations')
      .withIndex('by_course', q => q.eq('courseId', args.courseId))
      .filter(q => q.eq(q.field('status'), 'registered'))
      .collect();
    if (count.length >= course.quota) throw new Error('Kuota mata kuliah penuh');
    await ctx.db.insert('registrations', {
      userId: args.userId, courseId: args.courseId,
      status: 'registered', registeredAt: Date.now(),
    });
    return { success: true };
  },
});

// Drop satu mata kuliah
export const drop = mutation({
  args: { userId: v.id('users'), courseId: v.id('courses') },
  handler: async (ctx, args) => {
    const reg = await ctx.db
      .query('registrations')
      .withIndex('by_user_course', q => q.eq('userId', args.userId).eq('courseId', args.courseId))
      .first();
    if (!reg || reg.status !== 'registered') throw new Error('Tidak terdaftar di mata kuliah ini');
    await ctx.db.patch(reg._id, { status: 'dropped' });
    return { success: true };
  },
});

// Add/Drop sekaligus — addCourseId dan dropCourseId keduanya benar-benar opsional
// Kirim hanya field yang ada nilainya (jangan kirim null/undefined)
export const addDrop = mutation({
  args: {
    userId:       v.id('users'),
    addCourseId:  v.optional(v.id('courses')),
    dropCourseId: v.optional(v.id('courses')),
  },
  handler: async (ctx, args) => {
    // Drop dulu kalau ada
    if (args.dropCourseId) {
      const reg = await ctx.db
        .query('registrations')
        .withIndex('by_user_course', q =>
          q.eq('userId', args.userId).eq('courseId', args.dropCourseId!))
        .first();
      if (reg) await ctx.db.patch(reg._id, { status: 'dropped' });
    }
    // Tambah kalau ada
    if (args.addCourseId) {
      const existing = await ctx.db
        .query('registrations')
        .withIndex('by_user_course', q =>
          q.eq('userId', args.userId).eq('courseId', args.addCourseId!))
        .first();
      if (existing) {
        if (existing.status === 'registered') throw new Error('Sudah terdaftar di mata kuliah ini');
        await ctx.db.patch(existing._id, { status: 'registered', registeredAt: Date.now() });
      } else {
        await ctx.db.insert('registrations', {
          userId: args.userId, courseId: args.addCourseId!,
          status: 'registered', registeredAt: Date.now(),
        });
      }
    }
    return { success: true };
  },
});