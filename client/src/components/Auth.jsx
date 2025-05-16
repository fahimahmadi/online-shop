import { auth } from "../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import "./Auth.css";
import { useState } from "react";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async() => {
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        
    } catch (error) {
        console.error(error);
    }
  };
  return (
    <div className="login-form">
      <input
        placeholder="Email..."
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password..."
        onChange={(e) => setPassword(e.target.value)}
      />
      <button 
        className="signin-btn" 
        onClick={login}
      >Sign In
      </button>
    </div>
  );
}

export default Auth;
