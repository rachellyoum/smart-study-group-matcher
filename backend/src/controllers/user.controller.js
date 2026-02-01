import { prisma } from "../db/prisma.js";

// POST /users
export async function createUser(req, res) {
    try {
        const {email, name} = req.body;

        // basic validation (we'll make this nicer later)
        if (!email || !name) {
            return res.status(400).json({
                ok: false,
                error: "email and name are required",
            });
        }

        const user = await prisma.user.create({
            data: {email, name},
        });
        return res.status(201).json({ok: true, user});
    } catch (err) {
        // handle unique constraint (email must be unique)
        if (err.code === "P2002") {
            return res.status(409).json({
                ok: false,
                error: "email already exists",
            });
        }
        console.error(err);
        return res.status(500).json({ok: false, error: "server error"});
    }
}

// GET /users
export async function listUsers(req, res) {
    try {
        const users = await prisma.user.findMany({
            orderBy: {createdAt: "desc"},
        });

        return res.json({ok: true, users});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ok: false, error: "server error"});
    }
}