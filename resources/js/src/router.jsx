import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import secureLocalStorage from "react-secure-storage";

import LeaveManagement from "./pages/leave-management/App";

// Auth check function
const isAuthenticated = () => {
    const user = secureLocalStorage.getItem("adminpro_user");
    const token = secureLocalStorage.getItem("access_token");
    return !!(user && token);
};

export default function AppRouter() {
    return (
        <Routes>
            {/* Login route - redirect to home if already logged in */}
            <Route
                path="/login"
                element={
                    isAuthenticated() ? <Navigate to="/" replace /> : <Login />
                }
            />

            {/* Main app routes - only accessible when logged in */}
            <Route
                path="/"
                element={
                    isAuthenticated() ? (
                        //<MainLayout /> 
                        <LeaveManagement />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            >
                {/* Nested routes rendered by Outlet */}
                {/* <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="users" element={<Users />} /> */}
                <Route path="*" element={<NotFound />} />
            </Route>

            {/* Catch all other routes */}
            <Route
                path="*"
                element={
                    <Navigate to={isAuthenticated() ? "/" : "/login"} replace />
                }
            />
        </Routes>
    );
}