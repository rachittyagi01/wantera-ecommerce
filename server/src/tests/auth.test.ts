import request from "supertest"
import app from "../app"

describe("Auth", () => {
  const testUser = {
    name: "Test User",
    email: "jesttest@example.com",
    password: "password123",
  }

  it("should sign up a new user successfully", async () => {
    const res = await request(app).post("/api/auth/signup").send(testUser)

    expect(res.status).toBe(201)
    expect(res.body.accessToken).toBeDefined()
    expect(res.body.user.email).toBe(testUser.email)
    expect(res.body.user.password).toBeUndefined() // password must NEVER be in the response
  })

  it("should reject signup with a duplicate email", async () => {
    await request(app).post("/api/auth/signup").send(testUser)
    const res = await request(app).post("/api/auth/signup").send(testUser)

    expect(res.status).toBe(409)
  })

  it("should reject signup with an invalid email format", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ ...testUser, email: "not-an-email" })

    expect(res.status).toBe(400)
  })

  it("should log in successfully with correct credentials", async () => {
    await request(app).post("/api/auth/signup").send(testUser)

    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    })

    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeDefined()
  })

  it("should reject login with wrong password", async () => {
    await request(app).post("/api/auth/signup").send(testUser)

    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "wrongpassword",
    })

    expect(res.status).toBe(401)
  })
})