import React from "react";

import { useAuth } from "@/hooks/useAuth";

import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

export default function AdminlogoutButton() {
  const { logout, isLoggingOut } = useAuth();

  return (
    <Button
      onClick={() => logout()}
      disabled={isLoggingOut}
      className="bg-primarygreen-500 text-primarygreen-50 hover:bg-primarygreen-700 transition-all duration-300 "
    >
      {isLoggingOut ? <Spinner /> : "Logout"}
    </Button>
  );
}
