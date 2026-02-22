const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const XLSX = require("xlsx");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ----- Security: Helmet (headers) -----
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
app.use("/submit", submitLimiter);

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { message: "Too many requests." },
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/applications", apiLimiter);

// ----- Body parser (limit payload size) -----
app.use(bodyParser.json({ limit: "50kb" }));
app.use(express.static("public"));

const filePath = "applications.xlsx";

const MAX_STR = 500;
const ALLOWED_KEYS = new Set([
  "name", "dob", "gender", "email", "phone", "nationality", "bloodGroup",
  "category", "religion", "tenth", "twelfth", "tenthBoard", "twelfthBoard",
  "rank", "examType", "course", "mode", "medium", "address", "street",
  "city", "state", "pincode", "zip", "guardian", "guardianP", "occupatio",
  "guardianEmail", "departme", "year", "timestamp"
]);

function sanitize(str) {
  if (typeof str !== "string") return "";
  return str.trim().slice(0, MAX_STR).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
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
    console.error(err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

app.get("/applications", (req, res) => {
  ensureExcelFile();
  try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets["Sheet1"];
    const data = XLSX.utils.sheet_to_json(sheet);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
});
