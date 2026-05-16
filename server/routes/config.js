import express from "express";
const router = express.Router();
import prisma from "../lib/prisma.js";
import auth from "../middleware/auth.js";

// @route   GET /api/config
// @desc    Get site configuration
// @access  Public
router.get("/", async (req, res) => {
  try {
    let config = await prisma.siteConfig.findUnique({ where: { id: "default" } });
    if (!config) {
      config = await prisma.siteConfig.create({
        data: {
          id: "default",
          restaurantName: "Kokrobite Oasis",
          phone: "+233 00 000 0000",
          whatsapp: "+233 00 000 0000",
          instagram: "kokrobiteoasis",
          facebook: "kokrobiteoasis",
          openingHours: "Mon-Sat: 10AM - 11PM",
          email: "info@kokrobiteoasis.com",
          updatedAt: new Date()
        }
      });
    }
    res.json(config);
  } catch (err) {
    console.error("GET /api/config failed:", err);
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/config
// @desc    Update site configuration
// @access  Private
router.put("/", auth, async (req, res) => {
  try {
    const { id, createdAt, updatedAt: _ignored, ...rest } = req.body || {};
    const now = new Date();
    const config = await prisma.siteConfig.upsert({
      where: { id: "default" },
      update: { ...rest, updatedAt: now },
      create: { id: "default", ...rest, updatedAt: now }
    });
    res.json(config);
  } catch (err) {
    console.error("PUT /api/config failed:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
