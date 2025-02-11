const request = require("supertest");
const express = require("express");
const createServer = require("../app");
const { Client } = require("pg");
const { logger } = require("../src/configs/logger");

// Mock pg module
jest.mock("pg", () => {
  const mClient = {
    connect: jest.fn().mockResolvedValue(),
    query: jest.fn(),
    end: jest.fn().mockResolvedValue(),
  };
  return { Client: jest.fn(() => mClient) };
});

// Mock logger
jest.mock("../src/configs/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Set test environment
process.env.NODE_ENV = "test";

describe("Express App Tests", () => {
  let server;
  const mockClient = new Client();

  beforeAll(async () => {
    app = createServer();
    server = app.listen(8080);
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    }

    // Close the mock database connection
    if (mockClient) {
      await mockClient.end();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.query.mockImplementation(() =>
      Promise.resolve({ rows: [{ now: new Date().toISOString() }] })
    );
  });

  describe("Health Check Route", () => {
    it("should return 200 when database is connected", async () => {
      mockClient.query.mockResolvedValueOnce({
        rows: [{ now: new Date().toISOString() }],
      });

      const response = await request(server)
        .get("/")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("message", "Connected to DB");
      expect(response.body).toHaveProperty("timestamp");
    });

    it("should return 500 when database connection fails", async () => {
      mockClient.query.mockRejectedValueOnce(new Error("Connection failed"));

      const response = await request(server)
        .get("/")
        .expect("Content-Type", /json/)
        .expect(500);

      expect(response.body).toHaveProperty(
        "error",
        "Failed to connect to database"
      );
    });
  });

  describe("CORS Configuration", () => {
    it("should have CORS enabled with correct options", async () => {
      const response = await request(server).options("/").expect(204);

      expect(response.headers["access-control-allow-origin"]).toBe("*");
      expect(response.headers["access-control-allow-credentials"]).toBe("true");
      expect(response.headers["access-control-allow-methods"]).toContain("GET");
    });
  });

  describe("Error Handling", () => {
    it("should handle errors with error middleware", async () => {
      const response = await request(server)
        .get("/test/test-error")
        .expect("Content-Type", /json/)
        .expect(500);

      expect(response.body).toEqual({ error: "Test error" });
    });

    it("should handle custom error status codes", async () => {
      const response = await request(server)
        .get("/test/test-custom-error")
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toEqual({ error: "Custom error" });
    });
  });

  describe("Express JSON Middleware", () => {
    it("should parse JSON bodies", async () => {
      const testData = { test: "data" };
      const response = await request(server)
        .post("/test/test-json")
        .send(testData)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toEqual(testData);
    });
  });
});
