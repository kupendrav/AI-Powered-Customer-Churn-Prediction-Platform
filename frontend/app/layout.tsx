import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "ChurnAI — Customer Retention Intelligence",
  description: "AI-powered churn prediction and retention platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--surface-card)",
              color: "var(--text-primary)",
              border: "1px solid var(--surface-border)",
              boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
              fontFamily: "var(--font-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}
