import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { Lexend } from "next/font/google"; //import a clean, modern font

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

export const metadata = {
  title: "RU Dining Helper",
  description: "Healthy and affordable meals at Rutgers University",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={lexend.className}>
        {children}
      </body>
    </html>
  );
}