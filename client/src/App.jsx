import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import Home from './pages/Home';
import Announcements from './pages/Announcements';
import ReportIncident from './pages/ReportIncident';
import MapView from './pages/MapView';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import './App.css';

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/report" element={<ReportIncident />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
