import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const listByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('ospekKkn')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
  },
});

export const upsert = mutation({
  args: {
    userId: v.id('users'),
    type: v.union(v.literal('ospek'), v.literal('kkn'), v.literal('kku')),
    status: v.union(v.literal('completed'), v.literal('in_progress'), v.literal('not_started')),
    year: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('ospekKkn')
      .withIndex('by_user_type', (q) =>
        q.eq('userId', args.userId).eq('type', args.type)
      )
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        year: args.year,
        notes: args.notes,
      });
    } else {
      await ctx.db.insert('ospekKkn', args);
    }
    return { success: true };
  },
});