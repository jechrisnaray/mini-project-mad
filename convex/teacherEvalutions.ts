import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const listByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('teacherEvaluations')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.id('users'),
    courseId: v.id('courses'),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('teacherEvaluations', {
      ...args,
      createdAt: Date.now(),
    });
    return { success: true };
  },
});