import { Link } from "react-router-dom";

const Navbar = ({ isAuthenticated, onLogout }) => {
  return (
    <nav className="bg-blue-600 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">
          E-Wallet
        </Link>
        <div className="flex space-x-4 items-center">
          {isAuthenticated ? (
            <button
              onClick={onLogout}
              className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="text-white hover:underline">
                Login
              </Link>
              <Link to="/register" className="text-white hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
