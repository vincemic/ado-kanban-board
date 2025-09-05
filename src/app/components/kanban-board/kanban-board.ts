import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
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
  workItems: WorkItem[] = [];
  workItemStates: WorkItemState[] = [];
  teams: Team[] = [];
  areaPaths: AreaPath[] = [];
  projectName = '';
  isLoading = true;
  errorMessage = '';
  
  // Team filtering
  selectedTeam = signal<string>('all');
  
  // Computed filtered work items
  filteredWorkItems = computed(() => {
    if (this.selectedTeam() === 'all') {
      return this.workItems;
    }
    
    // Find the selected team by name and get its area paths
    const selectedTeam = this.teams.find(team => team.name === this.selectedTeam());
    if (!selectedTeam) {
      return this.workItems;
    }
    
    // Filter work items by area paths that belong to the selected team
    return this.workItems.filter(item => {
      if (!item.areaPath) {
        return false;
      }
      
      // Check if the work item's area path matches any of the team's area paths
      // This includes checking for exact matches and child paths if includeChildren is true
      return selectedTeam.areaPaths.some(teamAreaPath => {
        // Exact match
        if (item.areaPath === teamAreaPath) {
          return true;
        }
        
        // Check if work item area path is a child of team area path
        // This happens when a team has includeChildren=true for an area
        return item.areaPath?.startsWith(teamAreaPath + '\\');
      });
    });
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

    // Get project name from connection
    const connection = this.authService.getCurrentConnection();
    if (connection) {
      this.projectName = connection.projectName;
    }

    // Subscribe to work items and states
    this.azureDevOpsService.workItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe((workItems: WorkItem[]) => {
        this.workItems = workItems;
        this.isLoading = false;
      });

    this.azureDevOpsService.workItemStates$
      .pipe(takeUntil(this.destroy$))
      .subscribe((states: WorkItemState[]) => {
        this.workItemStates = states;
      });

    this.azureDevOpsService.teams$
      .pipe(takeUntil(this.destroy$))
      .subscribe((teams: Team[]) => {
        this.teams = teams;
      });

    this.azureDevOpsService.areaPaths$
      .pipe(takeUntil(this.destroy$))
      .subscribe((areaPaths: AreaPath[]) => {
        this.areaPaths = areaPaths;
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
    for (const state of this.workItemStates) {
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
          const index = this.workItems.findIndex(item => item.id === updatedWorkItem.id);
          if (index !== -1) {
            this.workItems[index] = updatedWorkItem;
          }
        },
        error: (error: any) => {
          console.error('Error updating work item state:', error);
          this.errorMessage = 'Failed to update work item state. Please try again.';
          this.refreshBoard(); // Refresh to revert changes
        }
      });
  }

  refreshBoard(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.azureDevOpsService.loadWorkItems();
    this.azureDevOpsService.loadWorkItemStates();
    this.azureDevOpsService.loadTeams();
    this.azureDevOpsService.loadAreaPaths();
  }

  createWorkItem(): void {
    const dialogRef = this.dialog.open(WorkItemDialog, {
      width: '600px',
      data: {
        availableStates: this.workItemStates,
        availableTeams: this.teams,
        availableAreaPaths: this.areaPaths
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
        availableStates: this.workItemStates,
        availableTeams: this.teams,
        availableAreaPaths: this.areaPaths
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the work item in the local array
        const index = this.workItems.findIndex(item => item.id === workItem.id);
        if (index !== -1) {
          this.workItems[index] = { ...this.workItems[index], ...result };
        }
      }
    });
  }

  deleteWorkItem(workItem: WorkItem): void {
    if (confirm(`Are you sure you want to delete work item #${workItem.id}: ${workItem.title}?`)) {
      // TODO: Implement actual delete functionality with Azure DevOps API
      console.log('Delete work item:', workItem);
      
      // For now, just remove from local array
      this.workItems = this.workItems.filter(item => item.id !== workItem.id);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  clearError(): void {
    this.errorMessage = '';
  }
}
