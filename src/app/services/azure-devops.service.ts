import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { WorkItem, WorkItemState, WorkItemType, AzureDevOpsConnection } from '../models/work-item.model';

@Injectable({
  providedIn: 'root'
})
export class AzureDevOpsService {
  private connectionSubject = new BehaviorSubject<AzureDevOpsConnection | null>(null);
  public connection$ = this.connectionSubject.asObservable();

  private workItemsSubject = new BehaviorSubject<WorkItem[]>([]);
  public workItems$ = this.workItemsSubject.asObservable();

  private workItemStatesSubject = new BehaviorSubject<WorkItemState[]>([]);
  public workItemStates$ = this.workItemStatesSubject.asObservable();

  constructor(private http: HttpClient) {}

  setConnection(connection: AzureDevOpsConnection): void {
    this.connectionSubject.next(connection);
    this.loadWorkItemStates();
    this.loadWorkItems();
  }

  getCurrentConnection(): AzureDevOpsConnection | null {
    return this.connectionSubject.value;
  }

  private getHeaders(): HttpHeaders {
    const connection = this.getCurrentConnection();
    if (!connection?.accessToken) {
      throw new Error('No access token available');
    }

    return new HttpHeaders({
      'Authorization': `Basic ${btoa(':' + connection.accessToken)}`,
      'Content-Type': 'application/json'
    });
  }

