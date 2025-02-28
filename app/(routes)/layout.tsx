import type { Metadata } from "next";
import { Lexend_Deca } from 'next/font/google';
import 'tailwindcss/tailwind.css';

const lexendDeca = Lexend_Deca({
  subsets: ['latin'],
  variable: '--font-lexend-deca',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: "EMS Procedure Generation",
  description: "EMS Procedure Generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark:bg-neutral-950 bg-white" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${lexendDeca.variable} font-sans antialiased dark:text-neutral-100 text-neutral-900`}>
        {children}
      </body>
    </html>
  );
}