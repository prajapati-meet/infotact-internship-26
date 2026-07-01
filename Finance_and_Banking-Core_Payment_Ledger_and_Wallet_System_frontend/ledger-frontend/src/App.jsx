import React from 'react'
import RegisterPage from './pages/RegisterPage.jsx'

const App = () => {
  return (
    <div>App
      <RegisterPage/>
    </div>
  )
}

export default App

//we need follow these method deepika
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
         <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
