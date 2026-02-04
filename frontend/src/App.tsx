import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Upload from './pages/Upload';
import InventoryDetail from './pages/InventoryDetail';
import LocationNew from './pages/LocationNew';
import LocationDetail from './pages/LocationDetail';
import RoomDetail from './pages/RoomDetail';
import SafeDetail from './pages/SafeDetail';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import CookiePolicy from './pages/CookiePolicy';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-base-200 flex flex-col">
                  <Header />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/location/new" element={<LocationNew />} />
                      <Route path="/location/:id" element={<LocationDetail />} />
                      <Route path="/room/:id" element={<RoomDetail />} />
                      <Route path="/safe/:id" element={<SafeDetail />} />
                      <Route path="/new" element={<Upload />} />
                      <Route path="/inventory/:id" element={<InventoryDetail />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
