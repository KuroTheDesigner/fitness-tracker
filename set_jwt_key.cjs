const { createPrivateKey, createPublicKey } = require('crypto');
const fs = require('fs');
const { execSync } = require('child_process');

async function main() {
    // Dynamic import jose (ESM module)
    const jose = await import('jose');

    const pemKey = fs.readFileSync('jwt_private_key.pem', 'utf8');
    const privateKeyObj = createPrivateKey(pemKey);
    const publicKeyObj = createPublicKey(privateKeyObj);

    // Export public key as JWK
    const jwk = await jose.exportJWK(publicKeyObj);
    jwk.use = 'sig';
    jwk.alg = 'RS256';

    const jwks = JSON.stringify({ keys: [jwk] });
    console.log("JWKS:", jwks.substring(0, 80) + "...");

    // Set the private key (spaces format)
    const privateKeyStr = pemKey.trimEnd().replace(/\r?\n/g, ' ');
    console.log("Setting JWT_PRIVATE_KEY (spaces format)...");
    execSync(`npx.cmd convex env set -- JWT_PRIVATE_KEY "${privateKeyStr}"`, { stdio: 'inherit' });

    // Set the JWKS - need to escape quotes for shell
    console.log("Setting JWKS...");
    // Write JWKS to temp file, then read it and set
    fs.writeFileSync('jwks_temp.txt', jwks);
    const jwksValue = fs.readFileSync('jwks_temp.txt', 'utf8');
    execSync(`npx.cmd convex env set -- JWKS "${jwksValue.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });

    console.log("Done! Both JWT_PRIVATE_KEY and JWKS set.");
}

main().catch(console.error);
