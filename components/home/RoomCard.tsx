import React from "react";
import Image from "next/image";

interface RoomCardProps {
  title: string;
  location: string;
  price: number;
  image: string;
  type: string;
}

const RoomCard: React.FC<RoomCardProps> = ({
  title,
  location,
  price,
  image,
  type,
}) => {
  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/60">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-sm">
          {type}
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-rose-500 transition-colors">
          {title}
        </h3>
        <div className="mt-1.5 flex items-center gap-1 text-sm text-gray-500">
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          {location}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">
              ₹{price.toLocaleString("en-IN")}
            </span>
            <span className="text-sm text-gray-500"> / month</span>
          </div>
          <a
            href="#"
            className="rounded-lg bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-100"
          >
            View Details
          </a>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
