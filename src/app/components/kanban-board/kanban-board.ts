import { Component, OnInit, OnDestroy, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { AzureDevOpsService } from '../../services/azure-devops.service';
import { AzureDevOpsServiceFactory } from '../../services/azure-devops-service-factory.service';
import { WorkItem, WorkItemState, Team, AreaPath } from '../../models/work-item.model';
import { WorkItemDialog } from '../work-item-dialog/work-item-dialog';

@Component({
  selector: 'app-kanban-board',
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.scss'
})
export class KanbanBoard implements OnInit, OnDestroy {
  workItems = signal<WorkItem[]>([]);
  workItemStates = signal<WorkItemState[]>([]);
  teams = signal<Team[]>([]);
  areaPaths = signal<AreaPath[]>([]);
  projectName = signal<string>('');
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  
  // Team filtering
  selectedTeam = signal<string>('all');
  
  // Manual signal to trigger recalculation of filtered items
  private workItemsUpdateTrigger = signal(0);
  
  // Computed to return all work items (filtering is now done server-side)
  filteredWorkItems = computed(() => {
    // React to trigger signals
    this.workItemsUpdateTrigger();
    return this.workItems();
  });
  
  private azureDevOpsService: AzureDevOpsService | any;
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private serviceFactory: AzureDevOpsServiceFactory,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.azureDevOpsService = this.serviceFactory.getService();
  }

  ngOnInit(): void {
    // Check authentication
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Get project name from connection and ensure service is initialized
    const connection = this.authService.getCurrentConnection();
    if (connection) {
      this.projectName.set(connection.projectName);
      
      // Ensure the Azure DevOps service is properly initialized with the connection
      this.azureDevOpsService.setConnection(connection);
    } else {
      // If no connection despite being authenticated, something is wrong
      console.error('No connection found despite being authenticated');
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    // Subscribe to work items and states
    this.azureDevOpsService.workItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (workItems: WorkItem[]) => {
          this.workItems.set(workItems);
          this.workItemsUpdateTrigger.update(v => v + 1);
          this.isLoading.set(false);
        },
        error: (error: any) => {
          console.error('Error loading work items:', error);
          this.errorMessage.set('Failed to load work items. Please check your connection and try again.');
          this.isLoading.set(false);
        }
      });

    this.azureDevOpsService.workItemStates$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (states: WorkItemState[]) => {
          this.workItemStates.set(states);
        },
        error: (error: any) => {
          console.error('Error loading work item states:', error);
        }
      });

    this.azureDevOpsService.teams$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (teams: Team[]) => {
          this.teams.set(teams);
        },
        error: (error: any) => {
          console.error('Error loading teams:', error);
        }
      });

    this.azureDevOpsService.areaPaths$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (areaPaths: AreaPath[]) => {
          this.areaPaths.set(areaPaths);
        },
        error: (error: any) => {
          console.error('Error loading area paths:', error);
        }
      });

    // Load initial data
    this.refreshBoard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getWorkItemsForState(stateName: string): WorkItem[] {
    return this.filteredWorkItems().filter(item => item.state === stateName);
  }

  onTeamFilterChange(teamName: string): void {
    this.selectedTeam.set(teamName);
    
    // Refresh work items from the API with the selected team filter
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.azureDevOpsService.loadWorkItems(teamName);
  }

  onWorkItemDrop(event: CdkDragDrop<WorkItem[]>): void {
    if (event.previousContainer === event.container) {
      // Moving within the same column
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Moving between columns
      const workItem = event.previousContainer.data[event.previousIndex];
      const newState = this.getStateFromContainer(event.container);
      
      if (newState && workItem.state !== newState) {
        this.updateWorkItemState(workItem, newState);
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
      }
    }
  }

  private getStateFromContainer(container: any): string | null {
    // Find the state based on the container data
    for (const state of this.workItemStates()) {
      if (this.getWorkItemsForState(state.name) === container.data) {
        return state.name;
      }
    }
    return null;
  }

  private updateWorkItemState(workItem: WorkItem, newState: string): void {
    this.azureDevOpsService.updateWorkItemState(workItem.id, newState)
      .subscribe({
        next: (updatedWorkItem: WorkItem) => {
          // Update the local work item
          const currentWorkItems = this.workItems();
          const index = currentWorkItems.findIndex(item => item.id === updatedWorkItem.id);
          if (index !== -1) {
            const updatedWorkItems = [...currentWorkItems];
            updatedWorkItems[index] = updatedWorkItem;
            this.workItems.set(updatedWorkItems);
            this.workItemsUpdateTrigger.update(v => v + 1);
          }
        },
        error: (error: any) => {
          console.error('Error updating work item state:', error);
          this.errorMessage.set('Failed to update work item state. Please try again.');
          this.refreshBoard(); // Refresh to revert changes
        }
      });
  }

  refreshBoard(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    try {
      this.azureDevOpsService.loadWorkItems(this.selectedTeam());
      this.azureDevOpsService.loadWorkItemStates();
      this.azureDevOpsService.loadTeams();
      this.azureDevOpsService.loadAreaPaths();
    } catch (error) {
      console.error('Error loading board data:', error);
      this.errorMessage.set('Failed to load board data. Please try refreshing the page.');
      this.isLoading.set(false);
    }
  }

  createWorkItem(): void {
    const dialogRef = this.dialog.open(WorkItemDialog, {
      width: '600px',
      data: {
        availableStates: this.workItemStates(),
        availableTeams: this.teams(),
        availableAreaPaths: this.areaPaths()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh the board to show the new work item
        this.refreshBoard();
      }
    });
  }

  editWorkItem(workItem: WorkItem): void {
    const dialogRef = this.dialog.open(WorkItemDialog, {
      width: '600px',
      data: {
        workItem: workItem,
        availableStates: this.workItemStates(),
        availableTeams: this.teams(),
        availableAreaPaths: this.areaPaths()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the work item in the local array
        const currentWorkItems = this.workItems();
        const index = currentWorkItems.findIndex(item => item.id === workItem.id);
        if (index !== -1) {
          const updatedWorkItems = [...currentWorkItems];
          updatedWorkItems[index] = { ...updatedWorkItems[index], ...result };
          this.workItems.set(updatedWorkItems);
          this.workItemsUpdateTrigger.update(v => v + 1);
        }
      }
    });
  }

  deleteWorkItem(workItem: WorkItem): void {
    if (confirm(`Are you sure you want to delete work item #${workItem.id}: ${workItem.title}?`)) {
      // TODO: Implement actual delete functionality with Azure DevOps API
      console.log('Delete work item:', workItem);
      
      // For now, just remove from local array
      const currentWorkItems = this.workItems();
      const updatedWorkItems = currentWorkItems.filter(item => item.id !== workItem.id);
      this.workItems.set(updatedWorkItems);
      this.workItemsUpdateTrigger.update(v => v + 1);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  clearError(): void {
    this.errorMessage.set('');
  }
}
