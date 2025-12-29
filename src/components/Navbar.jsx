import { Link, useLocation, useNavigate } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isConnected } = useAccount();

    const wasConnected = useRef(false); // track previous state

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        // on connect (only once)
        if (isConnected && !wasConnected.current) {
            navigate("/portfolio");
        }

        // on disconnect (only once)
        if (!isConnected && wasConnected.current) {
            navigate("/");
        }

        // update previous state
        wasConnected.current = isConnected;
    }, [isConnected, navigate]);

    return (
        <nav className="bg-gradient-to-r from-red-900 via-indigo-900 to-red-900 border-b-4 border-orange-400 shadow-lg shadow-orange-500/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <div>
                            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                                FractionX
                            </h1>
                            <p className="text-xs text-orange-300 font-semibold tracking-wider">
                                DIGITAL ASSET FRACTIONALIZATION
                            </p>
                        </div>
                    </div>

                    {/* Links only when connected */}
                    {isConnected && (
                        <div className="flex items-center space-x-1">
                            <Link
                                to="/fractionalize"
                                className={`px-5 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                                    isActive("/fractionalize")
                                        ? "bg-orange-500 text-black shadow-lg shadow-orange-500/50"
                                        : "text-orange-300 hover:bg-orange-500/20 hover:text-orange-100"
                                }`}
                            >
                                FRACTIONALIZE
                            </Link>

                            <Link
                                to="/marketplace"
                                className={`px-5 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                                    isActive("/marketplace")
                                        ? "bg-orange-500 text-black shadow-lg shadow-orange-500/50"
                                        : "text-orange-300 hover:bg-orange-500/20 hover:text-orange-100"
                                }`}
                            >
                                MARKETPLACE
                            </Link>

                            <Link
                                to="/portfolio"
                                className={`px-5 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                                    isActive("/portfolio")
                                        ? "bg-orange-500 text-black shadow-lg shadow-orange-500/50"
                                        : "text-orange-300 hover:bg-orange-500/20 hover:text-orange-100"
                                }`}
                            >
                                PORTFOLIO
                            </Link>
                        </div>
                    )}

                    {/* Wallet button */}
                    <div className="flex items-center">
                        <ConnectButton />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
