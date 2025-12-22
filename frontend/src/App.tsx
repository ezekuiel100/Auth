import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { PublicRoutes, PrivateRoutes } from "./routes";

const router = createBrowserRouter([
  {
    element: <PublicRoutes />,
    children: [{ path: "/login", element: <Login /> }],
  },
  {
    element: <PrivateRoutes />,
    children: [{ path: "/", element: <Home /> }],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
