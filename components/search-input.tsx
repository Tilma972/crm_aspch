"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

export function SearchInput({ placeholder }: { placeholder: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [term, setTerm] = useState(searchParams.get("q")?.toString() || "");

    useEffect(() => {
        const handler = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (term) {
                params.set("q", term);
            } else {
                params.delete("q");
            }
            startTransition(() => {
                router.replace(`?${params.toString()}`);
            });
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [term, router, searchParams]);

    return (
        <div className="flex gap-2">
            <input
                type="text"
                placeholder={placeholder}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            {isPending && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            )}
        </div>
    );
}
