import Elysia, { t } from "elysia";
import { prisma } from "../lib/prisma";

export const negotiationRoutes = new Elysia({ prefix: "/negotiation" })
    // Create a new price proposal from user
    .post(
        "/propose",
        async ({ body }) => {
            const { tripId, amount, userId } = body;

            // Update trip with user's proposed price
            const trip = await prisma.trip.update({
                where: { id: tripId },
                data: {
                    userProposedPrice: amount,
                    isNegotiationEnabled: true,
                },
            });

            // Notify nearby captains via WebSocket (handled separately)
            // This would be emitted via the WebSocket server

            return {
                success: true,
                tripId: trip.id,
                proposedPrice: amount,
            };
        },
        {
            body: t.Object({
                tripId: t.String(),
                amount: t.Number(),
                userId: t.String(),
            }),
        }
    )

    // Captain makes an offer/counter-offer
    .post(
        "/offer",
        async ({ body }) => {
            const { tripId, captainId, amount, parentOfferId } = body;

            // Create offer with 5-minute expiration
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

            const offer = await prisma.priceOffer.create({
                data: {
                    tripId,
                    captainId,
                    amount,
                    proposedBy: "captain",
                    parentOfferId: parentOfferId || null,
                    expiresAt,
                },
                include: {
                    captain: {
                        select: {
                            id: true,
                            name: true,
                            rating: true,
                            vehicle: true,
                        },
                    },
                },
            });

            return {
                success: true,
                offer: {
                    id: offer.id,
                    amount: offer.amount,
                    captainId: offer.captainId,
                    captainName: offer.captain.name,
                    captainRating: offer.captain.rating,
                    vehicle: offer.captain.vehicle,
                    expiresAt: offer.expiresAt,
                    status: offer.status,
                },
            };
        },
        {
            body: t.Object({
                tripId: t.String(),
                captainId: t.String(),
                amount: t.Number(),
                parentOfferId: t.Optional(t.String()),
            }),
        }
    )

    // User accepts a captain's offer
    .post(
        "/accept",
        async ({ body }) => {
            const { offerId, userId } = body;

            // Update the offer status
            const offer = await prisma.priceOffer.update({
                where: { id: offerId },
                data: { status: "ACCEPTED" },
                include: {
                    trip: true,
                    captain: true,
                },
            });

            // Update the trip with accepted offer and assign captain
            await prisma.trip.update({
                where: { id: offer.tripId },
                data: {
                    acceptedOfferId: offerId,
                    pricing: offer.amount,
                    captainId: offer.captainId,
                    status: "ACCEPTED",
                },
            });

            // Reject all other pending offers for this trip
            await prisma.priceOffer.updateMany({
                where: {
                    tripId: offer.tripId,
                    id: { not: offerId },
                    status: "PENDING",
                },
                data: { status: "REJECTED" },
            });

            return {
                success: true,
                tripId: offer.tripId,
                captainId: offer.captainId,
                finalPrice: offer.amount,
            };
        },
        {
            body: t.Object({
                offerId: t.String(),
                userId: t.String(),
            }),
        }
    )

    // User rejects a captain's offer
    .post(
        "/reject",
        async ({ body }) => {
            const { offerId } = body;

            await prisma.priceOffer.update({
                where: { id: offerId },
                data: { status: "REJECTED" },
            });

            return { success: true };
        },
        {
            body: t.Object({
                offerId: t.String(),
            }),
        }
    )

    // User makes a counter-offer
    .post(
        "/counter",
        async ({ body }) => {
            const { tripId, offerId, amount, userId } = body;

            // Update the original offer as countered
            await prisma.priceOffer.update({
                where: { id: offerId },
                data: { status: "COUNTERED" },
            });

            // Update trip with new user proposed price
            await prisma.trip.update({
                where: { id: tripId },
                data: { userProposedPrice: amount },
            });

            return {
                success: true,
                newProposedPrice: amount,
            };
        },
        {
            body: t.Object({
                tripId: t.String(),
                offerId: t.String(),
                amount: t.Number(),
                userId: t.String(),
            }),
        }
    )

    // Get all active offers for a trip
    .get(
        "/offers/:tripId",
        async ({ params }) => {
            const { tripId } = params;

            // Expire old offers first
            await prisma.priceOffer.updateMany({
                where: {
                    tripId,
                    status: "PENDING",
                    expiresAt: { lt: new Date() },
                },
                data: { status: "EXPIRED" },
            });

            // Get all pending offers
            const offers = await prisma.priceOffer.findMany({
                where: {
                    tripId,
                    status: "PENDING",
                },
                include: {
                    captain: {
                        select: {
                            id: true,
                            name: true,
                            rating: true,
                            vehicle: true,
                            totalTrips: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            });

            return {
                offers: offers.map((offer) => ({
                    id: offer.id,
                    amount: offer.amount,
                    captainId: offer.captainId,
                    captainName: offer.captain.name,
                    captainRating: offer.captain.rating,
                    captainVehicle: offer.captain.vehicle,
                    captainTrips: offer.captain.totalTrips,
                    expiresAt: offer.expiresAt,
                    createdAt: offer.createdAt,
                })),
            };
        },
        {
            params: t.Object({
                tripId: t.String(),
            }),
        }
    )

    // Get trips available for negotiation (for captain app)
    .get(
        "/available/:captainId",
        async ({ params }) => {
            const { captainId } = params;

            // Get captain's location
            const captain = await prisma.captain.findUnique({
                where: { id: captainId },
            });

            if (!captain || !captain.currentLat || !captain.currentLng) {
                return { trips: [] };
            }

            // Get trips with negotiation enabled
            const trips = await prisma.trip.findMany({
                where: {
                    status: "REQUESTED",
                    isNegotiationEnabled: true,
                },
                include: {
                    user: {
                        select: {
                            name: true,
                        },
                    },
                    priceOffers: {
                        where: { captainId },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 20,
            });

            return {
                trips: trips.map((trip) => ({
                    id: trip.id,
                    origin: trip.origin,
                    originLat: trip.originLat,
                    originLng: trip.originLng,
                    destination: trip.destination,
                    destLat: trip.destLat,
                    destLng: trip.destLng,
                    userProposedPrice: trip.userProposedPrice,
                    userName: trip.user.name,
                    hasOffered: trip.priceOffers.length > 0,
                    myOffer: trip.priceOffers[0]?.amount || null,
                    createdAt: trip.createdAt,
                })),
            };
        },
        {
            params: t.Object({
                captainId: t.String(),
            }),
        }
    );
