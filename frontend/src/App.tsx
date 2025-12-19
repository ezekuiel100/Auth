import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";

const router = createBrowserRouter([
  { path: "/", Component: Home },
  { path: "/login", Component: Login },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
