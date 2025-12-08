import "@/globals.css";
import "@/stores/theme-store";
import type { AppProps } from "next/app";
// Checking main.tsx didn't show Toaster but App.tsx didn't either.
// Let's check if there is a toaster used in the app.
// I'll stick to what was in main.tsx/App.tsx.
// App.tsx imported theme-store.

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
}
