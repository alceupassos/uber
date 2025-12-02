import { Elysia, status, t } from "elysia";
import { prisma } from "../lib/prisma";
import { jwt } from "@elysiajs/jwt";

const app = new Elysia<any>()
  .use(
    jwt({
      name: "jwt",
      secret: "uber",
      exp: "7d",
    }),
  )
  .group("/auth", (app) =>
    app
      .post(
        "/captain-signup",
        async ({ body }) => {
          const { name, vehicle, capacity, email, password, confirmPassword } =
            body;
          // Validate password and confirmPassword
          if (password !== confirmPassword) {
            throw new Error("Passwords do not match");
          }
          // Check if email is already in use
          const existingCaptain = await prisma.captain.findUnique({
            where: { email },
          });
          if (existingCaptain) {
            throw new Error("Email already in use");
          }
          // Create captain
          await prisma.captain.create({
            data: {
              name,
              vehicle,
              capacity,
              email,
              password,
            },
          });
          return { message: "Captain created!" };
        },
        {
          body: t.Object({
            name: t.String(),
            vehicle: t.String(),
            capacity: t.Number(),
            email: t.String(),
            password: t.String(),
            confirmPassword: t.String(),
          }),
        },
      )
      .post(
        "/user-signup",
        async ({ body }) => {
          const { name, email, password, confirmPassword } = body;
          // Validate password and confirmPassword
          if (password !== confirmPassword) {
            throw new Error("Passwords do not match");
          }
          // Check if email is already in use
          const existingCaptain = await prisma.captain.findUnique({
            where: { email },
          });
          if (existingCaptain) {
            throw new Error("Email already in use");
          }
          // Create user
          await prisma.user.create({
            data: {
              name,
              email,
              password,
            },
          });
          return { message: "User created!" };
        },
        {
          body: t.Object({
            name: t.String(),
            email: t.String(),
            password: t.String(),
            confirmPassword: t.String(),
          }),
        },
      )
      .post(
        "/login-user",
        async ({ jwt, body }) => {
          const { email, password } = body;
          const user = await prisma.user.findUnique({
            where: { email },
          });
          if (user && user.password == password)
            return jwt.sign({ user: user.id, role: "user" });
          return { message: "Login unsuccessful!" };
        },
        {
          body: t.Object({
            email: t.String(),
            password: t.String(),
          }),
        },
      )
      .post(
        "/login-captain",
        async ({ jwt, body }) => {
          const { email, password } = body;
          const captain = await prisma.captain.findUnique({
            where: { email },
          });
          if (captain && captain.password == password)
            return jwt.sign({ user: captain.id, role: "captain" });
          return { message: "Login unsuccessful!" };
        },
        {
          body: t.Object({
            email: t.String(),
            password: t.String(),
          }),
        },
      ),
  )
  .group("/trip", (app) =>
    app
      .post(
        "/request",
        async ({ jwt, body, headers: { authorization } }) => {
          const { origin, destination, capacity } = body;
          const payload = await jwt.verify(authorization);

          if (!payload) return status(401, "Unauthorized");

          const user = await prisma.user.findUnique({
            where: { id: payload.user },
          });
          if (!user) return status(401, "Unauthorized");
          const otp = Math.floor(1000 + Math.random() * 9000).toString();
          const trip = await prisma.trip.create({
            data: {
              user: { connect: { id: user.id } },
              origin: origin.name,
              originLat: origin.latitude,
              originLng: origin.longitude,
              destination: destination.name,
              destLat: destination.latitude,
              destLng: destination.longitude,
              capacity,
              status: "REQUESTED",
              otp,
            },
          });
          return { message: "Trip created successfully!", id: trip.id, otp };
        },
        {
          body: t.Object({
            origin: t.Object({
              name: t.String(),
              latitude: t.Number(),
              longitude: t.Number(),
            }),
            destination: t.Object({
              name: t.String(),
              latitude: t.Number(),
              longitude: t.Number(),
            }),
            capacity: t.Number(),
          }),
        },
      )
      .post(
        "/cancel",
        async ({ jwt, body, headers: { authorization } }) => {
          const { id } = body;
          const payload = await jwt.verify(authorization);

          if (!payload) return status(401, "Unauthorized");

          const trip = await prisma.trip.findUnique({
            where: { id },
          });
          if (!trip) return { message: "Trip not found!" };

          if (payload.role == "captain" && trip.captainId == payload.user) {
            await prisma.trip.update({
              where: { id },
              data: { status: "CANCELLED" },
            });
          } else if (payload.role == "user" && trip.userId == payload.user) {
            if (trip.status == "ACCEPTED") {
              return { message: "Ride has already started!" };
            }
          } else {
            return status(401, "Unauthorized");
          }

          return { message: "Trip cancelled successfully!" };
        },
        {
          body: t.Object({
            id: t.String(),
          }),
        },
      )
      .post(
        "/pickup",
        async ({ jwt, body, headers: { authorization } }) => {
          // check the trip id and otp of the trip and also the trip has not started also the trip captain is the
          const { id } = body;
          const payload = await jwt.verify(authorization);

          if (!payload) return status(401, "Unauthorized");

          const captain = await prisma.captain.findUnique({
            where: { id: payload.user! },
          });
          if (!captain) return status(401, "Unauthorized");

          // TODO: Implement pickup logic

          return { message: "Trip cancelled successfully!" };
        },
        {
          body: t.Object({
            id: t.String(),
            otp: t.String(),
          }),
        },
      )
      .post(
        "/compelete",
        async ({ jwt, body, headers: { authorization } }) => {
          const { id } = body;
          const payload = await jwt.verify(authorization);

          if (!payload) return status(401, "Unauthorized");

          const captain = await prisma.captain.findUnique({
            where: { id: payload.user! },
          });
          if (!captain) return status(401, "Unauthorized");

          // here have to check the trip ended
        },
        {
          body: t.Object({
            id: t.String(),
          }),
        },
      )
      .post(
        "/match",
        async ({ jwt, body, headers: { authorization } }) => {
          const { id } = body;
          const payload = await jwt.verify(authorization);

          if (!payload) return status(401, "Unauthorized");

          const captain = await prisma.captain.findUnique({
            where: { id: payload.user! },
          });
          if (!captain) return status(401, "Unauthorized");

          const trip = await prisma.trip.findUnique({
            where: { id },
          });
          if (!trip) return { message: "Trip not found!" };

          if (payload.role == "captain") {
            await prisma.trip.update({
              where: { id },
              data: {
                status: "ACCEPTED",
                captain: { connect: { id: captain.id } },
              },
            });
          } else {
            return status(401, "Unauthorized");
          }

          return { message: "Trip matched successfully!", tripid: trip.id };
        },
        {
          body: t.Object({
            id: t.String(),
          }),
        },
      ),
  )
  .listen(3000);

console.log(
  `🦊 uber backend Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
