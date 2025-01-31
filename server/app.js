const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 3000;
const app = express();
const swaggerUi = require("swagger-ui-express");
const { logger } = require("./src/configs/logger");

app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());

// Swagger API Documentation
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

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
