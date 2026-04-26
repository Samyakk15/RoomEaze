import Image from "next/image";
import Link from "next/link";
import { getRoomById } from "@/services/roomService";
import { getReviewsByRoom } from "@/services/reviewService";
import RequestButton from "@/components/room/RequestButton";
import ReviewForm from "@/components/room/ReviewForm";

const fallbackAmenities = [
  "WiFi",
  "AC",
  "Parking",
  "Power Backup",
  "Laundry",
  "Kitchen Access",
];

/* ── Amenity icon mapping ── */
function amenityIcon(name: string) {
  switch (name.toLowerCase()) {
    case "wifi":
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
        </svg>
      );
    case "ac":
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636" />
        </svg>
      );
    case "parking":
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125M8.25 18.75H6" />
        </svg>
      );
    default:
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      );
  }
}

/* ── Star rating component ── */
function Stars({ count }: { count: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < count ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
        </svg>
      ))}
    </span>
  );
}

/* ══════════════════════════════════════════════════
   Room Details Page — async server component
   ══════════════════════════════════════════════════ */
export default async function RoomDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const room = await getRoomById(id);
  const reviews = await getReviewsByRoom(id);

  /* ── Room not found ── */
  if (!room) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-white px-10 py-16 text-center shadow-sm">
          <svg
            className="mb-4 h-16 w-16 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900">
            Room not found
          </h2>
          <p className="mt-2 max-w-sm text-sm text-gray-500">
            The room you&apos;re looking for doesn&apos;t exist or may have been
            removed.
          </p>
          <Link
            href="/search"
            className="mt-6 rounded-lg bg-rose-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-600"
          >
            Browse Rooms
          </Link>
        </div>
      </section>
    );
  }

  /* ── Resolved data ── */
  const imageUrl =
    room.listing_images?.find((img: any) => img.is_primary)?.url ||
    room.listing_images?.[0]?.url ||
    "https://via.placeholder.com/800x500?text=No+Image";
  const amenities: string[] = room.amenities ?? fallbackAmenities;
  const hostName = room.host_name || "StayFinder Host";

  return (
    <section className="bg-gray-50 pb-16">
      {/* ── Hero Image ── */}
      <div className="relative h-[340px] w-full overflow-hidden bg-gray-200 sm:h-[420px] lg:h-[480px]">
        <Image
          src={imageUrl}
          alt={room.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* back link */}
        <Link
          href="/search"
          className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm backdrop-blur transition-colors hover:bg-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back
        </Link>

        {/* title overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg sm:text-3xl lg:text-4xl">
              {room.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-white/90">
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <Link href={`/search?locality=${encodeURIComponent(room.location)}`} className="hover:underline">
                  {room.location}
                </Link>
              </span>
              {room.type && (
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium backdrop-blur">
                  {room.type}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-8 grid gap-8 lg:grid-cols-3">
          {/* ── Left column (details) ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price card */}
            <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Monthly Rent
                </p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  ₹{room.price?.toLocaleString("en-IN")}
                  <span className="text-base font-normal text-gray-400">
                    /month
                  </span>
                </p>
              </div>
              {room.rating && (
                <div className="flex flex-col items-center rounded-xl bg-amber-50 px-4 py-2">
                  <span className="text-2xl font-bold text-amber-500">
                    {room.rating}
                  </span>
                  <Stars count={Math.round(room.rating)} />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                About this place
              </h2>
              <p className="mt-3 leading-relaxed text-gray-600">
                {room.description ||
                  "A comfortable and well-furnished room in a prime location. Ideal for students and working professionals looking for a hassle-free stay with all essential amenities included."}
              </p>
            </div>

            {/* Amenities */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Amenities
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {amenities.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2.5 rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700"
                  >
                    <span className="text-rose-500">{amenityIcon(item)}</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Review Form */}
            <ReviewForm roomId={room.id.toString()} />

            {/* Reviews */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Reviews</h2>

              {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border p-4 mt-3 rounded-lg shadow-sm bg-white">
                      {/* Name */}
                      <p className="font-semibold">
                        {review.user_name || "Anonymous"}
                      </p>

                      {/* Rating */}
                      <p className="text-yellow-600 mt-1">
                        ⭐ {review.rating}/5
                      </p>

                      {/* Comment */}
                      <p className="text-gray-600 mt-1">
                        {review.comment}
                      </p>

                      {/* Date */}
                      <p className="text-sm text-gray-400 mt-2">
                        {review.created_at
                          ? new Date(review.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "No date"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right column (sidebar) ── */}
          <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            {/* Host card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Hosted by
              </h2>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-400 text-xl font-bold text-white">
                  {hostName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{hostName}</p>
                  <p className="text-sm text-gray-500">
                    {room.host_contact || "Contact via StayFinder"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
                Identity verified
              </div>
            </div>

            {/* CTA */}
            <RequestButton roomId={room.id.toString()} />

            {/* Quick info */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Quick Info
              </h3>
              <ul className="mt-3 space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  Available immediately
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  Minimum 1 month stay
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  No brokerage
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
