import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

const Home = () => {
  const { isConnected } = useWeb3();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Main Hero Content */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full">
              <span className="text-black font-black text-sm tracking-wider">
                DEMOCRATIZING DIGITAL ASSETS
              </span>
            </div>
            
            <h1 className="text-7xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 leading-tight">
              Own a Piece of the Future
            </h1>
            
            <p className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Fractionalize premium NFTs into tradeable tokens. Buy, sell, and invest in 
              high-value digital assets starting from just <span className="text-cyan-400 font-bold">$1</span>.
            </p>

            {!isConnected && (
              <div className="flex justify-center space-x-4">
                <Link
                  to="/marketplace"
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-black text-lg transition-all duration-200 shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-400/70 border-2 border-cyan-300"
                >
                  EXPLORE MARKETPLACE
                </Link>
                <Link
                  to="/fractionalize"
                  className="px-8 py-4 rounded-xl bg-purple-900 hover:bg-purple-800 text-cyan-400 font-black text-lg transition-all duration-200 border-2 border-cyan-400 shadow-xl shadow-purple-500/50"
                >
                  FRACTIONALIZE NFT
                </Link>
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border-2 border-cyan-500/50 rounded-2xl p-8 shadow-xl hover:shadow-cyan-500/30 transition-all duration-300">
              <div className="text-5xl font-black text-cyan-400 mb-3">$5</div>
              <div className="text-sm text-gray-300 font-semibold uppercase tracking-wider">
                Fractionalization Fee
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Fixed USD fee - no surprises!
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border-2 border-cyan-500/50 rounded-2xl p-8 shadow-xl hover:shadow-cyan-500/30 transition-all duration-300">
              <div className="text-5xl font-black text-cyan-400 mb-3">0.5%</div>
              <div className="text-sm text-gray-300 font-semibold uppercase tracking-wider">
                Trading Fee
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Low-cost secondary market trades
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border-2 border-cyan-500/50 rounded-2xl p-8 shadow-xl hover:shadow-cyan-500/30 transition-all duration-300">
              <div className="text-5xl font-black text-cyan-400 mb-3">$1+</div>
              <div className="text-sm text-gray-300 font-semibold uppercase tracking-wider">
                Minimum Investment
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Accessible to everyone
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-20">
            <h2 className="text-4xl font-black text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              HOW IT WORKS
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* For Asset Owners */}
              <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm border-2 border-cyan-400 rounded-2xl p-8 shadow-2xl hover:shadow-cyan-500/40 transition-all duration-300">
                <h3 className="text-2xl font-black text-cyan-400 mb-4">FOR ASSET OWNERS</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-cyan-400 font-bold mr-3">1.</span>
                    <span>Connect your wallet and select your NFT</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-400 font-bold mr-3">2.</span>
                    <span>Choose how many fractional tokens to create</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-400 font-bold mr-3">3.</span>
                    <span>Receive all fractional tokens to your wallet</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-400 font-bold mr-3">4.</span>
                    <span>Sell fractions while keeping ownership stake</span>
                  </li>
                </ul>
              </div>

              {/* For Investors */}
              <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm border-2 border-purple-400 rounded-2xl p-8 shadow-2xl hover:shadow-purple-500/40 transition-all duration-300">
                <h3 className="text-2xl font-black text-purple-400 mb-4">FOR INVESTORS</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-purple-400 font-bold mr-3">1.</span>
                    <span>Browse fractionalized NFTs in the marketplace</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 font-bold mr-3">2.</span>
                    <span>Buy fractional tokens starting from $1</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 font-bold mr-3">3.</span>
                    <span>Diversify across multiple premium assets</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 font-bold mr-3">4.</span>
                    <span>Trade fractions instantly on the marketplace</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-sm border-2 border-purple-500/50 rounded-2xl p-12 shadow-2xl">
            <h2 className="text-4xl font-black text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              WHY FRACTIONALIZATION?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h4 className="text-lg font-bold text-purple-300 mb-2">Lower Barriers</h4>
                <p className="text-sm text-gray-400">
                  Access premium NFTs worth $100k+ with just a few dollars
                </p>
              </div>
              
              <div className="text-center">
                <h4 className="text-lg font-bold text-purple-300 mb-2">Diversification</h4>
                <p className="text-sm text-gray-400">
                  Build a portfolio across multiple collections instead of one NFT
                </p>
              </div>
              
              <div className="text-center">
                <h4 className="text-lg font-bold text-purple-300 mb-2">Instant Liquidity</h4>
                <p className="text-sm text-gray-400">
                  Trade fractions in seconds vs. weeks for whole NFTs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

