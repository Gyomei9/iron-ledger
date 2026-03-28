import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { StoreProvider } from "@/hooks/useStore";
import { ToastProvider } from "@/hooks/useToast";

export const metadata: Metadata = {
  title: "Iron Ledger — Workout Tracker",
  description: "Personal workout tracking for you and your friends",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏋️</text></svg>",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans min-h-screen">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <StoreProvider>
                {children}
              </StoreProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
