const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { logger } = require("./src/configs/logger");
const httpLogger = require("./src/middelware/http-logger.midelware");
const db = require("./src/configs/database");

const userRoutes = require('./src/routes/user.routes');

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();


app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);


app.use(express.json());
app.use(httpLogger);

app.use('/api/auth',userRoutes)

//Health Check route;
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    logger.info("Database connection is healthy");
    res
      .status(200)
      .json({ message: "Connected to DB", timestamp: result.rows[0] });
  } catch (err) {
    logger.error(`Database connection error: ${err.message}`);
    res.status(500).json({ error: "Failed to connect to database" });
  }
});
if (process.env.NODE_ENV === "test") {
  const testRouter = express.Router();

  testRouter.get("/test-error", (req, res, next) => {
    const error = new Error("Test error");
    next(error);
  });

  testRouter.get("/test-custom-error", (req, res, next) => {
    const error = new Error("Custom error");
    error.status = 400;
    next(error);
  });

  testRouter.post("/test-json", (req, res) => {
    res.json(req.body);
  });

  app.use("/test", testRouter);
}

// Error Handling Middleware
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// Error Handler - should be last
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res
    .status(err.status || 500)
    .header("Content-Type", "application/json")
    .json({ error: err.message || "Server Error" });
});

// Unhandled Promise Rejection Handling
process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

// Start Server
app.listen(port, (err) => {
  if (err) {
    logger.error(`Error while starting server: ${err.message}`);
    console.error("Error while starting server:", err);
  } else {
    logger.info(`Server is running at http://localhost:${port}`);
    console.log(`Server is running at http://localhost:${port}`);
    console.log(
      `Swagger documentation available at http://localhost:${port}/api-docs`
    );
  }
});

module.exports = app;
