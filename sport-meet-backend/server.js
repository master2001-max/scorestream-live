 
 const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// Import routes
const authRoutes = require("./src/routes/auth");
const houseRoutes = require("./src/routes/houses");
const matchRoutes = require("./src/routes/matches");
const announcementRoutes = require("./src/routes/announcements");
const scoreRoutes = require("./src/routes/scores");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet());

// CORS configuration – place BEFORE rate limiter so preflight (OPTIONS) always gets CORS headers
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
};
app.use(cors(corsOptions));
// Handle CORS preflight for all routes without using wildcard path (Express v5)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', corsOptions.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Rate limiting (after CORS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan("combined"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Make io available to routes
app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/houses", houseRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/scores", scoreRoutes);

// Leaderboard alias endpoint
app.get("/api/leaderboard", require("./src/controllers/housesController").getHouses);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join house-specific rooms
  socket.on("join-house", (houseId) => {
    socket.join(`house-${houseId}`);
    console.log(`User ${socket.id} joined house ${houseId}`);
  });

  // Leave house room
  socket.on("leave-house", (houseId) => {
    socket.leave(`house-${houseId}`);
    console.log(`User ${socket.id} left house ${houseId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use( (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready`);
});
