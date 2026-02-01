import { prisma } from "../db/prisma.js";
import { totalOverlapMinutes, overlapScore, overlapBreakdownByDay } from "../services/matching.service.js";

// GET /match
export async function getMatches(req, res) {
  try {
    const { userId, courseCode, term } = req.query;

    if (!userId || !courseCode || !term) {
      return res.status(400).json({ ok: false, error: "userId, courseCode, and term are required query params" });
    }

    const course = await prisma.course.findFirst({
        where: { code: courseCode, term },
        select: { id: true, code: true, term: true },
    })

    if (!course) {
        return res.status(404).json({
            ok: false,
            error: "course not found for given courseCode and term",
        });
    }

    const courseId = course.id;

    // 1) Ensure requester is enrolled (less fragile than findUnique compound)
    const requesterEnrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId },
      select: { id: true },
    });

    if (!requesterEnrollment) {
      return res
        .status(403)
        .json({ ok: false, error: "You must be enrolled in this course to match" });
    }

    // 2) Requester availability
    const requesterBlocks = await prisma.availability.findMany({
      where: { userId },
      select: { dayOfWeek: true, startMin: true, endMin: true },
    });

    // 3) Other users enrolled in the course (+ their availability)
    const others = await prisma.user.findMany({
      where: {
        id: { not: userId },
        enrollments: { some: { courseId } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        availability: {
          select: { dayOfWeek: true, startMin: true, endMin: true },
        },
      },
    });

    // 4) Score + rank
    const ranked = others
      .map((other) => {
        const otherBlocks = other.availability ?? [];
        const overlapMins = totalOverlapMinutes(requesterBlocks, otherBlocks);
        const breakdown = overlapBreakdownByDay(requesterBlocks, otherBlocks);
        const score = overlapScore(overlapMins);

        const bestDay = Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0];
        const reason =
            overlapMins === 0
                ? "No overlapping availability yet"
                : bestDay
                    ? `Most overlap on ${bestDay[0]} (${bestDay[1]} mins)`
                    : `Total overlap ${overlapMins} mins`;

        return {
          user: { id: other.id, name: other.name, email: other.email },
          overlapMinutes: overlapMins,
          overlapByDay: breakdown,
          score,
          reason,
        };
      })
      .sort((a, b) => b.score - a.score);

    return res.json({
      ok: true,
      requester: { userId },
      course: { id: course.id, code: course.code, term: course.term },
      results: ranked,
    });
  } catch (err) {
    console.error("Match error:", err);
    return res.status(500).json({ ok: false, error: "server error", detail: err?.message });
  }
}
