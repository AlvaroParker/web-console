import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { NotFound } from "./components/404.tsx";
import { CodeEditor } from "./components/CodeEditor.tsx";
import { ContainersComponent } from "./components/Containers.tsx";
import { LoginComponent } from "./components/Login.tsx";
import { NewContainer } from "./components/NewContainer.tsx";
import { Sidebar } from "./components/Sidebar.tsx";
import { TerminalComponent } from "./components/Terminal.tsx";
import { UserComponent } from "./components/User.tsx";
import "./index.css";
import { API_ADDRESS } from "./services/consts.ts";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Sidebar />
        <div className="flex-grow mx-5">
          <ContainersComponent />
        </div>
      </>
    ),
  },
  {
    path: "/login",
    element: <LoginComponent />,
  },
  {
    path: "/terminal/:containerId",
    element: (
      <>
        <Sidebar />
        <div className="flex-grow mx-5">
          <TerminalComponent wsURL={API_ADDRESS} />
        </div>
      </>
    ),
  },
  {
    path: "/create",
    element: (
      <>
        <Sidebar />
        <div className="flex-grow mx-5">
          <NewContainer />
        </div>
      </>
    ),
  },
  {
    path: "/code",
    element: (
      <>
        <Sidebar />
        <div className="flex-grow mx-5 h-screen">
          <CodeEditor />
        </div>
      </>
    ),
  },
  {
    path: "/user",
    element: (
      <>
        <Sidebar />
        <div className="flex flex-grow items-center justify-center h-screen mx-5">
          <UserComponent />
        </div>
      </>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <>
      <div className="flex h-full bg-gray-800 text-gray-200">
        <RouterProvider router={router} />
      </div>
    </>
  </React.StrictMode>
);
