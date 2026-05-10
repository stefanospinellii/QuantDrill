// Cookie consent manager for GDPR compliance

const CONSENT_KEY = 'quantdrill_cookie_consent';

export const CATEGORIES = {
  ESSENTIAL: 'essential',
  ANALYTICS: 'analytics',
  MARKETING: 'marketing',
};

/**
 * Get current consent state from localStorage
 */
export function getConsentState() {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Save consent preferences to localStorage
 */
export function saveConsentState(preferences) {
  const state = {
    timestamp: new Date().toISOString(),
    essential: true, // always true
    analytics: preferences?.analytics || false,
    marketing: preferences?.marketing || false,
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  return state;
}

/**
 * Check if analytics is allowed
 */
export function isAnalyticsAllowed() {
  const state = getConsentState();
  if (!state) return false;
  return state.analytics === true;
}

/**
 * Check if marketing is allowed
 */
export function isMarketingAllowed() {
  const state = getConsentState();
  if (!state) return false;
  return state.marketing === true;
}

/**
 * Reset consent (for testing or user request)
 */
export function resetConsent() {
  localStorage.removeItem(CONSENT_KEY);
}

/**
 * Accept all cookies
 */
export function acceptAll() {
  const state = saveConsentState({
    analytics: true,
    marketing: true,
  });
  // Sync PostHog consent
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.opt_in_capturing();
  }
  return state;
}

/**
 * Reject all non-essential cookies
 */
export function rejectAll() {
  const state = saveConsentState({
    analytics: false,
    marketing: false,
  });
  // Sync PostHog consent
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.opt_out_capturing();
  }
  return state;
}

/**
 * Initialize analytics only if user has given consent
 * 
 * IMPORTANT: Any future analytics integration (Google Analytics, Posthog, Mixpanel, Amplitude, etc.)
 * must call isAnalyticsAllowed() before initializing the tracking script.
 * 
 * Example:
 *   if (isAnalyticsAllowed()) {
 *     // Initialize your analytics library here
 *     initGoogleAnalytics();
 *     // or
 *     initPosthog();
 *   }
 * 
 * This ensures GDPR compliance and respects user cookie preferences.
 */
export function initAnalytics() {
  if (!isAnalyticsAllowed()) {
    console.log('Analytics disabled: user has not consented');
    return;
  }

  // Placeholder for future analytics initialization
  // This will be called after the app loads if user consent exists
  console.log('Analytics consent detected: ready to initialize tracking');
  
  // Future analytics integrations should be placed here:
  // - Google Analytics (gtag)
  // - Posthog
  // - Mixpanel
  // - Amplitude
  // - Segment
  // etc.
}