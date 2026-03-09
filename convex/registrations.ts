import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Helper functions (bukan mutation)
async function doRegister(ctx: any, userId: string, courseId: string) {
  const existing = await ctx.db
    .query('registrations')
    .withIndex('by_user_course', (q: any) =>
      q.eq('userId', userId).eq('courseId', courseId)
    )
    .first();
  if (existing) throw new Error('Sudah terdaftar');

  const course = await ctx.db.get(courseId);
  if (!course) throw new Error('Mata kuliah tidak ditemukan');

  const count = await ctx.db
    .query('registrations')
    .withIndex('by_course', (q: any) => q.eq('courseId', courseId))
    .filter((q: any) => q.eq(q.field('status'), 'registered'))
    .collect();
  if (count.length >= course.quota) throw new Error('Kuota penuh');

  await ctx.db.insert('registrations', {
    userId,
    courseId,
    status: 'registered',
    registeredAt: Date.now(),
  });
  return { success: true };
}

async function doDrop(ctx: any, userId: string, courseId: string) {
  const reg = await ctx.db
    .query('registrations')
    .withIndex('by_user_course', (q: any) =>
      q.eq('userId', userId).eq('courseId', courseId)
    )
    .first();
  if (!reg) throw new Error('Tidak terdaftar');
  await ctx.db.patch(reg._id, { status: 'dropped' });
  return { success: true };
}

export const listByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const registrations = await ctx.db
      .query('registrations')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
    return await Promise.all(
      registrations.map(async (reg) => {
        const course = await ctx.db.get(reg.courseId);
        return { ...reg, course };
      })
    );
  },
});

export const register = mutation({
  args: { userId: v.id('users'), courseId: v.id('courses') },
  handler: async (ctx, args) => {
    return await doRegister(ctx, args.userId, args.courseId);
  },
});

export const drop = mutation({
  args: { userId: v.id('users'), courseId: v.id('courses') },
  handler: async (ctx, args) => {
    return await doDrop(ctx, args.userId, args.courseId);
  },
});

export const addDrop = mutation({
  args: {
    userId: v.id('users'),
    addCourseId: v.optional(v.id('courses')),
    dropCourseId: v.optional(v.id('courses')),
  },
  handler: async (ctx, args) => {
    if (args.dropCourseId) {
      await doDrop(ctx, args.userId, args.dropCourseId);
    }
    if (args.addCourseId) {
      await doRegister(ctx, args.userId, args.addCourseId);
    }
    return { success: true };
  },
});