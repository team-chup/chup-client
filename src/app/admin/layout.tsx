"use client"

import { Header } from "@/components/Header";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: profile, isLoading } = useProfileQuery();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && profile && profile.authority !== "TEACHER") {
      router.replace("/main");
    }
  }, [isLoading, profile, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile || profile.authority !== "TEACHER") {
    return null;
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <Header isAdmin />
      <div className="flex-1 bg-gray-50 overflow-auto">
        {children}
      </div>
    </div>
  );
}
