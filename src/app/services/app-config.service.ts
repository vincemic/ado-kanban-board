import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private _useMockServices = false;

  constructor() {
    // Check for mock mode from environment variables, localStorage, or URL params
    this.initializeMockMode();
  }

  private initializeMockMode(): void {
    // Check URL parameters for mock mode
    const urlParams = new URLSearchParams(window.location.search);
    const mockParam = urlParams.get('mock');
    
    // Check localStorage for persistent mock mode setting
    const storedMockMode = localStorage.getItem('useMockServices');
    
    if (mockParam !== null) {
      this._useMockServices = mockParam === 'true';
      // Store the setting for persistence
      localStorage.setItem('useMockServices', this._useMockServices.toString());
    } else if (storedMockMode !== null) {
      this._useMockServices = storedMockMode === 'true';
    }
    
    // Default to production mode (false) regardless of environment
    // Mock mode will be automatically enabled when organization name is "test-this"
  }

  get useMockServices(): boolean {
    return this._useMockServices;
  }

  setMockMode(useMock: boolean): void {
    this._useMockServices = useMock;
    localStorage.setItem('useMockServices', useMock.toString());
    console.log(`Mock mode ${useMock ? 'enabled' : 'disabled'}`);
  }

  toggleMockMode(): void {
    this.setMockMode(!this._useMockServices);
  }
}