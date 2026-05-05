"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js";
import userPool from "../cognitoConfig";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [requireNewPassword, setRequireNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [cognitoUserObj, setCognitoUserObj] = useState<CognitoUser | null>(null);
  
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        console.log("Login success", result);
        router.push("/upload");
      },
      onFailure: (err) => {
        console.error("Error signing in", err);
        alert(err.message || "Login failed");
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        // Cognito requires the user to set a new password (e.g. admin created account)
        setCognitoUserObj(cognitoUser);
        setRequireNewPassword(true);
      }
    });
  };

  const handleNewPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cognitoUserObj) {
      cognitoUserObj.completeNewPasswordChallenge(newPassword, {}, {
        onSuccess: (result) => {
          console.log("Password updated successfully", result);
          router.push("/upload");
        },
        onFailure: (err) => {
          console.error("Error updating password", err);
          alert(err.message || "Password update failed");
        }
      });
    }
  };

  if (requireNewPassword) {
    return (
      <div style={{ backgroundColor: "white", color: "black", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <form onSubmit={handleNewPasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", width: "300px" }}>
          <h2>New Password Required</h2>
          <p style={{fontSize: "14px"}}>Your account requires a new password to proceed.</p>
          <input 
            type="password" 
            placeholder="New Password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            style={{ padding: "10px", borderRadius: "0", border: "1px solid #ccc", boxSizing: "border-box", width: "100%" }} 
          />
          <button type="submit" style={{ padding: "10px", backgroundColor: "#FF9900", color: "white", border: "none", borderRadius: "0", cursor: "pointer", fontWeight: "bold", width: "100%", boxSizing: "border-box" }}>
            Update Password & Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "white", color: "black", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px", width: "300px" }}>
        <h2>Login</h2>
        <input 
          placeholder="Username or Email" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          style={{ padding: "10px", borderRadius: "0", border: "1px solid #ccc" }} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          style={{ padding: "10px", borderRadius: "0", border: "1px solid #ccc" }} 
        />
        <button type="submit" style={{ padding: "10px", backgroundColor: "#FF9900", color: "white", border: "none", borderRadius: "0", cursor: "pointer", fontWeight: "bold" }}>
          Login
        </button>
        <p style={{marginTop: "10px", fontSize: "14px"}}>
          Don't have an account? <a href="/signup" style={{color: "#FF9900"}}>Sign up</a>
        </p>
      </form>
    </div>
  );
}
