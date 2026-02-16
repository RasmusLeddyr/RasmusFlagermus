// Import dependencies.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import "./functions/StyleFuncs.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
  ScrollRestoration,
} from "react-router-dom";

// Import pages.
import Menu from "./pages/Menu/Menu";
import Game from "./pages/Game/Game";
import End from "./pages/End/End";

// Define global page layout.
function AppLayout() {
  return (
    <>
      <Outlet /> <ScrollRestoration />
    </>
  );
}

// Define links.
const routes = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppLayout />}>
      <Route index element={<Menu />} />
      <Route path="game" element={<Game />} />
      <Route path="end" element={<End />} />
    </Route>,
  ),
);

// Place layout under root.
createRoot(document.getElementById("root")).render(
  <RouterProvider router={routes} />,
);
