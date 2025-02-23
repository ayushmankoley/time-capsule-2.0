import { Link } from 'react-router-dom';
import { LogIn, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Navbar = () => {
  const { user, signOut } = useAuthStore();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <img 
              src="https://raw.githubusercontent.com/ayushmankoley/time-capsule-2.0/refs/heads/main/src/timecapsulelogo2.jpg"
              alt="TimeVault Logo" 
              className="h-8 object-contain"
            />
          </Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/create"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Capsule
                </Link>
                <button
                  onClick={async () => {
                    await signOut();
                    window.location.href = 'https://time-capsule-2-krackhack.netlify.app';
                  }}
                  className="flex items-center px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
                >
                  <span className="mr-2">Sign Out</span>
                  <LogOut className="h-4 w-4 text-gray-600" />
                </button>
              </>
            ) : (
              <Link to="/auth">
                <button
                  className="inline-flex items-center bg-indigo-600 text-white px-6 py-2 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
                >
                  <span className="mr-2">Login/Signup</span>
                  <LogIn className="h-4 w-4" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;