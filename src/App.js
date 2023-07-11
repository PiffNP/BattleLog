import './App.css';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import OBS from "./OBS"

function App() {
  return (
    <Router>
      <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/obs" element={<OBS />} />
          </Routes>
      </div>
    </Router>

  );
}

export default App;
