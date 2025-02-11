const request = require("supertest");
const createServer = require("../app");
const { Client } = require("pg");
const bcrypt = require("bcrypt");
const { logger } = require("../src/configs/logger");
const db = require("../src/configs/database");

jest.mock("pg");
jest.mock("bcrypt");
jest.mock("../src/configs/logger.js");
jest.mock("../src/configs/database.js");

const mockClient = new Client();
Client.mockImplementation(() => mockClient);

describe("User Registration API", () => {
  let server;

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
  });

  it("should return 400 for missing required fields", async () => {
    const response = await request(server)
      .post("/api/auth/user-registration")
      .send({ phone: "9876543210", password: "password123" })
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        message: "Validation Error",
      })
    );
  });

  it("should return 400 if user already exists", async () => {
    db.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ phone: "9876543210" }],
    });

    const response = await request(server)
      .post("/api/auth/user-registration")
      .send({
        full_name: "John Doe",
        phone: "9876543210",
        password: "password123",
      })
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        message: "user already exists with provided details",
      })
    );
  });

  it("should return 201 for successful registration", async () => {
    // First mock for existingUser check
    db.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    // Mock bcrypt hash
    bcrypt.hash.mockResolvedValue("hashedPassword");

    // Mock the insert query response
    db.query.mockResolvedValueOnce({
      rowCount: 1, // This is important! Your function checks rowCount
      rows: [{ id: 1 }],
    });

    const response = await request(server)
      .post("/api/auth/user-registration")
      .send({
        full_name: "John Doe",
        phone: "9876543210",
        password: "password123",
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      message: "User registered successfully",
      userId: 1,
    });
  });

  it("should return 500 if registration fails", async () => {
    db.query.mockRejectedValueOnce(new Error("Database error"));

    const response = await request(server)
      .post("/api/auth/user-registration")
      .send({
        full_name: "John Doe",
        phone: "9876543210",
        password: "password123",
      })
      .expect(500);

    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Failed to register user",
        success: false,
      })
    );
  });
});
