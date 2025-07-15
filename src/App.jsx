import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/AppRouter';
// import { AuthProvider } from './context/AuthContext'; // If using auth

function App() {
  return (
    <BrowserRouter>
      {/* <AuthProvider> */}
        <div className="min-h-screen flex flex-col">
          {/* Navbar can go here if you want it on all pages */}
          <main className="flex-grow p-4">
            <AppRouter />
          </main>
        </div>
      {/* </AuthProvider> */}
    </BrowserRouter>
  );
}

export default App;