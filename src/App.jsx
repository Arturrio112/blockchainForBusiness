import { Routes, Route, Link } from "react-router-dom";
import Temp from "./views/temp/Temp";
import Home from "./views/home/Home";

function App() {
    return (
        <div className="p-4">
            <nav className="space-x-4">
                <Link to="/">Home</Link>
                <Link to="*">Temp</Link>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<Temp />} />
            </Routes>
        </div>
    );
}

export default App;
