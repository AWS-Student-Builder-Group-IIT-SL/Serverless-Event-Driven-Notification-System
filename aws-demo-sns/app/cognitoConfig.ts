import { CognitoUserPool } from "amazon-cognito-identity-js";

// Taking from environment variables (.env / .env.local)
const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || "YOUR_USER_POOL_ID", 
  ClientId: process.env.NEXT_PUBLIC_CLIENT_ID || "YOUR_CLIENT_ID"
};

export const region = process.env.NEXT_PUBLIC_REGION || "us-east-1";

export default new CognitoUserPool(poolData);
