'use client';

import "./globals.css";
import Image from "next/image";
import { useState } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <div className="relative min-h-screen">

                    <div className="relative z-10 min-h-screen flex justify-center px-4 overflow-y-auto">
                        <div className="my-auto max-w-5xl">
                            {children}
                        </div>
                    </div>

                    <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
                        <Image
                            src="/images/bg.webp"
                            alt="bg"
                            fill
                            priority
                            draggable={false}
                            onLoadingComplete={() => setLoaded(true)}
                            className={`object-cover grayscale transition-opacity duration-1000 ease-out
                                ${loaded ? "opacity-30" : "opacity-0"}
                            `}
                        />
                    </div>

                </div>

            </body>
        </html>
    );
}