  loadWorkItems(): void {
    const connection = this.getCurrentConnection();
    if (!connection) {
      console.error('No connection configured');
      return;
    }

    const wiqlQuery = {
      query: `SELECT [System.Id], [System.Title], [System.Description], [System.AssignedTo], [System.State], [System.WorkItemType], [Microsoft.VSTS.Common.Priority], [System.Tags], [System.CreatedDate], [System.ChangedDate] FROM WorkItems WHERE [System.TeamProject] = '${connection.projectName}' ORDER BY [System.Id]`
    };

    const url = `${connection.organizationUrl}/${connection.projectName}/_apis/wit/wiql?api-version=7.0`;

    this.http.post<any>(url, wiqlQuery, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error loading work items:', error);
          return throwError(() => error);
        })
      )
      .subscribe(response => {
        if (response.workItems && response.workItems.length > 0) {
          const ids = response.workItems.map((wi: any) => wi.id).join(',');
          this.getWorkItemDetails(ids).subscribe();
        } else {
          this.workItemsSubject.next([]);
        }
      });
  }

  private getWorkItemDetails(ids: string): Observable<WorkItem[]> {
    const connection = this.getCurrentConnection();
    if (!connection) {
      return throwError(() => new Error('No connection configured'));
    }

    const url = `${connection.organizationUrl}/${connection.projectName}/_apis/wit/workitems?ids=${ids}&$expand=all&api-version=7.0`;

    return this.http.get<any>(url, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          const workItems: WorkItem[] = response.value.map((item: any) => ({
            id: item.id,
            title: item.fields['System.Title'] || '',
            description: item.fields['System.Description'] || '',
            assignedTo: item.fields['System.AssignedTo']?.displayName || '',
            state: item.fields['System.State'] || '',
            workItemType: item.fields['System.WorkItemType'] || '',
            priority: item.fields['Microsoft.VSTS.Common.Priority'] || 0,
            tags: item.fields['System.Tags']?.split(';').map((tag: string) => tag.trim()) || [],
            createdDate: new Date(item.fields['System.CreatedDate']),
            changedDate: new Date(item.fields['System.ChangedDate']),
            url: item.url
          }));
          this.workItemsSubject.next(workItems);
          return workItems;
        }),
        catchError(error => {
          console.error('Error getting work item details:', error);
          return throwError(() => error);
        })
      );
  }

  loadWorkItemStates(): void {
    const connection = this.getCurrentConnection();
    if (!connection) {
      console.error('No connection configured');
      return;
    }

    const url = `${connection.organizationUrl}/${connection.projectName}/_apis/wit/workitemtypes/states?api-version=7.0`;

    this.http.get<any>(url, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error loading work item states:', error);
          // Fallback to default states
          const defaultStates: WorkItemState[] = [
            { name: 'New', category: 'Proposed' },
            { name: 'Active', category: 'InProgress' },
            { name: 'Resolved', category: 'Resolved' },
            { name: 'Closed', category: 'Completed' }
          ];
          this.workItemStatesSubject.next(defaultStates);
          return throwError(() => error);
        })
      )
      .subscribe(response => {
        const states: WorkItemState[] = response.value.map((state: any) => ({
          name: state.name,
          category: state.category,
          color: state.color
        }));
        this.workItemStatesSubject.next(states);
      });
  }

  updateWorkItemState(workItemId: number, newState: string): Observable<WorkItem> {
    const connection = this.getCurrentConnection();
    if (!connection) {
      return throwError(() => new Error('No connection configured'));
    }

    const url = `${connection.organizationUrl}/${connection.projectName}/_apis/wit/workitems/${workItemId}?api-version=7.0`;
    
    const patchDocument = [
      {
        op: 'replace',
        path: '/fields/System.State',
        value: newState
      }
    ];

    const headers = this.getHeaders().set('Content-Type', 'application/json-patch+json');

    return this.http.patch<any>(url, patchDocument, { headers })
      .pipe(
        map(response => ({
          id: response.id,
          title: response.fields['System.Title'],
          description: response.fields['System.Description'] || '',
          assignedTo: response.fields['System.AssignedTo']?.displayName || '',
          state: response.fields['System.State'],
          workItemType: response.fields['System.WorkItemType'],
          priority: response.fields['Microsoft.VSTS.Common.Priority'] || 0,
          tags: response.fields['System.Tags']?.split(';').map((tag: string) => tag.trim()) || [],
          createdDate: new Date(response.fields['System.CreatedDate']),
          changedDate: new Date(response.fields['System.ChangedDate']),
          url: response.url
        })),
        catchError(error => {
          console.error('Error updating work item:', error);
          return throwError(() => error);
        })
      );
  }

  createWorkItem(workItem: Partial<WorkItem>): Observable<WorkItem> {
    const connection = this.getCurrentConnection();
    if (!connection) {
      return throwError(() => new Error('No connection configured'));
    }

    const url = `${connection.organizationUrl}/${connection.projectName}/_apis/wit/workitems/$${workItem.workItemType || 'Task'}?api-version=7.0`;
    
    const patchDocument = [
      {
        op: 'add',
        path: '/fields/System.Title',
        value: workItem.title
      }
    ];

    if (workItem.description) {
      patchDocument.push({
        op: 'add',
        path: '/fields/System.Description',
        value: workItem.description
      });
    }

    if (workItem.assignedTo) {
      patchDocument.push({
        op: 'add',
        path: '/fields/System.AssignedTo',
        value: workItem.assignedTo
      });
    }

    const headers = this.getHeaders().set('Content-Type', 'application/json-patch+json');

    return this.http.post<any>(url, patchDocument, { headers })
      .pipe(
        map(response => ({
          id: response.id,
          title: response.fields['System.Title'],
          description: response.fields['System.Description'] || '',
          assignedTo: response.fields['System.AssignedTo']?.displayName || '',
          state: response.fields['System.State'],
          workItemType: response.fields['System.WorkItemType'],
          priority: response.fields['Microsoft.VSTS.Common.Priority'] || 0,
          tags: response.fields['System.Tags']?.split(';').map((tag: string) => tag.trim()) || [],
          createdDate: new Date(response.fields['System.CreatedDate']),
          changedDate: new Date(response.fields['System.ChangedDate']),
          url: response.url
        })),
        catchError(error => {
          console.error('Error creating work item:', error);
          return throwError(() => error);
        })
      );
  }
}