import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const listByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const schedules = await ctx.db
      .query('schedules')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
    return await Promise.all(
      schedules.map(async (s) => {
        const course = await ctx.db.get(s.courseId);
        return { ...s, course };
      })
    );
  },
});

export const create = mutation({
  args: {
    userId: v.id('users'),
    courseId: v.id('courses'),
    day: v.string(),
    time: v.string(),
    room: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('schedules', args);
    return { success: true };
  },
});