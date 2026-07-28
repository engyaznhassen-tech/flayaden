import type { Metadata, Viewport } from "next";
import "@fontsource/tajawal/400.css";
import "@fontsource/tajawal/500.css";
import "@fontsource/tajawal/700.css";
import "@fontsource/tajawal/800.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "طيران عدن | من عدن نقرّب لك العالم",
  description:
    "نموذج تفاعلي للواجهة الرئيسية لشركة طيران عدن، يتضمن تجربة حجز وحركة إقلاع مرتبطة بالتمرير.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/Artboard.png",
    shortcut: "/Artboard.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#032b1d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
