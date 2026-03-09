import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const listByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const grades = await ctx.db
      .query('grades')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
    return await Promise.all(
      grades.map(async (g) => {
        const course = await ctx.db.get(g.courseId);
        return { ...g, course };
      })
    );
  },
});

export const upsert = mutation({
  args: {
    userId: v.id('users'),
    courseId: v.id('courses'),
    grade: v.string(),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('grades')
      .withIndex('by_user_course', (q) =>
        q.eq('userId', args.userId).eq('courseId', args.courseId)
      )
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        grade: args.grade,
        score: args.score,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert('grades', {
        ...args,
        updatedAt: Date.now(),
      });
    }
    return { success: true };
  },
});