import './App.css';
import { useCallback, useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './Home';
import OBS from "./OBS"

function App() {
  return (
    <Router>
      <div className="App">
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/obs" element={<OBS />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
