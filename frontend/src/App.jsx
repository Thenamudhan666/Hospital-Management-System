import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Starter from "./components/Starter";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import RoomBooking from "./components/userRoomBooking";
import DoctorLogin from "./components/DoctorLogin";
import DoctorSignup from "./components/DoctorSignup";
import DoctorHome from "./components/DoctorHome";
import AdminLogin from "./components/AdminLogin";
import AdminHome from "./components/AdminHome";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Starter />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/doctor-login" element={<DoctorLogin />} />
        <Route path="/doctor-signup" element={<DoctorSignup />} />
        <Route path="/doctor-home" element={<DoctorHome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/room-booking" element={<RoomBooking />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
