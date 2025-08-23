// src/App.jsx

import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { useAuth } from "./context/useAuth.jsx";
import EquipmentPage from "./pages/EquipmentPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ReportListPage from "./pages/ReportListPage.jsx";
import axios from "axios";
import { ConfigProvider } from "antd";

// 設置 Axios 請求攔截器
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>載入中...</div>; // 或一個 Animate Spin
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
    const { isAuthenticated } = useAuth();
    return (
        <Routes>
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
            />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <EquipmentPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/reports"
                element={
                    <ProtectedRoute>
                        <ReportListPage />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

const App = () => {
    return (
        <ConfigProvider>
            <Router>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </Router>
        </ConfigProvider>
    );
};

export default App;
