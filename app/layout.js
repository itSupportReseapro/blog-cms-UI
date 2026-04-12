import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import SnackbarContainer from "@/assets/snackbar/SnackbarContainer";

export const metadata = {
  title: "Blog CMS",
  description: "Blog content management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <SnackbarContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
