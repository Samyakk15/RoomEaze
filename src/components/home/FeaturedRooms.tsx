import React from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";
import RoomCard from "@/components/rooms/RoomCard";
import { RoomData } from "@/types/room";

const rooms: RoomData[] = [
  { id: 1, title: "Skyline Luxury Apartment", location: "Bandra West, Mumbai", price: 25000, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=450&fit=crop", rating: 4.8, type: "Apartment" },
  { id: 2, title: "Cozy Studio Near Metro", location: "Koramangala, Bangalore", price: 14000, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=450&fit=crop", rating: 4.5, type: "Studio" },
  { id: 3, title: "Bright Shared Room", location: "Hauz Khas, Delhi", price: 8000, image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&h=450&fit=crop", rating: 4.2, type: "Shared Room" },
  { id: 4, title: "Premium PG with Meals", location: "Hinjewadi, Pune", price: 12000, image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=450&fit=crop", rating: 4.6, type: "PG" },
  { id: 5, title: "Industrial Loft Living", location: "Whitefield, Bangalore", price: 22000, image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&h=450&fit=crop", rating: 4.9, type: "Apartment" },
  { id: 6, title: "City View Service Room", location: "Andheri East, Mumbai", price: 18000, image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=450&fit=crop", rating: 4.3, type: "Room" },
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
            <RoomCard 
              key={room.id} 
              room={{
                id: String(room.id),
                title: room.title,
                price: room.price,
                location: room.location,
                image_url: room.image
              }} 
            />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
          >
            Browse all listings
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default FeaturedRooms;
