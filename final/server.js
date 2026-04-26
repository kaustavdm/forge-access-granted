const dotenv = require("dotenv");
const path = require("path");
const express = require("express");
const { createTwilioFetch } = require("./lib/twilio-fetch");

dotenv.config();

const lookupRoutes = require("./lookup");
const verifyRoutes = require("./verify");

const requiredEnvVars = [
  "TWILIO_API_KEY_SID",
  "TWILIO_API_KEY_SECRET",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_VERIFY_SERVICE_SID",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(
    `Error: Missing required environment variables: ${missingVars.join(", ")}`,
  );
  process.exit(1);
}

const twilioFetch = createTwilioFetch(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_API_KEY_SID,
  process.env.TWILIO_API_KEY_SECRET,
);

const app = express();

app.set("trust proxy", 1);

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] ${req.method} ${req.path}${Object.keys(req.query).length ? ` - Query: ${JSON.stringify(req.query)}` : ""}`,
  );
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

lookupRoutes.initialize(twilioFetch);
verifyRoutes.initialize(twilioFetch, process.env.TWILIO_VERIFY_SERVICE_SID);

app.use("/api/lookup", lookupRoutes.router);
app.use("/api/verify", verifyRoutes.router);
app.use("/api/passkeys", verifyRoutes.passkeysRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use((req, res, next) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Running: final`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

server.on("error", (err) => {
  console.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
