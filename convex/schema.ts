/**
 * schema.ts — Enhanced Convex Database Schema
 *
 * Peningkatan dari versi sebelumnya:
 * ─────────────────────────────────
 * users           + faculty, advisor, phone, semester, avatar, status
 * announcements   + category, priority, publishedAt, expiresAt, authorId
 * courses         + type, building, maxAbsence, syllabus
 * registrations   + (tidak berubah banyak, sudah baik)
 * grades          + gradeType (UTS/UAS/Tugas/Praktikum), inputtedBy, notes
 * teacherEvaluations + categories (array rating per aspek)
 * schedules       + type (online/offline), building (terpisah dari room)
 * semesterCosts   (BARU) — biaya per semester per mahasiswa
 * notifications   (BARU) — push notification history
 */

import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({

  // ── USERS ───────────────────────────────────────────────────────
  users: defineTable({
    username:    v.string(),
    password:    v.string(),   // hashed
    name:        v.string(),
    role:        v.union(v.literal('admin'), v.literal('student')),

    // Student fields
    nim:         v.optional(v.string()),
    prodi:       v.optional(v.string()),
    faculty:     v.optional(v.string()),          // ✨ Fakultas
    angkatan:    v.optional(v.string()),
    semester:    v.optional(v.number()),           // ✨ Semester aktif saat ini (1–14)
    maxSks:      v.optional(v.number()),
    activeUntil: v.optional(v.string()),
    advisor:     v.optional(v.string()),           // ✨ Nama dosen pembimbing
    phone:       v.optional(v.string()),           // ✨ No. HP

    // Account
    status:      v.optional(v.union(            // ✨ Status akun
      v.literal('active'),
      v.literal('inactive'),
      v.literal('alumni'),
    )),
    lastLogin:   v.optional(v.number()),           // ✨ Timestamp login terakhir
  })
    .index('by_username', ['username'])
    .index('by_nim',      ['nim'])
    .index('by_prodi',    ['prodi']),

  // ── ANNOUNCEMENTS ────────────────────────────────────────────────
  announcements: defineTable({
    title:       v.string(),
    message:     v.string(),
    color:       v.string(),

    // ✨ Enhanced fields
    category:    v.optional(v.string()),           // 'Akademik' | 'KRS' | 'Keuangan' | 'Umum'
    priority:    v.optional(v.union(               // Prioritas tampilan
      v.literal('low'),
      v.literal('normal'),
      v.literal('high'),
    )),
    publishedAt: v.optional(v.number()),           // Waktu publish (timestamp)
    expiresAt:   v.optional(v.number()),           // Waktu kadaluarsa
    authorId:    v.optional(v.id('users')),        // Admin yang membuat
    isPinned:    v.optional(v.boolean()),          // Pin di atas
  })
    .index('by_priority',   ['priority'])
    .index('by_publishedAt',['publishedAt']),

  // ── COURSES ─────────────────────────────────────────────────────
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

    // ✨ Enhanced fields
    lecturerId:   v.optional(v.id('users')),       // Relasi ke user admin/dosen
    type:         v.optional(v.union(              // Jenis perkuliahan
      v.literal('teori'),
      v.literal('praktikum'),
      v.literal('seminar'),
    )),
    building:     v.optional(v.string()),          // Gedung (terpisah dari room)
    maxAbsence:   v.optional(v.number()),          // Maks absen (%) sebelum tidak lulus
    syllabus:     v.optional(v.string()),          // URL syllabus PDF
    isActive:     v.optional(v.boolean()),         // Apakah MK aktif semester ini
  })
    .index('by_code',     ['code'])
    .index('by_semester', ['semester'])
    .index('by_lecturer', ['lecturer']),

  // ── REGISTRATIONS ───────────────────────────────────────────────
  registrations: defineTable({
    userId:       v.id('users'),
    courseId:     v.id('courses'),
    status:       v.union(
      v.literal('registered'),
      v.literal('dropped'),
      v.literal('pending'),    // ✨ Menunggu approval admin
    ),
    registeredAt: v.number(),
    droppedAt:    v.optional(v.number()),          // ✨ Waktu drop
    note:         v.optional(v.string()),          // ✨ Catatan drop/add
  })
    .index('by_user',        ['userId'])
    .index('by_course',      ['courseId'])
    .index('by_user_course', ['userId', 'courseId'])
    .index('by_status',      ['status']),

  // ── GRADES ──────────────────────────────────────────────────────
  grades: defineTable({
    userId:    v.id('users'),
    courseId:  v.id('courses'),
    grade:     v.string(),
    score:     v.number(),
    semester:  v.optional(v.string()),
    updatedAt: v.number(),

    // ✨ Enhanced fields
    gradeType:   v.optional(v.union(               // Jenis nilai
      v.literal('UTS'),
      v.literal('UAS'),
      v.literal('tugas'),
      v.literal('praktikum'),
      v.literal('final'),      // nilai akhir gabungan
    )),
    scoreUts:    v.optional(v.number()),            // ✨ Skor UTS mentah
    scoreUas:    v.optional(v.number()),            // ✨ Skor UAS mentah
    scoreTugas:  v.optional(v.number()),            // ✨ Skor tugas/praktikum
    inputtedBy:  v.optional(v.id('users')),         // ✨ Admin/dosen yang input
    notes:       v.optional(v.string()),            // ✨ Catatan khusus dosen
  })
    .index('by_user',        ['userId'])
    .index('by_course',      ['courseId'])
    .index('by_user_course', ['userId', 'courseId'])
    .index('by_semester',    ['semester'])
    .index('by_grade_type',  ['gradeType']),

  // ── TEACHER EVALUATIONS ─────────────────────────────────────────
  teacherEvaluations: defineTable({
    userId:    v.id('users'),
    courseId:  v.id('courses'),
    rating:    v.number(),              // Overall 1–5
    comment:   v.optional(v.string()),
    createdAt: v.number(),

    // ✨ Enhanced: Rating per kategori
    ratingMengajar:      v.optional(v.number()),   // Kemampuan mengajar 1–5
    ratingKomunikasi:    v.optional(v.number()),   // Komunikasi 1–5
    ratingKetepatan:     v.optional(v.number()),   // Ketepatan waktu 1–5
    ratingMateri:        v.optional(v.number()),   // Kualitas materi 1–5
    isAnonymous:         v.optional(v.boolean()),  // ✨ Evaluasi anonim
  })
    .index('by_user',        ['userId'])
    .index('by_course',      ['courseId'])
    .index('by_user_course', ['userId', 'courseId']),

  // ── SCHEDULES ───────────────────────────────────────────────────
  schedules: defineTable({
    userId:   v.id('users'),
    courseId: v.id('courses'),
    day:      v.string(),
    time:     v.string(),
    room:     v.optional(v.string()),

    // ✨ Enhanced
    building:    v.optional(v.string()),            // Gedung terpisah
    type:        v.optional(v.union(               // Mode perkuliahan
      v.literal('offline'),
      v.literal('online'),
      v.literal('hybrid'),
    )),
    meetingLink: v.optional(v.string()),            // Link Zoom/Meet jika online
    note:        v.optional(v.string()),            // Catatan jadwal (mis. diganti)
  })
    .index('by_user',   ['userId'])
    .index('by_course', ['courseId'])
    .index('by_day',    ['day']),

  // ── OSPEK / KKN ─────────────────────────────────────────────────
  ospekKkn: defineTable({
    userId: v.id('users'),
    type:   v.union(v.literal('ospek'), v.literal('kkn'), v.literal('kku')),
    status: v.union(
      v.literal('completed'),
      v.literal('in_progress'),
      v.literal('not_started'),
    ),
    year:            v.string(),
    notes:           v.optional(v.string()),
    completionDate:  v.optional(v.string()),        // ✨ Tanggal selesai
    location:        v.optional(v.string()),        // ✨ Lokasi KKN
    supervisor:      v.optional(v.string()),        // ✨ Nama DPL
    documentUrl:     v.optional(v.string()),        // ✨ URL dokumen/sertifikat
  })
    .index('by_user',      ['userId'])
    .index('by_user_type', ['userId', 'type']),

  // ── SEMESTER COSTS (BARU) ────────────────────────────────────────
  semesterCosts: defineTable({
    userId:       v.id('users'),
    semester:     v.string(),              // '2024/2025 Genap'
    totalAmount:  v.number(),              // Total tagihan (Rp)
    paidAmount:   v.number(),              // Sudah dibayar (Rp)
    dueDate:      v.string(),              // Batas bayar
    status:       v.union(
      v.literal('paid'),
      v.literal('partial'),
      v.literal('unpaid'),
      v.literal('overdue'),
    ),
    invoiceUrl:   v.optional(v.string()),  // URL bukti bayar / invoice
    paidAt:       v.optional(v.number()),  // Timestamp pembayaran lunas
    note:         v.optional(v.string()),
  })
    .index('by_user',     ['userId'])
    .index('by_semester', ['semester'])
    .index('by_status',   ['status']),

  // ── NOTIFICATIONS (BARU) ────────────────────────────────────────
  notifications: defineTable({
    userId:    v.id('users'),
    title:     v.string(),
    body:      v.string(),
    type:      v.union(
      v.literal('announcement'),
      v.literal('grade'),
      v.literal('registration'),
      v.literal('payment'),
      v.literal('schedule'),
      v.literal('system'),
    ),
    isRead:    v.boolean(),
    createdAt: v.number(),
    deepLink:  v.optional(v.string()),    // Route tujuan saat diklik
    refId:     v.optional(v.string()),    // ID referensi (mis. gradeId)
  })
    .index('by_user',      ['userId'])
    .index('by_user_read', ['userId', 'isRead'])
    .index('by_type',      ['type']),

});