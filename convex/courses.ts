import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('courses').collect();
  },
});

export const getById = query({
  args: { id: v.id('courses') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    credits: v.number(),
    semester: v.string(),
    quota: v.number(),
    schedule: v.string(),
    lecturer: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('courses', args);
  },
});