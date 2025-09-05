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
import { AuthService } from '../../services/auth.service';
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
    MatProgressSpinnerModule
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
  private azureDevOpsService: AzureDevOpsService | any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private serviceFactory: AzureDevOpsServiceFactory,
    private config: AppConfigService,
    private router: Router
  ) {
    this.azureDevOpsService = this.serviceFactory.getService();
    this.loginForm = this.fb.group({
      organizationName: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-_]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/)
      ]],
      accessToken: ['', Validators.required]
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
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      
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
          this.isLoading = false;
          // TODO: Show error message to user
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
  }

  getCurrentServiceType(): string {
    return this.serviceFactory.getCurrentServiceType();
  }
}