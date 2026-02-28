import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import InsightsPage from "./pages/InsightsPage";
import Goals from "./pages/Goals";
import Learning from "./pages/Learning";
import ChatBot from "./components/ChatBot";
import AuthPage from "./pages/SignUp";
import Quiz from "./pages/Quiz";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatBot />
    </Router>
  );
}

export default App;
