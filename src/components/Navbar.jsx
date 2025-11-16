import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 border-b-4 border-cyan-400 shadow-lg shadow-cyan-500/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                FractionX
              </h1>
              <p className="text-xs text-cyan-300 font-semibold tracking-wider">
                DIGITAL ASSET FRACTIONALIZATION
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <Link
              to="/"
              className={`px-5 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                isActive('/')
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/50'
                  : 'text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-100'
              }`}
            >
              HOME
            </Link>
            <Link
              to="/fractionalize"
              className={`px-5 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                isActive('/fractionalize')
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/50'
                  : 'text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-100'
              }`}
            >
              FRACTIONALIZE
            </Link>
            <Link
              to="/marketplace"
              className={`px-5 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                isActive('/marketplace')
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/50'
                  : 'text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-100'
              }`}
            >
              MARKETPLACE
            </Link>
            <Link
              to="/portfolio"
              className={`px-5 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                isActive('/portfolio')
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/50'
                  : 'text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-100'
              }`}
            >
              PORTFOLIO
            </Link>
          </div>

          {/* Wallet Connection with RainbowKit */}
          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

