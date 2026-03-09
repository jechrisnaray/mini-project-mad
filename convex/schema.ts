/**
 * schema.ts — Definisi tabel database Convex
 *
 * Tidak ada perubahan struktural dari versi asli.
 * Komentar ditambahkan untuk kejelasan tiap tabel.
 */

import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  /** Pengumuman yang ditampilkan di dashboard */
  announcements: defineTable({
    title:   v.string(),
    message: v.string(),
    color:   v.string(), // 'yellow' | 'blue' | 'red' | 'green'
  }),

  /** Akun pengguna (mahasiswa & admin) */
  users: defineTable({
    username: v.string(),
    password: v.string(), // NOTE: gunakan hashing di produksi
    name:     v.string(),
    role:     v.union(v.literal('admin'), v.literal('student')),
  }),

  /** Katalog mata kuliah */
  courses: defineTable({
    code:     v.string(),
    name:     v.string(),
    credits:  v.number(),
    semester: v.string(),
    quota:    v.number(),
    schedule: v.string(),
    lecturer: v.string(),
  }),

  /** Registrasi / pengambilan mata kuliah oleh mahasiswa */
  registrations: defineTable({
    userId:       v.id('users'),
    courseId:     v.id('courses'),
    status:       v.union(v.literal('registered'), v.literal('dropped')),
    registeredAt: v.number(),
  })
    .index('by_user',        ['userId'])
    .index('by_course',      ['courseId'])
    .index('by_user_course', ['userId', 'courseId']),

  /** Nilai akademik mahasiswa per mata kuliah */
  grades: defineTable({
    userId:    v.id('users'),
    courseId:  v.id('courses'),
    grade:     v.string(),   // 'A', 'B+', dsb.
    score:     v.number(),   // 0–100
    updatedAt: v.number(),
  })
    .index('by_user',        ['userId'])
    .index('by_course',      ['courseId'])
    .index('by_user_course', ['userId', 'courseId']),

  /** Jadwal kuliah per mahasiswa */
  schedules: defineTable({
    userId:   v.id('users'),
    courseId: v.id('courses'),
    day:      v.string(),
    time:     v.string(),
    room:     v.string(),
  })
    .index('by_user',   ['userId'])
    .index('by_course', ['courseId']),

  /** Evaluasi dosen oleh mahasiswa */
  teacherEvaluations: defineTable({
    userId:    v.id('users'),
    courseId:  v.id('courses'),
    rating:    v.number(),             // 1–5
    comment:   v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_user',   ['userId'])
    .index('by_course', ['courseId']),

  /** Status kegiatan wajib: Ospek, KKN, KKU */
  ospekKkn: defineTable({
    userId:  v.id('users'),
    type:    v.union(v.literal('ospek'), v.literal('kkn'), v.literal('kku')),
    status:  v.union(
      v.literal('completed'),
      v.literal('in_progress'),
      v.literal('not_started')
    ),
    year:    v.string(),
    notes:   v.optional(v.string()),
  })
    .index('by_user',      ['userId'])
    .index('by_user_type', ['userId', 'type']),
});