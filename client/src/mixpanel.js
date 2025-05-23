let mixpanelInitialized = false;

export function initMixpanel(maxRetries = 3, retryDelay = 1000) {
  return new Promise((resolve, reject) => {
    let retries = 0;

    function tryInit() {
      if (window.mixpanel && window.mixpanel.__SV) {
        try {
          window.mixpanel.init('YOUR_PROJECT_TOKEN', {
            debug: true,
            track_pageview: true,
            persistence: 'localStorage',
          });
          mixpanelInitialized = true;
          resolve();
        } catch (error) {
          console.error('Mixpanel initialization failed:', error);
          reject(error);
        }
      } else if (retries < maxRetries) {
        retries++;
        console.warn(`Mixpanel library not loaded, retrying (${retries}/${maxRetries})...`);
        setTimeout(() => {
          const script = document.createElement('script');
          script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
          script.async = true;
          script.onload = tryInit;
          script.onerror = () => {
            console.error('Failed to load Mixpanel script on retry');
            if (retries < maxRetries) {
              setTimeout(tryInit, retryDelay);
            } else {
              reject(new Error('Mixpanel library not loaded after max retries'));
            }
          };
          document.head.appendChild(script);
        }, retryDelay);
      } else {
        console.error('Mixpanel library not loaded after max retries');
        reject(new Error('Mixpanel library not loaded'));
      }
    }

    tryInit();
  });
}

export function trackEvent(eventName, properties = {}) {
  if (mixpanelInitialized && window.mixpanel) {
    window.mixpanel.track(eventName, {
      ...properties,
      userId: localStorage.getItem('userId') || 'anonymous',
      timestamp: new Date().toISOString(),
    });
  } else {
    console.warn(`Mixpanel not initialized, skipping event: ${eventName}`);
  }
}

export function identifyUser(userId) {
  if (mixpanelInitialized && window.mixpanel) {
    window.mixpanel.identify(userId);
  } else {
    console.warn('Mixpanel not initialized, skipping identify');
  }
}

export function setUserProfile(userId, properties) {
  if (mixpanelInitialized && window.mixpanel) {
    window.mixpanel.people.set(userId, properties);
  } else {
    console.warn('Mixpanel not initialized, skipping setUserProfile');
  }
}