"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function HomePage() {
  const router = useRouter();

  // Redirect to applications page for now
  useEffect(() => {
    router.push("/applications");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-terminal-dim font-mono">
        <span className="text-terminal-green">$</span> Loading...
      </div>
    </div>
  );
}
