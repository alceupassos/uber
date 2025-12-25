import { Elysia, status, t } from "elysia";
import { jwtPlugin } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import {
  saveCaptainLocation,
  setTripCaptainLocation,
  findNearestCaptains,
} from "../lib/redis";

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
    },
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
    },
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
    },
  )
  .get("/history", async ({ jwt, headers: { authorization } }) => {
    if (!authorization) return status(401, "Unauthorized");
    let payload: any;
    try {
      payload = await jwt.verify(authorization);
    } catch {
      return status(401, "Unauthorized");
    }

    if (payload.role !== "captain") return status(401, "Unauthorized");

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
      const { lat, lng, tripId } = body;
      const captainId = payload.user as string;

      // Always save to Redis geospatial index for matching
      await saveCaptainLocation(captainId, lat, lng);

      // If captain is on an active trip, cache location for user polling
      if (tripId) {
        await setTripCaptainLocation(tripId, lat, lng);

        // Update captain status to in-drive
        await prisma.captain.update({
          where: { id: captainId },
          data: {
            isOnline: true,
            inDrive: true,
            isPooling: false,
          },
        });
      } else {
        // Captain is pooling for trips - check for nearby requests
        await prisma.captain.update({
          where: { id: captainId },
          data: {
            isOnline: true,
            inDrive: false,
            isPooling: true,
          },
        });

        // Find and match with nearby REQUESTED trips
        const requestedTrips = await prisma.trip.findMany({
          where: {
            status: "REQUESTED",
            captainId: null,
          },
          take: 5, // Check up to 5 pending trips
          orderBy: { createdAt: "asc" },
        });

        // Attempt to match each trip
        for (const trip of requestedTrips) {
          if (trip.originLat && trip.originLng) {
            await findNearestCaptains(
              trip.id,
              Number(trip.originLat),
              Number(trip.originLng),
              5, // 5km radius
              1, // Just find 1 captain (this captain if nearby)
            );
          }
        }
      }

      return { success: true };
    },
    {
      body: t.Object({
        lat: t.Number(),
        lng: t.Number(),
        tripId: t.Optional(t.String()),
      }),
    },
  );
