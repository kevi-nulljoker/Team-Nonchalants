
  
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;



        {/* //<Route path="/login" element={<# />} />
        //<Route path="/signup" element={<# />} /> 
        
        
        // <Route path="/dashboard" element={<# />}>
        //   <Route index element={<# />} /> 
        //   <Route path="transactions" element={<# />} />
        //   <Route path="goals" element={<# />} />
        //   <Route path="AI-Coach" element={<# />} />
        //   <Route path="learn" element={<# />} />
        //   <Route path="insights" element={<# />} />
        // </Route> */}
      