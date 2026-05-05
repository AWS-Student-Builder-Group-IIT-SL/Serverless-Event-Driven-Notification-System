"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import userPool from "../cognitoConfig";

interface Country {
  name: string;
  code: string;
  flag: string;
  cca2: string;
}

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,flag,idd,cca2");
        const data = await res.json();
        
        const formattedCountries = data
          .map((country: any) => {
            if (!country.idd || !country.idd.root) return null;
            const root = country.idd.root;
            const suffix = country.idd.suffixes?.length === 1 ? country.idd.suffixes[0] : "";
            return {
              name: country.name.common,
              code: `${root}${suffix}`,
              flag: country.flag,
              cca2: country.cca2
            };
          })
          .filter(Boolean)
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));
          
        setCountries(formattedCountries);
      } catch (error) {
        console.error("Failed to fetch countries", error);
      }
    };
    fetchCountries();
  }, []);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    const attributeList = [
      new CognitoUserAttribute({ Name: "email", Value: email }),
      new CognitoUserAttribute({ Name: "phone_number", Value: fullPhoneNumber })
    ];

    userPool.signUp(username, password, attributeList, [], (err, result) => {
      if (err) {
        console.error("Error signing up", err);
        alert(err.message || "Sign up failed");
        return;
      }
      // Store username temporarily to use in the verify page
      sessionStorage.setItem("verifyUsername", username);
      router.push("/verify");
    });
  };

  return (
    <div style={{ backgroundColor: "white", color: "black", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "15px", width: "300px" }}>
        <h2>Sign Up</h2>
        <input 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          style={{ padding: "10px", borderRadius: "0", border: "1px solid #ccc", boxSizing: "border-box", width: "100%" }} 
        />
        <input 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          style={{ padding: "10px", borderRadius: "0", border: "1px solid #ccc", boxSizing: "border-box", width: "100%" }} 
        />
        <div style={{ display: "flex", gap: "10px", width: "100%", boxSizing: "border-box" }}>
          <select 
            value={countryCode} 
            onChange={(e) => setCountryCode(e.target.value)}
            style={{ padding: "10px", borderRadius: "0", border: "1px solid #ccc", maxWidth: "160px", backgroundColor: "white", boxSizing: "border-box" }}
          >
            {countries.length > 0 ? (
              countries.map((country, index) => (
                <option key={`${country.cca2}-${index}`} value={country.code}>
                  {country.name} ({country.code})
                </option>
              ))
            ) : (
              <option value="+1">United States (+1)</option>
            )}
          </select>
          <input 
            type="tel"
            placeholder="Phone Number" 
            value={phoneNumber} 
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))} 
            style={{ padding: "10px", borderRadius: "0", border: "1px solid #ccc", flex: 1, minWidth: 0, boxSizing: "border-box" }} 
          />
        </div>
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          style={{ padding: "10px", borderRadius: "0", border: "1px solid #ccc", boxSizing: "border-box", width: "100%" }} 
        />
        <button type="submit" style={{ padding: "10px", backgroundColor: "#FF9900", color: "white", border: "none", borderRadius: "0", cursor: "pointer", fontWeight: "bold", width: "100%", boxSizing: "border-box" }}>
          Sign Up
        </button>
        <p style={{marginTop: "10px", fontSize: "14px"}}>
          Already have an account? <a href="/login" style={{color: "#FF9900"}}>Login</a>
        </p>
      </form>
    </div>
  );
}