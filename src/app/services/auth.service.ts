import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AzureDevOpsConnection } from '../models/work-item.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private connectionSubject = new BehaviorSubject<AzureDevOpsConnection | null>(null);
  public connection$ = this.connectionSubject.asObservable();

  constructor() {
    // Check for stored connection on service initialization
    this.loadStoredConnection();
  }

  private loadStoredConnection(): void {
    try {
      const storedConnection = localStorage.getItem('azureDevOpsConnection');
      if (storedConnection) {
        const connection = JSON.parse(storedConnection);
        this.connectionSubject.next(connection);
        this.isAuthenticatedSubject.next(true);
      }
    } catch (error) {
      console.error('Error loading stored connection:', error);
    }
  }

  authenticate(connection: AzureDevOpsConnection): Observable<boolean> {
    return new Observable(observer => {
      try {
        // Store connection securely (in a real app, consider more secure storage)
        localStorage.setItem('azureDevOpsConnection', JSON.stringify(connection));
        
        this.connectionSubject.next(connection);
        this.isAuthenticatedSubject.next(true);
        
        observer.next(true);
        observer.complete();
      } catch (error) {
        console.error('Authentication error:', error);
        observer.error(error);
      }
    });
  }

  logout(): void {
    localStorage.removeItem('azureDevOpsConnection');
    this.connectionSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getCurrentConnection(): AzureDevOpsConnection | null {
    return this.connectionSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}