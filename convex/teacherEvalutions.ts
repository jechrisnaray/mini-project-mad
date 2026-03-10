import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const listByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const evals = await ctx.db
      .query('teacherEvaluations')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .collect();
    return Promise.all(evals.map(async e => ({
      ...e,
      course: await ctx.db.get(e.courseId),
    })));
  },
});

export const create = mutation({
  args: {
    userId:   v.id('users'),
    courseId: v.id('courses'),
    rating:   v.number(),
    comment:  v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Cek apakah sudah pernah evaluasi MK ini
    const existing = await ctx.db
      .query('teacherEvaluations')
      .withIndex('by_user_course', q => q.eq('userId', args.userId).eq('courseId', args.courseId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { rating: args.rating, comment: args.comment, createdAt: Date.now() });
    } else {
      await ctx.db.insert('teacherEvaluations', { ...args, createdAt: Date.now() });
    }
    return { success: true };
  },
});