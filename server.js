const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path"); // Added for handling file paths

const app = express();
const PORT = process.env.PORT || 10000; // Render uses 10000 by default

// ----- Security: Helmet -----
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// ----- Security: Rate limiting -----
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Too many applications from this IP. Try again later." },
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { message: "Too many requests." },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply limiters
app.use("/submit", submitLimiter);
app.use("/applications", apiLimiter);

// ----- Middleware -----
app.use(bodyParser.json({ limit: "50kb" }));
// This serves your CSS, images, and client-side JS from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

const filePath = "applications.xlsx";
const ALLOWED_KEYS = new Set([
  "name", "dob", "gender", "email", "phone", "nationality", "bloodGroup",
  "category", "religion", "tenth", "twelfth", "tenthBoard", "twelfthBoard",
  "rank", "examType", "course", "mode", "medium", "address", "street",
  "city", "state", "pincode", "zip", "guardian", "guardianP", "occupatio",
  "guardianEmail", "departme", "year", "timestamp"
]);

// ----- Helper Functions -----
function sanitize(str) {
  if (typeof str !== "string") return "";
  return str.trim().slice(0, 500).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

function sanitizePayload(body) {
  const out = {};
  for (const key of Object.keys(body)) {
    if (!ALLOWED_KEYS.has(key)) continue;
    const v = body[key];
    if (v === null || v === undefined) continue;
    if (typeof v === "string") out[key] = sanitize(v);
    else if (typeof v === "number" && isFinite(v)) out[key] = v;
    else out[key] = sanitize(String(v));
  }
  return out;
}

function ensureExcelFile() {
  if (!fs.existsSync(filePath)) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, filePath);
  }
}

// ----- ROUTES -----

// 1. HOME ROUTE (This fixes your "Cannot GET /" error)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 2. SUBMIT ROUTE
app.post("/submit", (req, res) => {
  ensureExcelFile();
  const raw = req.body && typeof req.body === "object" ? req.body : {};
  const newData = sanitizePayload(raw);
  if (!newData.name || !newData.email || !newData.phone) {
    return res.status(400).json({ message: "Name, email and phone are required." });
  }
  newData.timestamp = new Date().toLocaleString();

  try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets["Sheet1"];
    const data = XLSX.utils.sheet_to_json(sheet);
    data.push(newData);
    const newSheet = XLSX.utils.json_to_sheet(data);
    workbook.Sheets["Sheet1"] = newSheet;
    XLSX.writeFile(workbook, filePath);
    res.json({ message: "Application saved successfully" });
  } catch (err) {
    console.error("Excel Save Error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// 3. APPLICATIONS VIEW ROUTE
app.get("/applications", (req, res) => {
  ensureExcelFile();
  try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets["Sheet1"];
    const data = XLSX.utils.sheet_to_json(sheet);
    res.json(data);
  } catch (err) {
    console.error("Excel Read Error:", err);
    res.status(500).json([]);
  }
});

// ----- START SERVER -----
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});