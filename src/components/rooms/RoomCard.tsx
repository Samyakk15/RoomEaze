import Image from "next/image"
import Link from "next/link"

type Room = {
  id: string
  title: string
  price: number
  location: string
  image_url?: string
}

export default function RoomCard({ room }: { room: Room }) {
  const imageUrl = room.image_url || "https://via.placeholder.com/400x250?text=No+Image"

  return (
    <Link href={`/room/${room.id}`} className="group">
      <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
        <div className="relative h-48 w-full bg-gray-100">
          <Image
            src={imageUrl}
            alt={room.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h2 className="text-lg font-semibold text-gray-900">{room.title}</h2>

          <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
            <svg
              className="h-4 w-4 shrink-0 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
            <span className="truncate">{room.location}</span>
          </div>

          <p className="mt-4 text-xl font-bold text-gray-900">
            ₹{room.price.toLocaleString("en-IN")}
            <span className="text-sm font-normal text-gray-500">/month</span>
          </p>
        </div>
      </div>
    </Link>
  )
}

