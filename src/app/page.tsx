"use client";
import Loading from "@/components/loading";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    setLoading(true);
    router.push("/chat");
    return () => {
      setLoading(false);
    };
  }, []);
  if(loading){
    return <Loading/>
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center -mt-16">
      <h1 className="text-4xl font-bold mb-8 font-[family-name:var(--font-geist-sans)] text-[#333333]">
        Superblog
      </h1>
    </div>
  );
}
