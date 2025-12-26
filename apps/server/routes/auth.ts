import { Elysia, status, t } from "elysia";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import { jwtPlugin } from "../lib/jwt";
import { sendEmail } from "../lib/resend";
import jwt from "jsonwebtoken";
import { Captain, User } from "../generated/prisma/client";
import { UserModel } from "../generated/prisma/models";
import { Role } from "../lib/types";

export const auth = new Elysia({ prefix: "/auth" })
  .use(jwtPlugin)
  .post(
    "/signup",
    async ({ body }) => {
      const {
        name,
        email,
        password,
        confirmPassword,
        role,
        vehicle,
        capacity,
      } = body;

      // Validate password and confirmPassword
      if (password !== confirmPassword) {
        return status(400, { message: "Passwords do not match" });
      }
      let existingUser;
      // Check if email is already in use
      if (role === "user") {
        existingUser = await prisma.user.findUnique({
          where: { email },
        });
      } else {
        existingUser = await prisma.captain.findUnique({
          where: { email },
        });
      }
      if (existingUser) {
        return status(409, { message: "Email already in use" });
      }
      // Create user
      if (role === "user") {
        await prisma.user.create({
          data: {
            name,
            email,
            password: await bcrypt.hash(password, 10),
          },
        });
      } else {
        if (!capacity || !vehicle) return;
        await prisma.captain.create({
          data: {
            name,
            vehicle,
            capacity,
            email,
            password: await bcrypt.hash(password, 10),
          },
        });
      }
      return { message: "User created!" };
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String({ format: "email" }),
        vehicle: t.Optional(t.String()),
        capacity: t.Optional(t.Number()),
        password: t.String(),
        confirmPassword: t.String(),
        role: Role,
      }),
    }
  )
  .post(
    "/signin",
    async ({ jwt, body, cookie }) => {
      const { email, password, role } = body;
      const table: any = role === "user" ? prisma.user : prisma.captain;

      const user = await table.findUnique({
        where: { email },
      });
      if (user && (await bcrypt.compare(password, user.password))) {
        const token = await jwt.sign({ user: user.id, role });
        console.log("token generated", token);
        cookie.auth?.set({
          value: token,
          httpOnly: true,
          sameSite: "lax",
          secure: false,
          path: "/",
        });
        return status(200, { token, message: "Login successful!" });
      }
      return status(401, { message: "Login unsuccessful!" });
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
        role: Role,
      }),
    }
  )
  .get("/signout", ({ cookie }) => {
    cookie.auth?.remove();
    return { success: true };
  })
  .post(
    "/forgot",
    async ({ body }) => {
      const { email, role } = body;
      const table: any = role === "user" ? prisma.user : prisma.captain;

      const user = await table.findUnique({
        where: { email },
      });
      if (!user) {
        return status(404, { message: "User not found" });
      }
      const token = jwt.sign({ email, time: Date.now() }, Bun.env.JWT_SECRET!);
      await sendEmail({
        to: email,
        subject: "Reset your password",
        html: `<htmL><body><h1>Reset your password</h1><p>Click the link below to reset your password:</p><a href="http://localhost:3000/auth/reset?token=${token}">Reset password</a><p>The link is active for 5 mins only.</p></htmL></body>`,
      });
      return { message: "Password reset email sent!" };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        role: Role,
      }),
    }
  )
  .post(
    "/reset",
    async ({ query, body }) => {
      const { token } = query;
      const { password, role } = body;

      const payload: any = jwt.verify(token, Bun.env.JWT_SECRET!);
      console.log(payload);
      if (!payload) return status(400, { message: "Invalid token" });
      if (payload.time < Date.now() - 5 * 60 * 1000)
        return status(400, { message: "Token expired" });
      try {
        const table: any = role === "user" ? prisma.user : prisma.captain;

        await table.update({
          where: { email: payload.email },
          data: { password: await bcrypt.hash(password, 10) },
        });
      } catch (err) {
        return status(400, { message: "Unkown Error" });
      }
      return status(200, { message: "Password updated!" });
    },
    {
      body: t.Object({
        password: t.String(),
        role: Role,
      }),
    }
  );
