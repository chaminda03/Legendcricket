import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import PointsTable from './pages/PointsTable'
import Knockouts from './pages/Knockouts'
import Fixtures from './pages/Fixtures'
import Teams from './pages/Teams'
import Register from './pages/Register'
import Admin from './pages/Admin'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/points-table" element={<PointsTable />} />
          <Route path="/knockouts" element={<Knockouts />} />
          <Route path="/fixtures" element={<Fixtures />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
