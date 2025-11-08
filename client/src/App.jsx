import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import { Toaster } from "sonner"
import { useSelector } from "react-redux"
import Sidebar from "./components/Sidebar"
import Navbar from "./components/Navbar"
import Dashboard from "./pages/Dashboard"
import Tasks from "./pages/Tasks"
import TaskDetails from "./pages/TaskDetails"
import Users from "./pages/Users"
import Trash from "./pages/Trash"
import Login from "./pages/Login"

function Layout() {
  const { user } = useSelector((state) => state.auth)
  const location = useLocation()

  return user ? (
    <div className="w-full h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-[250px] h-full bg-white border-r border-gray-200 hidden md:flex">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-4 2xl:p-10">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/completed/:status" element={<Tasks />} />
            <Route path="/in-progress/:status" element={<Tasks />} />
            <Route path="/todo/:status" element={<Tasks />} />
            <Route path="/team" element={<Users />} />
            <Route path="/trashed" element={<Trash />} />
            <Route path="/task/:id" element={<TaskDetails />} />
          </Routes>
        </div>
      </div>
    </div>
  ) : (
    <Navigate to="/log-in" state={{ from: location }} replace />
  )
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/log-in" element={<Login />} />
        <Route path="/*" element={<Layout />} />
      </Routes>
      <Toaster richColors />
    </>
  )
}

export default App
