import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { store } from "./redux/store.js";
import GamePage from "./pages/GamePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import Navbar from "./components/Navbar.jsx";

function AdminRoute({ children }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated && user?.role === "admin" ? (
    <React.Fragment>{children}</React.Fragment>
  ) : (
    <Navigate to="/" />
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-[#050508] text-white font-sans flex flex-col overflow-hidden">
          <Navbar />
          <Routes>
            {/* Main game page is public: visitors can watch live and are prompted to login only when placing a bet */}
            <Route path="/" element={<GamePage />} />
            <Route
              path="/login"
              element={
                <div className="container mx-auto p-4 flex-1 flex items-center justify-center">
                  <LoginPage />
                </div>
              }
            />
            <Route
              path="/register"
              element={
                <div className="container mx-auto p-4 flex-1 flex items-center justify-center">
                  <RegisterPage />
                </div>
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}
