import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Upload from './pages/Upload';
import InventoryDetail from './pages/InventoryDetail';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-base-200">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new" element={<Upload />} />
          <Route path="/inventory/:id" element={<InventoryDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
