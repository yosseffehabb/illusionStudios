import ClientProductView from "@/components/ClientProductView";

export default async function page({ params }) {
  const resolvedParams = await params;
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
      <ClientProductView productId={resolvedParams.id} />
    </div>
  );
}
