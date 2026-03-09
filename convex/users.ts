import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const seedUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('users').collect();
    if (existing.length > 0) return 'Data user sudah ada';

    await ctx.db.insert('users', {
      username: 'yeremia',
      password: '12345',
      name: 'Yeremia',
      role: 'student',
    });

    await ctx.db.insert('users', {
      username: 'admin',
      password: 'admin123',
      name: 'Administrator',
      role: 'admin',
    });

    return 'Seed users berhasil';
  },
});

export const login = mutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db.query('users').collect();
    const user = users.find(
      (item) => item.username === args.username && item.password === args.password
    );
    if (!user) throw new Error('Username atau password salah');
    return {
      _id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
    };
  },
});

export const register = mutation({
  args: { name: v.string(), username: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('username'), args.username))
      .first();
    if (existing) throw new Error('Username sudah dipakai');
    const id = await ctx.db.insert('users', {
      name: args.name,
      username: args.username,
      password: args.password,
      role: 'student',
    });
    return { _id: id, name: args.name, username: args.username, role: 'student' };
  },
});

export const listStudents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('role'), 'student'))
      .collect();
  },

});