import OrderTracker from "@/components/OrderTracker";

export default function page() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <h1 className="text-2xl sm:text-2xl font-bold text-primarygreen-500 text-center tracking-wider uppercase pt-8">
        Track your Orders
      </h1>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <OrderTracker />
      </main>
    </div>
  );
}
