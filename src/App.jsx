import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./views/home/Home";
import Fractionalize from "./views/fractionalize/Fractionalize";
import Marketplace from "./views/marketplace/Marketplace";
import Portfolio from "./views/portfolio/Portfolio";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />

                <Route
                    path="/fractionalize"
                    element={
                        <ProtectedRoute>
                            <Fractionalize />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/marketplace"
                    element={
                        <ProtectedRoute>
                            <Marketplace />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/portfolio"
                    element={
                        <ProtectedRoute>
                            <Portfolio />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </div>
    );
}

export default App;
