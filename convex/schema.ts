import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  announcements: defineTable({
    title:   v.string(),
    message: v.string(),
    color:   v.string(),
  }),

  users: defineTable({
    username:    v.string(),
    password:    v.string(),
    name:        v.string(),
    role:        v.union(v.literal('admin'), v.literal('student')),
    nim:         v.optional(v.string()),
    prodi:       v.optional(v.string()),
    angkatan:    v.optional(v.string()),
    maxSks:      v.optional(v.number()),
    activeUntil: v.optional(v.string()),
  }).index('by_username', ['username']),

  courses: defineTable({
    code:     v.string(),
    name:     v.string(),
    credits:  v.number(),
    semester: v.string(),
    quota:    v.number(),
    schedule: v.string(),
    day:      v.optional(v.string()),
    time:     v.optional(v.string()),
    room:     v.optional(v.string()),
    lecturer: v.string(),
  }),

  registrations: defineTable({
    userId:       v.id('users'),
    courseId:     v.id('courses'),
    status:       v.union(v.literal('registered'), v.literal('dropped')),
    registeredAt: v.number(),
  })
    .index('by_user',        ['userId'])
    .index('by_course',      ['courseId'])
    .index('by_user_course', ['userId', 'courseId']),

  grades: defineTable({
    userId:    v.id('users'),
    courseId:  v.id('courses'),
    grade:     v.string(),
    score:     v.number(),
    semester:  v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index('by_user',        ['userId'])
    .index('by_course',      ['courseId'])
    .index('by_user_course', ['userId', 'courseId']),

  teacherEvaluations: defineTable({
    userId:    v.id('users'),
    courseId:  v.id('courses'),
    rating:    v.number(),
    comment:   v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_user',        ['userId'])
    .index('by_course',      ['courseId'])
    .index('by_user_course', ['userId', 'courseId']),

  ospekKkn: defineTable({
    userId: v.id('users'),
    type:   v.union(v.literal('ospek'), v.literal('kkn'), v.literal('kku')),
    status: v.union(v.literal('completed'), v.literal('in_progress'), v.literal('not_started')),
    year:   v.string(),
    notes:  v.optional(v.string()),
  })
    .index('by_user',      ['userId'])
    .index('by_user_type', ['userId', 'type']),
});