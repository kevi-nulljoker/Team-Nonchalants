import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import AuthPage from "./SignUp";
import Transactions from "./Transactions";
import HeroSection from "../components/HeroSection";


function Home() {

  return (
    <>
      {/* <Transactions /> */}
      <HeroSection />
    </>
  );
}

export default Home;
