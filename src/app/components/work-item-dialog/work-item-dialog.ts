import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { WorkItem, WorkItemState, Team, AreaPath } from '../../models/work-item.model';
import { AzureDevOpsService } from '../../services/azure-devops.service';
import { AzureDevOpsServiceFactory } from '../../services/azure-devops-service-factory.service';

export interface WorkItemDialogData {
  workItem?: WorkItem;
  availableStates: WorkItemState[];
  availableTeams?: Team[];
  availableAreaPaths?: AreaPath[];
}

@Component({
  selector: 'app-work-item-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './work-item-dialog.html',
  styleUrl: './work-item-dialog.scss'
})
export class WorkItemDialog implements OnInit {
  workItemForm: FormGroup;
  isEdit: boolean;
  isLoading = false;
  availableStates: WorkItemState[];
  availableTeams: Team[];
  availableAreaPaths: AreaPath[];
  private azureDevOpsService: AzureDevOpsService | any;

  constructor(
    private fb: FormBuilder,
    private serviceFactory: AzureDevOpsServiceFactory,
    private dialogRef: MatDialogRef<WorkItemDialog>,
    @Inject(MAT_DIALOG_DATA) public data: WorkItemDialogData
  ) {
    this.azureDevOpsService = this.serviceFactory.getService();
    this.isEdit = !!data.workItem;
    this.availableStates = data.availableStates;
    this.availableTeams = data.availableTeams || [];
    this.availableAreaPaths = data.availableAreaPaths || [];

    this.workItemForm = this.fb.group({
      title: [data.workItem?.title || '', Validators.required],
      workItemType: [data.workItem?.workItemType || 'Task', Validators.required],
      description: [data.workItem?.description || ''],
      assignedTo: [data.workItem?.assignedTo || ''],
      state: [data.workItem?.state || 'New'],
      priority: [data.workItem?.priority || 3],
      tags: [data.workItem?.tags?.join(';') || ''],
      areaPath: [data.workItem?.areaPath || 'Default']
    });
  }

  ngOnInit(): void {
    // If creating a new item, remove the state field
    if (!this.isEdit) {
      this.workItemForm.removeControl('state');
    }
  }

  onSave(): void {
    if (this.workItemForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const formValue = this.workItemForm.value;
      const workItemData: Partial<WorkItem> = {
        title: formValue.title,
        workItemType: formValue.workItemType,
        description: formValue.description,
        assignedTo: formValue.assignedTo,
        priority: formValue.priority,
        tags: formValue.tags ? formValue.tags.split(';').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [],
        areaPath: formValue.areaPath
      };

      if (this.isEdit && this.data.workItem) {
        // Update existing work item
        workItemData.id = this.data.workItem.id;
        workItemData.state = formValue.state;
        
        // For now, we'll close the dialog with the updated data
        // In a real implementation, you'd call the update API
        this.dialogRef.close(workItemData);
      } else {
        // Create new work item
        this.azureDevOpsService.createWorkItem(workItemData).subscribe({
          next: (newWorkItem: WorkItem) => {
            this.dialogRef.close(newWorkItem);
          },
          error: (error: any) => {
            console.error('Error creating work item:', error);
            this.isLoading = false;
            // TODO: Show error message
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
