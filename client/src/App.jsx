import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import Landing from './pages/Landing';
import StudentLogin from './pages/StudentLogin';
import StudentRegister from './pages/StudentRegister';
import Home from './pages/Home';
import Announcements from './pages/Announcements';
import ReportIncident from './pages/ReportIncident';
import MyReports from './pages/MyReports';
import MapView from './pages/MapView';
import PoliceLogin from './pages/PoliceLogin';
import PoliceDashboard from './pages/PoliceDashboard';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import './App.css';

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/user/login" element={<StudentLogin />} />
          <Route path="/user/register" element={<StudentRegister />} />
          <Route path="/user/home" element={<Home />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/report" element={<ReportIncident />} />
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/police/login" element={<PoliceLogin />} />
          <Route path="/police/dashboard" element={<PoliceDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<Admin />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
