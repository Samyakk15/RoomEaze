"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { addRoom } from "@/services/roomService"

export default function AddRoomPage() {
  const router = useRouter()
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    location: "",
    image_url: "",
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    if (!userId) {
      setErrorMsg("You must be logged in to add a room.")
      return
    }

    setIsSubmitting(true)

    const roomPayload = {
      title: formData.title,
      price: Number(formData.price),
      description: formData.description,
      location: formData.location,
      image_url: formData.image_url,
    }

    const added = await addRoom(roomPayload, userId)

    if (added) {
      router.push("/host/listings")
    } else {
      setErrorMsg("Failed to create listing. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Room</h2>

        {errorMsg && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          <div>
            <label htmlFor="add-title" className="block font-medium text-gray-700">
              Room Title
            </label>
            <input
              type="text"
              id="add-title"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              placeholder="e.g. 1RK Room in Laxmi Nagar"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="add-price" className="block font-medium text-gray-700">
                Price (₹/mo)
              </label>
              <input
                type="number"
                id="add-price"
                name="price"
                required
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                placeholder="5000"
              />
            </div>
            <div>
              <label htmlFor="add-location" className="block font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="add-location"
                name="location"
                required
                value={formData.location}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                placeholder="e.g. Nagpur"
              />
            </div>
          </div>

          <div>
            <label htmlFor="add-image_url" className="block font-medium text-gray-700">
              Image URL
            </label>
            <input
              type="url"
              id="add-image_url"
              name="image_url"
              required
              value={formData.image_url}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div>
            <label htmlFor="add-description" className="block font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="add-description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              placeholder="Describe the room, amenities, and nearby features..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex justify-center rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-600 active:scale-[0.98] disabled:opacity-70 disabled:hover:bg-rose-500 disabled:active:scale-100"
          >
            {isSubmitting ? "Adding Listing..." : "Add Listing"}
          </button>
        </form>
      </div>
    </div>
  )
}
