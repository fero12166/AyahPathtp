
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ===================================
// 1. API GATEWAY HEALTH CHECK
// ===================================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    application: "AyahPath",
    message: "API Gateway is running!"
  });
});

// ===================================
// 2. QURAN API - UMMAHAPI
// ===================================
app.get("/api/quran/surah/:number", async (req, res) => {
  try {
    const number = Number(req.params.number);

    // Validate Surah number
    if (!Number.isInteger(number) || number < 1 || number > 114) {
      return res.status(400).json({
        success: false,
        message: "Surah number must be between 1 and 114"
      });
    }

    // Request Quran data from UmmahAPI
    const response = await fetch(
      `https://ummahapi.com/api/quran/surah/${number}?translation=french`
    );

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: "Failed to fetch Quran data from UmmahAPI",
        status: response.status
      });
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      application: "AyahPath",
      source: "UmmahAPI",
      surahNumber: number,
      data: data
    });

  } catch (error) {
    console.error("UmmahAPI Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching Quran data"
    });
  }
});

// ===================================
// 3. UNKNOWN ROUTES
// ===================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    requestedUrl: req.originalUrl
  });
});

// ===================================
// 4. START SERVER
// ===================================
app.listen(PORT, () => {
  console.log(`AyahPath API running at http://localhost:${PORT}`);
});
app.get("/", (req, res) => {
  res.json({
    success: true,
    application: "AyahPath",
    message: "Welcome to AyahPath API Gateway!"
  });
});