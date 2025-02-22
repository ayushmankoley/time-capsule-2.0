import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CreateCapsule from './pages/CreateCapsule';
import ViewCapsule from './pages/ViewCapsule';
import Auth from './pages/Auth';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create" element={<CreateCapsule />} />
            <Route path="/capsule/:id" element={<ViewCapsule />} />
          </Routes>
        </main>
        <Toaster position="top-center" />
      </div>
    </Router>
  );
}

export default App;