import './App.css'
import { ContainersComponent } from './components/Containers'
import { LoginComponent } from './components/Login'
import { Sidebar } from './components/Sidebar'
import { TerminalComponent } from './components/Terminal'

function App() {

  return (
    <>
      <div className="flex h-screen bg-gray-800 text-gray-200">
        <Sidebar />
        <div className="flex-grow mx-5">
        </div>
      </div>
    </>
  )
}

export default App
