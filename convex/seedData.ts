import { mutation } from './_generated/server';

export const seedAllData = mutation({
  args: {},
  handler: async (ctx) => {
    // Cari user Yeremia
    const yeremia = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('username'), 'yeremia'))
      .first();
    if (!yeremia) {
      return 'User yeremia tidak ditemukan. Jalankan seedUsers dulu.';
    }

    // Ambil semua courses
    const courses = await ctx.db.query('courses').collect();
    if (courses.length === 0) {
      return 'Tidak ada courses. Jalankan seedCourses dulu.';
    }

    // Hapus semua data lama untuk user ini
    const tables = ['registrations', 'grades', 'schedules', 'teacherEvaluations', 'ospekKkn'];
    for (const table of tables) {
      const oldData = await ctx.db
        .query(table as any)
        .withIndex('by_user', (q: any) => q.eq('userId', yeremia._id))
        .collect();
      for (const doc of oldData) {
        await ctx.db.delete(doc._id);
      }
    }

    // Pilih 3 courses pertama
    const selectedCourses = courses.slice(0, 3);

    // 1. Registrasi
    for (const course of selectedCourses) {
      await ctx.db.insert('registrations', {
        userId: yeremia._id,
        courseId: course._id,
        status: 'registered',
        registeredAt: Date.now(),
      });
    }

    // 2. Nilai untuk 2 courses pertama
    const gradesCourses = selectedCourses.slice(0, 2);
    for (let i = 0; i < gradesCourses.length; i++) {
      await ctx.db.insert('grades', {
        userId: yeremia._id,
        courseId: gradesCourses[i]._id,
        grade: i === 0 ? 'A' : 'B+',
        score: i === 0 ? 90 : 85,
        updatedAt: Date.now(),
      });
    }

    // 3. Jadwal
    const days = ['Senin', 'Selasa', 'Rabu'];
    const times = ['08:00-10:00', '10:00-12:00', '13:00-15:00'];
    for (let i = 0; i < selectedCourses.length; i++) {
      await ctx.db.insert('schedules', {
        userId: yeremia._id,
        courseId: selectedCourses[i]._id,
        day: days[i],
        time: times[i],
        room: `Ruang ${String.fromCharCode(65 + i)}.${100 + i}`,
      });
    }

    // 4. Evaluasi dosen
    for (let i = 0; i < gradesCourses.length; i++) {
      await ctx.db.insert('teacherEvaluations', {
        userId: yeremia._id,
        courseId: gradesCourses[i]._id,
        rating: 4 + i,
        comment: i === 0 ? 'Dosen sangat baik' : 'Materi menarik',
        createdAt: Date.now(),
      });
    }

    // 5. Ospek & KKN
    await ctx.db.insert('ospekKkn', {
      userId: yeremia._id,
      type: 'ospek',
      status: 'completed',
      year: '2024',
      notes: 'Ospek sudah dilaksanakan',
    });
    await ctx.db.insert('ospekKkn', {
      userId: yeremia._id,
      type: 'kkn',
      status: 'in_progress',
      year: '2025',
      notes: 'KKN sedang berlangsung',
    });

    return 'Seed data untuk yeremia berhasil (data lama dihapus)';
  },
});