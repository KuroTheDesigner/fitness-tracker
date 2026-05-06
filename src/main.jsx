import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { useAuth } from "./shoo";
import './index.css'
import App from './App.jsx'

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const root = createRoot(document.getElementById('root'));

if (!convexUrl) {
  root.render(
    <StrictMode>
      <div className="min-h-screen bg-background text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] font-mono text-white/60">Configuration Error</p>
          <h1 className="text-2xl font-semibold">Missing Convex URL</h1>
          <p className="text-sm text-white/70">
            Set <span className="font-mono">VITE_CONVEX_URL</span> in your environment (Vercel project settings)
            and redeploy.
          </p>
        </div>
      </div>
    </StrictMode>,
  );
} else {
  const convex = new ConvexReactClient(convexUrl);
  root.render(
    <StrictMode>
      <ConvexProviderWithAuth client={convex} useAuth={useAuth}>
        <App />
      </ConvexProviderWithAuth>
    </StrictMode>,
  );
}
