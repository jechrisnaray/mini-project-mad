import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  announcements: defineTable({
    title: v.string(),
    message: v.string(),
    color: v.string(),
  }),

  users: defineTable({
    username: v.string(),
    password: v.string(),
    name: v.string(),
  }),
});