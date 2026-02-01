import { prisma } from "../db/prisma.js";

// POST /availability
export async function createAvailability(req, res) {
    try {
        const { userId, dayOfWeek, startMin, endMin} = req.body;

        if (
            !userId ||
            dayOfWeek === undefined ||
            startMin === undefined ||
            endMin === undefined
        ) {
            return res.status(500).json({ok: false, error: "userId, dayOfWeek, startMin, and endMin are required"});
        }
        if (dayOfWeek < 0 || dayOfWeek > 6) {
            return res.status(400).json({ ok: false, error: "dayOfWeek must be 0..6" });
        }
        if (startMin < 0 || endMin > 1440 || startMin >= endMin) {
            return res.status(400).json({ ok: false, error: "invalid time range" });
        }

        const block = await prisma.availability.create({
            data: { userId, dayOfWeek, startMin, endMin },
        });
        return res.status(201).json({ ok: true, availability: block });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ok: false, error: "server error"});
    }
}