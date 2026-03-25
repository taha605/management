import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Login from './pages/Login'
import Register from './pages/Register'
import ClientDashboard from './pages/client/Dashboard'
import ReclamationsList from './pages/client/ReclamationsList'
import AdminDashboard from './pages/admin/Dashboard'
import AdminReclamations from './pages/admin/Reclamations'
import TechnicienDashboard from './pages/technicien/Dashboard'
import AdminUsers from './pages/admin/Users'
import SuperAdminDashboard from './pages/superadmin/Dashboard'
import Profile from "./pages/Profile"

const PrivateRoute = ({children, roles}) =>{
  const {user, loading} = useAuth()

  if(loading) return <div>Chargement..</div>
  if(!user) return <Navigate to="/login"/>
  if(roles && !roles.includes(user.role)) return <Navigate to="/login" />
  return children
}

function App() {
  return(
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>

          <Route path="/client" element={
            <PrivateRoute roles={['client']}>
              <ClientDashboard/>
            </PrivateRoute>
          } />

          <Route path="/dashboard-client" element={
            <PrivateRoute roles={['client']}>
              <ClientDashboard/>
            </PrivateRoute>
          } />

          <Route path="/reclamations-client" element={
            <PrivateRoute roles={['client']}>
              <ReclamationsList/>
            </PrivateRoute>
          } />

          <Route path="/superadmin" element={
             <PrivateRoute roles={['superadmin']}>
              <SuperAdminDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/admin" element={
            <PrivateRoute roles={['admin']}>
              <AdminDashboard/>
            </PrivateRoute>
          } />

          <Route path="/admin/reclamations" element={
            <PrivateRoute roles={['admin']}>
              <AdminReclamations />
            </PrivateRoute>
          } />

          <Route path="/admin/users" element={
            <PrivateRoute roles={['admin']}>
              <AdminUsers />
            </PrivateRoute>
          } />

          <Route path="/technicien" element={
            <PrivateRoute roles={['technicien']}>
              <TechnicienDashboard/>
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute roles={['admin', 'technicien', 'client', 'superadmin']}>
              <Profile />
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App