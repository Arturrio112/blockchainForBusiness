import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./views/Home";
import Fractionalize from "./views/Fractionalize";
import Marketplace from "./views/Marketplace";
import Portfolio from "./views/Portfolio";

function App() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/fractionalize" element={<Fractionalize />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/portfolio" element={<Portfolio />} />
            </Routes>
        </div>
    );
}

export default App;
