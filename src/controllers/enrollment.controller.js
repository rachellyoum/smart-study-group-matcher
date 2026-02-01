import { prisma } from "../db/prisma.js";

// POST enrollment
export async function createEnrollment(req, res) {
    try {
        const {userId, courseId} = req.body;

        if (!userId || !courseId) {
            return res.status(400).json({ok: false, error: "userId and courseId are required"});
        }

        const enrollment = await prisma.enrollment.create({
            data: {userId, courseId},
        });
        return res.status(201).json({ok: true, enrollment});
    } catch (err) {
        if (err.code === "P2002") {
            return res.status(409).json({ ok: false, error: "user already enrolled in this course" });
        }
        console.error(err);
        return res.status(500).json({ok: false, error: "server error"});
    }
}