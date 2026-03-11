import React from "react";
import Container from "@/components/layout/Container";
import RoomCard from "./RoomCard";

const rooms = [
  { id: 1, title: "Skyline Luxury Apartment", location: "Bandra West, Mumbai", price: 25000, image: "/images/rooms/room-1.png", type: "Apartment" },
  { id: 2, title: "Cozy Studio Near Metro", location: "Koramangala, Bangalore", price: 14000, image: "/images/rooms/room-2.png", type: "Studio" },
  { id: 3, title: "Bright Shared Room", location: "Hauz Khas, Delhi", price: 8000, image: "/images/rooms/room-3.png", type: "Shared Room" },
  { id: 4, title: "Premium PG with Meals", location: "Hinjewadi, Pune", price: 12000, image: "/images/rooms/room-4.png", type: "PG" },
  { id: 5, title: "Industrial Loft Living", location: "Whitefield, Bangalore", price: 22000, image: "/images/rooms/room-5.png", type: "Apartment" },
  { id: 6, title: "City View Service Room", location: "Andheri East, Mumbai", price: 18000, image: "/images/rooms/room-6.png", type: "Room" },
];

const FeaturedRooms: React.FC = () => {
  return (
    <section className="bg-white py-20 lg:py-28">
      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-3 inline-block rounded-full bg-rose-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-rose-600">
            Featured
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Discover Top Rooms
          </h2>
          <p className="mt-3 text-base leading-relaxed text-gray-600">
            Hand-picked listings verified by our team. Quality spaces at honest prices.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} {...room} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
          >
            Browse all listings
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </Container>
    </section>
  );
};

export default FeaturedRooms;
