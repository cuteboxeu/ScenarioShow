'use client';

import "./globals.css";
import Image from "next/image";
import { useState } from "react";


export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    const [loaded, setLoaded] = useState<boolean>(false);

    return (
        <html lang="en" suppressHydrationWarning>
              <body suppressHydrationWarning>
                    {children}
                    <div className="absolute top-0 w-screen h-screen overflow-hidden">
                        <Image
                            src="/images/bg.webp"
                            alt="bg"
                            fill
                            priority
                            onLoadingComplete={() => setLoaded(true)}
                            className={`object-cover transition-opacity grayscale duration-1000 ease-out
                                  ${loaded ? "opacity-30" : "opacity-0"}
                            `}
                        />
                    </div>
              </body>
        </html>
  );
}
