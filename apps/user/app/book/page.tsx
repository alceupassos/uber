"use client";

import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import api from "@repo/eden";
import { useMutation } from "@tanstack/react-query";
import { Loader2, LocationEdit, MapPin, Navigation } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import UserInfo from "@/components/user";
import { LocationDialog } from "@/components/location-picker";
import { Router } from "next/router";

const Map = dynamic(() => import("@/components/map"), { ssr: true });

export default function Book() {
  const [select, setSelect] = useState<number>(1);
  const [open, setOpen] = useState(false);
  const [choose, setChoose] = useState(true); // set origin
  const [origin, setOrigin] = useState<any | null>(null);
  const [destination, setDestination] = useState<any | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    window.navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          name: "Your Location",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setOrigin(location);
        console.log("User location set:", location);
      },
      (err) => {
        console.error("Geolocation error:", err.message);
        toast.error(
          "Unable to get your location. Please enable location permissions."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const { mutate: requestTrip, isPending } = useMutation({
    mutationFn: async () => {
      console.log(origin, destination);
      const res = await api.user.request.post({
        origin,
        destination,
        capacity: select,
      });
      if (res.status === 200) {
        toast.success("Trip Requested");
      } else {
        toast.error("Invalid request");
      }
    },
  });
  return (
    <Card className="max-w-xl mx-auto mt-4">
      <CardHeader className="text-xl font-bold">Plan your ride</CardHeader>
      <CardContent>
        <div>
          <UserInfo />
          {origin && origin?.longitude}
        </div>

        <div className="divide-y-2 border-2  rounded-lg shadow">
          <div className="flex gap-2 items-center justify-center px-2">
            <MapPin />
            <input
              type="text"
              placeholder="From Where?"
              value={origin?.name}
              className="outline-none px-2 py-1 w-full text-ellipsis"
            />
            <Button
              variant={"ghost"}
              onClick={() => {
                setOpen(true);
                setChoose(true);
              }}>
              <LocationEdit />
            </Button>
          </div>
          <div className="flex gap-2 items-center justify-center px-2">
            <Navigation />
            <input
              type="text"
              placeholder="Where to?"
              value={destination?.name}
              className="outline-none px-2 py-1 w-full text-ellipsis"
            />
            <Button
              variant={"ghost"}
              onClick={() => {
                setOpen(true);
                setChoose(false);
              }}>
              <LocationEdit />
            </Button>
          </div>
        </div>

        <LocationDialog
          origin={origin}
          open={open}
          onClose={() => setOpen(false)}
          setOrigin={setOrigin}
          setDestination={setDestination}
          choose={choose}
        />
        {origin && destination && (
          <div className="mt-8 border rounded-lg overflow-hidden">
            <Map
              from={[origin.latitude, origin.longitude]}
              to={[destination.latitude, destination.longitude]}
            />
          </div>
        )}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-3">Choose a Ride</h3>
          <div className="space-y-2">
            <VehicleSelect
              capacity={1}
              src="https://img.icons8.com/ios-filled/100/motorcycle.png"
              name="Bike"
              select={select}
              setSelect={setSelect}
            />
            <VehicleSelect
              capacity={2}
              src="https://img.icons8.com/ios-filled/100/fiat-500.png
"
              name="Auto"
              select={select}
              setSelect={setSelect}
            />
            <VehicleSelect
              capacity={3}
              src="https://img.icons8.com/ios-filled/100/hatchback.png"
              name="Hatchback"
              select={select}
              setSelect={setSelect}
            />
            <VehicleSelect
              capacity={4}
              src="https://img.icons8.com/ios-filled/100/sedan.png"
              name="Sedan"
              select={select}
              setSelect={setSelect}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button disabled={isPending} onClick={() => requestTrip()}>
          {isPending && <Loader2 className="animate-spin" />}
          Find Drivers
        </Button>
      </CardFooter>
    </Card>
  );
}

const VehicleSelect = ({
  src,
  name,
  price,
  select,
  setSelect,
  capacity,
}: any) => {
  return (
    <div
      className={`border p-3 rounded-md shadow flex transition cursor-pointer gap-3 ${select == capacity && "ring-3 ring-primary/50 bg-accent"}`}
      onClick={() => setSelect(capacity)}>
      <img
        src={src}
        className="p-2 w-12 h-12 bg-blue-200 rounded-xl select-none pointer-events-none"
      />
      <div className="flex-2">
        <h4 className="text-lg">{name}</h4>
        <p>Capacity: {capacity}</p>
      </div>
      <div className="flex items-center justify-center">
        <p className="text-green-600 text-lg font-bold">₹{price}</p>
      </div>
    </div>
  );
};
