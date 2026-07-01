import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import TransferPage from "./pages/TransferPage.jsx";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
         <Route path="/dashboard" element={<DashboardPage />} />
         <Route path="/register" element={<RegisterPage />} />
          <Route path="/transfer" element={<TransferPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
