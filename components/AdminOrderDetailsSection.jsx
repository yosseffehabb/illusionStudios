"use client";

import { getOrderById } from "@/services/apiOrders";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Package, Phone, MapPin, StickyNote } from "lucide-react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export default function AdminOrderDetailsSection() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id),
  });

  const orderDetails = data.order;
  return (
    <div>
      <Card className="bg-primarygreen-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base  text-primarygreen-500">
            Customer Information
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Name */}
          <div className="flex items-start gap-3 text-sm">
            <span className="text-muted-foreground mt-0.5">
              <Package className="h-4 w-4 text-primarygreen-500" />
            </span>
            <div>
              <p className="text-muted-foreground text-xs">Name</p>
              <p className="text-foreground">{orderDetails.customer_name}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3 text-sm">
            <span className="text-muted-foreground mt-0.5">
              <Phone className="h-4 w-4  text-primarygreen-500" />
            </span>
            <div>
              <p className="text-muted-foreground text-xs">Phone</p>
              <p className="text-foreground">{orderDetails.customer_phone}</p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3 text-sm">
            <span className="text-muted-foreground mt-0.5">
              <MapPin className="h-4 w-4  text-primarygreen-500" />
            </span>
            <div>
              <p className="text-muted-foreground text-xs">Address</p>
              <p className="text-foreground">{orderDetails.customer_address}</p>
            </div>
          </div>

          {/* Notes */}
          <div className="flex items-start gap-3 text-sm">
            <StickyNote className="h-4 w-4 text-primarygreen-500 mt-1" />
            <div className="w-full">
              <p className="text-xs text-muted-foreground">Notes</p>
              <p className="bg-muted/40 rounded-md p-3 mt-1 whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                {orderDetails.notes || "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
