import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { isAnalyticsAllowed } from '@/lib/consentManager'
import posthog from 'posthog-js'

// Initialize PostHog if analytics is allowed
if (isAnalyticsAllowed()) {
  posthog.init('phc_no3GB8TzJxUDvKzbFwKVAtZHHy7pvxKZqRgR8DGr8NeT', {
    api_host: 'https://eu.i.posthog.com',
    defaults: '2026-01-30'
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)