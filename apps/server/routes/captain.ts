import { Elysia, status, t } from "elysia";
import { jwtPlugin } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import { saveCaptainLocation, findNearestCaptains } from "../lib/redis";

export const captain = new Elysia({ prefix: "/captain" })
  .use(jwtPlugin)
  .derive(async ({ jwt, cookie, headers, set }) => {
    const token = cookie.auth?.value || headers.authorization;

    if (!token) {
      set.status = 401;
      throw new Error("Unauthorized");
    }

    try {
      const payload = await jwt.verify(token as string);
      if (!payload || payload.role != "captain")
        throw new Error("Invalid token");
      return { payload };
    } catch {
      set.status = 401;
      throw new Error("Invalid token");
    }
  })
  .post(
    "/cancel",
    async ({ body, payload }) => {
      const { id } = body;

      const trip = await prisma.trip.findUnique({
        where: { id },
      });
      if (!trip) return { message: "Trip not found!" };

      if (
        payload.role === "captain" &&
        trip.captainId === (payload.user as string)
      ) {
        await prisma.trip.update({
          where: { id },
          data: { status: "CANCELLED" },
        });
        // User will get update via polling
      } else {
        return status(401, "Unauthorized");
      }

      return { message: "Trip cancelled successfully!" };
    },
    {
      body: t.Object({
        id: t.String(),
      }),
    }
  )
  .post(
    "/pickup",
    async ({ body, payload }) => {
      // check the trip id and otp of the trip and also the trip has not started also the trip captain is the
      const { id, otp } = body;

      const captain = await prisma.captain.findUnique({
        where: { id: payload.user as string },
      });
      if (!captain) return status(401, "Unauthorized");

      const trip = await prisma.trip.findUnique({
        where: { id },
      });
      if (
        !trip ||
        trip.captainId !== captain.id ||
        trip.status !== "ACCEPTED" ||
        trip.otp !== otp
      ) {
        return { message: "Invalid trip or OTP!" };
      }

      await prisma.trip.update({
        where: { id },
        data: { status: "ON_TRIP" },
      });

      // User will get update via polling
      return { message: "Trip picked up successfully!" };
    },
    {
      body: t.Object({
        id: t.String(),
        otp: t.String(),
      }),
    }
  )
  .post(
    "/complete",
    async ({ body, payload }) => {
      const { id } = body;

      const captain = await prisma.captain.findUnique({
        where: { id: payload.user as string },
      });
      if (!captain) return status(401, "Unauthorized");

      const trip = await prisma.trip.findUnique({
        where: { id },
      });
      if (!trip || trip.captainId !== captain.id || trip.status !== "ON_TRIP") {
        return { message: "Invalid trip!" };
      }

      await prisma.trip.update({
        where: { id },
        data: { status: "COMPLETED" },
      });

      // User will get update via polling
      return { message: "Trip completed successfully!" };
    },
    {
      body: t.Object({
        id: t.String(),
      }),
    }
  )
  .get("/history", async ({ payload }) => {
    const trips = await prisma.trip.findMany({
      where: { captainId: payload.user as string },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    return { trips };
  })
  .post(
    "/location",
    async ({ body, payload }) => {
      const { lat, lng } = body;
      const captainId = payload.user as string;

      // Always save to Redis geospatial index for matching
      // captain pool this to send there realtime location every 3s max.
      await saveCaptainLocation(captainId, lat, lng);
    },
    {
      body: t.Object({
        lat: t.Number(),
        lng: t.Number(),
      }),
    }
  );
