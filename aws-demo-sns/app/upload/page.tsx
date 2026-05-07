"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import userPool from "../cognitoConfig";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated
    const cognitoUser = userPool.getCurrentUser();
    
    if (cognitoUser != null) {
      cognitoUser.getSession((err: any, session: any) => {
        if (err || !session.isValid()) {
          router.push("/login");
        }
      });
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser != null) {
      cognitoUser.signOut();
    }
    router.push("/login");
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }
    setUploading(true);

    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser != null) {
      cognitoUser.getSession(async (err: any, session: any) => {
        if (err || !session.isValid()) {
          router.push("/login");
          return;
        }

        const idToken = session.getIdToken().getJwtToken();

        try {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const fileContent = e.target?.result as string;
            const base64Content = fileContent.substring(fileContent.indexOf(',') + 1);

            const response = await fetch("https://39fxg3twsd.execute-api.us-east-1.amazonaws.com/prod/upload", {
              method: "POST",
              headers: {
                "Authorization": idToken,
                "Content-Type": "text/plain"
              },
              body: base64Content
            });

            if (response.ok) {
              alert(`File ${file.name} uploaded successfully!`);
              setFile(null);
            } else {
              const errData = await response.json().catch(() => ({}));
              alert(`Upload failed: ${errData.message || response.statusText}`);
            }
            setUploading(false);
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error("Upload error:", error);
          alert("An error occurred during upload.");
          setUploading(false);
        }
      });
    } else {
      router.push("/login");
    }
  };

  return (
    <div style={{ backgroundColor: "white", color: "black", minHeight: "100vh", padding: "40px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>File Upload Dashboard</h2>
          <button onClick={handleLogout} style={{ padding: "8px 16px", backgroundColor: "#333", color: "white", border: "none", borderRadius: "0", cursor: "pointer" }}>
            Logout
          </button>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "20px", border: "1px solid #ddd" }}>
          <label style={{ fontWeight: "bold" }}>Select a file to upload:</label>
          <input 
            type="file" 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files ? e.target.files[0] : null)} 
            style={{ borderRadius: "0" }} 
          />
          <button onClick={handleUpload} disabled={uploading} style={{ padding: "12px", backgroundColor: uploading ? "#ccc" : "#FF9900", color: "white", border: "none", borderRadius: "0", cursor: uploading ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "16px" }}>
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </div>
      </div>
    </div>
  );
}
