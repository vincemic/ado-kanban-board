import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../services/auth.service';
import { PreferencesService } from '../../services/preferences.service';
import { AzureDevOpsService } from '../../services/azure-devops.service';
import { AzureDevOpsServiceFactory } from '../../services/azure-devops-service-factory.service';
import { AppConfigService } from '../../services/app-config.service';
import { AzureDevOpsConnection, AzureDevOpsProject } from '../../models/work-item.model';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  loginForm: FormGroup;
  projectForm: FormGroup;
  isLoading = false;
  showProjectSelection = false;
  availableProjects: AzureDevOpsProject[] = [];
  organizationUrl = '';
  accessToken = '';
  errorMessage = '';
  private azureDevOpsService: AzureDevOpsService | any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private serviceFactory: AzureDevOpsServiceFactory,
    private config: AppConfigService,
    private router: Router,
    private preferencesService: PreferencesService
  ) {
    this.azureDevOpsService = this.serviceFactory.getService();
    this.loginForm = this.fb.group({
      organizationName: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-_]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/)
      ]],
      accessToken: ['', Validators.required],
      rememberThis: [false]
    });

    this.projectForm = this.fb.group({
      selectedProject: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // If already authenticated, redirect to board
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/board']);
    }
    
    // Load saved credentials if remember is enabled
    this.loadSavedCredentials();
    
    // Clear error message when form values change
    this.loginForm.valueChanges.subscribe(() => {
      this.errorMessage = '';
      
      // Clear saved credentials if remember checkbox is unchecked
      if (!this.loginForm.value.rememberThis) {
        this.preferencesService.clearCredentials();
        this.preferencesService.savePreferences({ rememberCredentials: false });
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = ''; // Clear previous errors
      
      const organizationName = this.loginForm.value.organizationName.trim();
      this.organizationUrl = `https://dev.azure.com/${organizationName}`;
      this.accessToken = this.loginForm.value.accessToken;

      // Check if organization name is "test-this" and enable mock mode
      if (organizationName === 'test-this') {
        this.config.setMockMode(true);
        this.azureDevOpsService = this.serviceFactory.getService();
      } else {
        this.config.setMockMode(false);
        this.azureDevOpsService = this.serviceFactory.getService();
      }

      // First, fetch available projects
      this.azureDevOpsService.getProjects(this.organizationUrl, this.accessToken).subscribe({
        next: (projects: AzureDevOpsProject[]) => {
          this.availableProjects = projects;
          this.showProjectSelection = true;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Failed to fetch projects:', error);
          console.log('Error status:', error.status);
          console.log('Error message:', error.message);
          console.log('Full error object:', error);
          this.isLoading = false;
          
          // Provide user-friendly error messages
          if (error.status === 0) {
            this.errorMessage = 'Unable to connect to Azure DevOps. This might be due to CORS restrictions when calling Azure DevOps APIs directly from the browser. Consider using a proxy server or Azure DevOps Extensions.';
          } else if (error.status === 401) {
            this.errorMessage = 'Authentication failed. Please check your Personal Access Token and ensure it has the necessary permissions.';
          } else if (error.status === 403) {
            this.errorMessage = 'Access denied. Please ensure your Personal Access Token has permissions to read projects.';
          } else if (error.status === 404) {
            this.errorMessage = 'Organization not found. Please check the organization name and try again.';
          } else {
            this.errorMessage = `Error connecting to Azure DevOps: ${error.message || 'Unknown error'}. Try using "test-this" as organization name for demo mode.`;
          }
          
          console.log('Setting error message to:', this.errorMessage);
        }
      });
    }
  }

  onProjectSubmit(): void {
    if (this.projectForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const selectedProject = this.projectForm.value.selectedProject;
      const connection: AzureDevOpsConnection = {
        organizationUrl: this.organizationUrl,
        projectName: selectedProject,
        accessToken: this.accessToken
      };

      this.authService.authenticate(connection).subscribe({
        next: (success: boolean) => {
          if (success) {
            // Save credentials if remember checkbox is checked
            if (this.loginForm.value.rememberThis) {
              this.saveCredentials(selectedProject);
            } else {
              this.preferencesService.clearCredentials();
            }
            
            this.azureDevOpsService.setConnection(connection);
            this.router.navigate(['/board']);
          }
        },
        error: (error: any) => {
          console.error('Authentication failed:', error);
          this.isLoading = false;
          // TODO: Show error message to user
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  goBack(): void {
    this.showProjectSelection = false;
    this.availableProjects = [];
    this.projectForm.reset();
    // Keep the remember checkbox state when going back
    const rememberState = this.loginForm.value.rememberThis;
    this.loginForm.patchValue({ rememberThis: rememberState });
  }

  getCurrentServiceType(): string {
    return this.serviceFactory.getCurrentServiceType();
  }

  /**
   * Load saved credentials from preferences service
   */
  private loadSavedCredentials(): void {
    if (this.preferencesService.shouldRememberCredentials()) {
      const savedCredentials = this.preferencesService.getSavedCredentials();
      if (savedCredentials) {
        this.loginForm.patchValue({
          organizationName: savedCredentials.organizationName,
          accessToken: savedCredentials.accessToken,
          rememberThis: true
        });
        
        // If we have a saved project, we could auto-populate that too
        if (savedCredentials.projectName) {
          this.projectForm.patchValue({
            selectedProject: savedCredentials.projectName
          });
        }
      }
    }
  }

  /**
   * Save credentials to preferences service
   */
  private saveCredentials(projectName: string): void {
    const credentials = {
      organizationName: this.loginForm.value.organizationName,
      accessToken: this.loginForm.value.accessToken,
      projectName: projectName
    };
    
    this.preferencesService.saveCredentials(credentials);
    this.preferencesService.savePreferences({ rememberCredentials: true });
  }
}