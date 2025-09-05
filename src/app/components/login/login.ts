import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { AzureDevOpsService } from '../../services/azure-devops.service';
import { AzureDevOpsConnection } from '../../models/work-item.model';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private azureDevOpsService: AzureDevOpsService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      organizationUrl: ['', [
        Validators.required,
        Validators.pattern(/^https:\/\/dev\.azure\.com\/[a-zA-Z0-9-_]+\/?$/)
      ]],
      projectName: ['', Validators.required],
      accessToken: ['', Validators.required]
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
      
      const connection: AzureDevOpsConnection = {
        organizationUrl: this.loginForm.value.organizationUrl.replace(/\/$/, ''), // Remove trailing slash
        projectName: this.loginForm.value.projectName,
        accessToken: this.loginForm.value.accessToken
      };

      this.authService.authenticate(connection).subscribe({
        next: (success) => {
          if (success) {
            this.azureDevOpsService.setConnection(connection);
            this.router.navigate(['/board']);
          }
        },
        error: (error) => {
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
}
