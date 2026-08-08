import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';


bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)

);
if (environment.production) {
  enableProdMode();
  // Override console methods in production
  if (window) {
    window.console.log = function() {};
    window.console.info = function() {};
    window.console.warn = function() {};
    // Keep console.error visible
  }
}

