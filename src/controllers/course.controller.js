import { prisma } from "../db/prisma.js";

// POST course
export async function createCourse(req, res) {
    try {
        const {code, term} = req.body;
        if (!code || !term) {
            return res.status(400).json({
                ok: false,
                error: "code and term are required",
            });
        }

        const course = await prisma.course.create({
            data: {code, term},
        });
        return res.status(201).json({ok: true, course});
    }catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, error: "server error" });
    }
}
