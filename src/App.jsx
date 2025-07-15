// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/home';
import Settings from './pages/settings';
import TranslatorManagement from './pages/translatorManagement';
import TranslationDetails from './pages/translationDetails';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/translator-management" element={<TranslatorManagement />} />
              <Route path="/projects/:projectId/translations" element={<TranslationDetails />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;