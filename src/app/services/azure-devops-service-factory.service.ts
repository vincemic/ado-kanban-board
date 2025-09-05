import { Injectable } from '@angular/core';
import { AzureDevOpsService } from './azure-devops.service';
import { MockAzureDevOpsService } from './mock-azure-devops.service';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class AzureDevOpsServiceFactory {
  constructor(
    private realService: AzureDevOpsService,
    private mockService: MockAzureDevOpsService,
    private config: AppConfigService
  ) {}

  getService(): AzureDevOpsService | MockAzureDevOpsService {
    return this.config.useMockServices ? this.mockService : this.realService;
  }

  getCurrentServiceType(): 'real' | 'mock' {
    return this.config.useMockServices ? 'mock' : 'real';
  }
}