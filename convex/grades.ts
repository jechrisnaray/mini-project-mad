import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Ambil nilai milik user, sertakan data course
export const listByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const grades = await ctx.db
      .query('grades')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .collect();
    return Promise.all(grades.map(async g => ({
      ...g,
      course: await ctx.db.get(g.courseId),
    })));
  },
});

// Ambil semua nilai untuk satu MK (untuk admin)
export const listByCourse = query({
  args: { courseId: v.id('courses') },
  handler: async (ctx, args) => {
    return ctx.db
      .query('grades')
      .withIndex('by_course', q => q.eq('courseId', args.courseId))
      .collect();
  },
});

// Insert atau update nilai (upsert) — score opsional, default 0
export const upsert = mutation({
  args: {
    userId:   v.id('users'),
    courseId: v.id('courses'),
    grade:    v.string(),
    score:    v.optional(v.number()),  // opsional, default 0
    semester: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('grades')
      .withIndex('by_user_course', q => q.eq('userId', args.userId).eq('courseId', args.courseId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { grade: args.grade, score: args.score ?? 0, updatedAt: Date.now(), semester: args.semester });
    } else {
      await ctx.db.insert('grades', { ...args, score: args.score ?? 0, updatedAt: Date.now() });
    }
    return { success: true };
  },
});