import { query } from './_generated/server';
import { v } from 'convex/values';

// Jadwal diambil dari registrasi aktif + data jadwal di tabel courses
export const listByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const regs = await ctx.db
      .query('registrations')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .filter(q => q.eq(q.field('status'), 'registered'))
      .collect();

    return Promise.all(regs.map(async r => {
      const course = await ctx.db.get(r.courseId);
      return {
        _id: r._id,
        userId: r.userId,
        courseId: r.courseId,
        day: course?.day ?? '',
        time: course?.time ?? '',
        room: course?.room ?? '',
        course,
      };
    }));
  },
});