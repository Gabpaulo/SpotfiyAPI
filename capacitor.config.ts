import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'music-player',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      // how long (ms) to keep showing the splash
      launchShowDuration: 6000,
      // background behind your image
      backgroundColor: '#ffffff',
      // Android: resource name from res/drawable-*/ (no extension)
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      // turn off the little loading spinner overlay
      showSpinner: false,
      // iOS override (ms)
    }
  }
};

export default config;
