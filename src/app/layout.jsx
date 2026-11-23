import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/context/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";

export const metadata = {
  title: "TaskFlow | Senior Todo & Task Management App",
  description:
    "Full-stack Todo application with MongoDB attachments, in-app due reminder chimes, and multi-view task management.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground transition-colors selection:bg-primary/20 selection:text-primary">
        <ThemeProvider defaultTheme="dark">
          <ToastProvider>
            <AuthProvider>
              {children}
              <AuthModal />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

