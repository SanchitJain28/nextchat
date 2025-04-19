import React from 'react'
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="">
        <p className="text-5xl">
          {[
            true,
            true,
            false,
            true,
            false,
            false,
            true,
            false,
            false,
            true,
            true,
            true,
          ].map((value: boolean, index: number) => {
            return (
              <div
                key={index}
                className={`flex gap-2 mb-4 ${
                  value ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Skeleton className="w-8 h-8 rounded-full" />
                <div
                  className={`flex flex-col max-w-[70%] ${
                    value ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      value ? "bg-muted/10" : "bg-muted/30"
                    }`}
                  >
                    <Skeleton className="h-4 w-[200px] mb-2" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                  <Skeleton className="h-3 w-16 mt-1" />
                </div>
              </div>
            );
          })}
        </p>
      </div>
  )
}
