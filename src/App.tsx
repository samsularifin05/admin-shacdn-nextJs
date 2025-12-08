import { RouterProvider } from "react-router-dom";
import router from "@/router";
import "@/stores/theme-store"; // Initialize theme

function App() {
  return <RouterProvider router={router} />;
}

export default App;
