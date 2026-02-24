import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { useAuth } from "./shoo";
import './index.css'
import App from './App.jsx'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConvexProviderWithAuth client={convex} useAuth={useAuth}>
      <App />
    </ConvexProviderWithAuth>
  </StrictMode>,
)
