import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import AuthPage from "./SignUp";
import Transactions from "./Transactions";


function Home() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <>
      <Transactions />
    </>
  );
}

export default Home;
