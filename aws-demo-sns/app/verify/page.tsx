"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CognitoUser } from "amazon-cognito-identity-js";
import userPool from "../cognitoConfig";

export default function VerifyPage() {
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const router = useRouter();

  useEffect(() => {
    const savedUsername = sessionStorage.getItem("verifyUsername");
    if (savedUsername) setUsername(savedUsername);
    else router.push("/signup");
  }, [router]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        console.error("Error verifying code", err);
        alert(err.message || "Verification failed");
        return;
      }
      router.push("/upload");
    });
  };

  return (
    <div style={{ backgroundColor: "white", color: "black", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "15px", width: "300px" }}>
        <h2>Verify Account</h2>
        <p style={{fontSize: "14px"}}>Enter the OTP sent to {username}</p>
        <input 
          placeholder="OTP Code" 
          value={code} 
          onChange={(e) => setCode(e.target.value)} 
          style={{ padding: "10px", borderRadius: "0", border: "1px solid #ccc" }} 
        />
        <button type="submit" style={{ padding: "10px", backgroundColor: "#FF9900", color: "white", border: "none", borderRadius: "0", cursor: "pointer", fontWeight: "bold" }}>
          Verify & Continue
        </button>
      </form>
    </div>
  );
}