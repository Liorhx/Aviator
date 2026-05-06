import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { store } from "./redux/store.js";
import GamePage from "./pages/GamePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import Navbar from "./components/Navbar.jsx";

function PrivateRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? <React.Fragment>{children}</React.Fragment> : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated && user?.role === "admin" ? <React.Fragment>{children}</React.Fragment> : <Navigate to="/" />;
}

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-[#050508] text-white font-sans flex flex-col overflow-hidden">
          <Navbar />
          <Routes>
            <Route path="/login" element={<div className="container mx-auto p-4"><LoginPage /></div>} />
            <Route path="/register" element={<div className="container mx-auto p-4"><RegisterPage /></div>} />
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <GamePage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}
