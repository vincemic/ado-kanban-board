import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Store the original URL before Angular routing takes over
// This preserves query parameters like ?mock=true for the AppConfigService
sessionStorage.setItem('originalUrl', window.location.href);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
