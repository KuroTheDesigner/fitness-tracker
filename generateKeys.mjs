import { exportJWK, exportPKCS8, generateKeyPair } from "jose";
import { execSync } from "child_process";

const keys = await generateKeyPair("RS256", { extractable: true });
const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

const privatePem = privateKey.trimEnd().replace(/\n/g, " ");

console.log("Setting JWT_PRIVATE_KEY...");
execSync(`npx.cmd convex env set -- JWT_PRIVATE_KEY "${privatePem}"`, { stdio: "inherit" });

console.log("Setting JWKS...");
const jwksEscaped = jwks.replace(/"/g, '\\"');
execSync(`npx.cmd convex env set -- JWKS "${jwksEscaped}"`, { stdio: "inherit" });

console.log("Done! Both keys set atomically from the same key pair.");
