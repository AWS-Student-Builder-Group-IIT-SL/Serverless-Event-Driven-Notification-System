"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <p style={{ color: "black" }}>Redirecting to Login...</p>
    </div>
  );
}
