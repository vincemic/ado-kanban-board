import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Handle GitHub Pages SPA routing
// Check if we're being redirected from 404.html
if (window.location.search.startsWith('?/')) {
  const path = window.location.search.slice(2).replace(/&/g, '?').replace(/~and~/g, '&');
  window.history.replaceState(null, '', '/' + path);
}

// Store the original URL before Angular routing takes over
// This preserves query parameters like ?mock=true for the AppConfigService
sessionStorage.setItem('originalUrl', window.location.href);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
