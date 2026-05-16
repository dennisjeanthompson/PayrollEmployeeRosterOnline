import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.thecafe.app',
  appName: 'The Cafe',
  webDir: 'dist/public',
  server: {
    // During development, you can uncomment the line below and set the URL
    // to your local dev server (e.g., http://192.168.x.x:5000) so the app
    // live-reloads from your machine instead of the bundled assets.
    // url: 'http://192.168.1.100:5000',

    // Allow mixed content and clear text for development
    androidScheme: 'https',
  },
  android: {
    // Allow the WebView to store cookies and session data
    allowMixedContent: false,
  },
};

export default config;
