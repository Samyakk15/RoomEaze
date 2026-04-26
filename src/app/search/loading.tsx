export default function Loading() {
  return (
    <section className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Spinner */}
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-rose-500" />
          <p className="text-base font-medium text-gray-600">
            Loading rooms...
          </p>
        </div>
      </div>
    </section>
  )
}
