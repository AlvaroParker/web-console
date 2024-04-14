import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'
import './index.css'
import { ContainersComponent } from './components/Containers.tsx'
import { LoginComponent } from './components/Login.tsx'
import { TerminalComponent } from './components/Terminal.tsx'
import { Sidebar } from './components/Sidebar.tsx'
import { API_ADDRESS } from './services/consts.ts'
import { NotFound } from './components/404.tsx'
import { NewContainer } from './components/NewContainer.tsx'
import { CodeEditor } from './components/CodeEditor.tsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: 
    <>
        <Sidebar />
        <div className="flex-grow mx-5">
          <ContainersComponent/>
        </div>
    </>
  },
  {
    path: "/login",
    element: <LoginComponent/>
  },
  {
    path: "/terminal/:containerId",
    element: 
    <>
        <Sidebar />
        <div className="flex-grow mx-5">
          <TerminalComponent wsURL={API_ADDRESS}/> 
        </div>
    </>,
  },
  {
    path: "/create",
    element: 
    <>
        <Sidebar />
        <div className="flex-grow mx-5">
          <NewContainer/>
        </div>
    </>
  },
  {
    path: "/code",
    element:
    <>
        <Sidebar />
        <div className="flex-grow mx-5">
          <CodeEditor/>
        </div>
    
    </>
  },
  {
    path: "*",
    element: <NotFound/>
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <>
      <div className="flex h-screen bg-gray-800 text-gray-200">
        <RouterProvider router={router}/>
      </div>
    </>
  </React.StrictMode>,
)
