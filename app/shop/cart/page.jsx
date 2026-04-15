import ClientCartView from "@/components/ClientCartView";

function Page() {
  return (
    <div className="min-h-screen bg-background">
      <h1 className="text-2xl sm:text-2xl font-bold text-primarygreen-500 text-center tracking-wider uppercase pt-8">
        Your Cart
      </h1>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <ClientCartView />
      </main>
    </div>
  );
}

export default Page;
