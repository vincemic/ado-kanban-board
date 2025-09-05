import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AzureDevOpsServiceFactory } from '../services/azure-devops-service-factory.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const serviceFactory = inject(AzureDevOpsServiceFactory);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        // Ensure the Azure DevOps service is initialized with the connection
        const connection = authService.getCurrentConnection();
        if (connection) {
          const azureDevOpsService = serviceFactory.getService();
          azureDevOpsService.setConnection(connection);
        }
        return true;
      }

      // Redirect to login page if not authenticated
      router.navigate(['/login']);
      return false;
    })
  );
};