import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { shortenAddress } from '../utils/contractHelpers';

const Navbar = () => {
  const { account, isConnecting, connectWallet, disconnectWallet, chainId } = useWeb3();
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

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {chainId && (
              <div className="px-3 py-1 rounded-lg bg-purple-800/50 border border-purple-500">
                <span className="text-xs text-purple-300 font-semibold">
                  Chain: {chainId}
                </span>
              </div>
            )}
            
            {account ? (
              <div className="flex items-center space-x-2">
                <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 border-2 border-green-400 shadow-lg shadow-green-500/50">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-white">
                      {shortenAddress(account)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all duration-200 border-2 border-red-400 shadow-lg shadow-red-500/50"
                >
                  DISCONNECT
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-black text-sm transition-all duration-200 shadow-xl shadow-cyan-500/50 hover:shadow-cyan-400/70 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-cyan-300"
              >
                {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

