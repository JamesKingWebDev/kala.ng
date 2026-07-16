import { Link } from "react-router";
import { Truck, LayoutDashboard, Shield } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-blue-600 font-bold text-xl"
          >
            <Truck className="w-8 h-8" />
            <span>KalaNg</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="hidden sm:inline">
                Agent Dashboard
              </span>
            </Link>
            <Link
              to="/admin"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Shield className="w-5 h-5" />
              <span className="hidden sm:inline">
                Admin Panel
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}