"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function GoBack() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.back()}
      className="gap-2 bg-primarygreen-700 text-primarygreen-50"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}
