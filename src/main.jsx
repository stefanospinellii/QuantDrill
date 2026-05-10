import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { isAnalyticsAllowed } from '@/lib/consentManager'
import posthog from 'posthog-js'

// Initialize PostHog unconditionally with privacy-safe defaults
posthog.init('phc_no3GB8TzJxUDvKzbFwKVAtZHHy7pvxKZqRgR8DGr8NeT', {
  api_host: 'https://eu.i.posthog.com',
  persistence: 'memory',
  autocapture: false,
  capture_pageview: true,
  disable_session_recording: true,
})

// Respect consent preference for capturing
if (isAnalyticsAllowed()) {
  posthog.opt_in_capturing()
} else {
  posthog.opt_out_capturing()
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)