import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import PointsTable from './pages/PointsTable'
import Knockouts from './pages/Knockouts'
import Fixtures from './pages/Fixtures'
import Schedule from './pages/Schedule'
import Teams from './pages/Teams'
import Rules from './pages/Rules'
import Register from './pages/Register'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminTeams from './pages/admin/AdminTeams'
import AdminMatches from './pages/admin/AdminMatches'
import AdminSchedule from './pages/admin/AdminSchedule'
import AdminMessaging from './pages/admin/AdminMessaging'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/points-table" element={<PointsTable />} />
          <Route path="/knockouts" element={<Knockouts />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/fixtures" element={<Fixtures />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminTeams />} />
            <Route path="matches" element={<AdminMatches />} />
            <Route path="schedule" element={<AdminSchedule />} />
            <Route path="messaging" element={<AdminMessaging />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
