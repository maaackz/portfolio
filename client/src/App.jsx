import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import PageEditor from './components/PageEditor';
import PageViewer from './components/PageViewer';
import CategoryViewer from './components/CategoryViewer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<PageEditor />} />
        <Route path="/:category/:slug" element={<PageViewer />} />
        <Route path="/:category" element={<CategoryViewer />} />
      </Routes>
    </Router>
  );
}

export default App;
