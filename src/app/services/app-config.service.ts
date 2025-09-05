import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private _useMockServices = false;
  private mockModeChecked = false;

  constructor() {
    // Check for mock mode immediately on service creation
    this.initializeMockMode();
  }

  private initializeMockMode(): void {
    if (this.mockModeChecked) return;
    
    // Check window.location.search for mock parameter
    // This needs to be done before any router redirects
    const urlParams = new URLSearchParams(window.location.search);
    const mockParam = urlParams.get('mock');
    
    console.log('AppConfigService initialization:');
    console.log('Window location href:', window.location.href);
    console.log('Window location search:', window.location.search);
    console.log('Mock param from URL:', mockParam);
    
    if (mockParam === 'true') {
      this._useMockServices = true;
      localStorage.setItem('useMockServices', 'true');
      console.log('Mock mode enabled via query parameter');
    } else {
      // Check localStorage for persistent mock mode setting
      const storedMockMode = localStorage.getItem('useMockServices');
      if (storedMockMode === 'true') {
        this._useMockServices = true;
        console.log('Mock mode enabled from stored preference');
      } else {
        this._useMockServices = false;
        console.log('Mock mode disabled');
      }
    }
    
    this.mockModeChecked = true;
  }

  get useMockServices(): boolean {
    console.log('AppConfigService.useMockServices called');
    console.log('Current _useMockServices:', this._useMockServices);
    console.log('Returning useMockServices:', this._useMockServices);
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