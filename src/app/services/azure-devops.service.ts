import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { WorkItem, WorkItemState, WorkItemType, AzureDevOpsConnection, AzureDevOpsProject, Team, AreaPath, TeamFieldValues } from '../models/work-item.model';

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

  private teamsSubject = new BehaviorSubject<Team[]>([]);
  public teams$ = this.teamsSubject.asObservable();

  private areaPathsSubject = new BehaviorSubject<AreaPath[]>([]);
  public areaPaths$ = this.areaPathsSubject.asObservable();

  constructor(private http: HttpClient) {}

  setConnection(connection: AzureDevOpsConnection): void {
    this.connectionSubject.next(connection);
    this.loadWorkItemStates();
    this.loadWorkItems();
    this.loadTeams();
    this.loadAreaPaths();
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

  private getHeadersWithToken(organizationUrl: string, accessToken: string): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Basic ${btoa(':' + accessToken)}`,
      'Content-Type': 'application/json'
    });
  }

  getProjects(organizationUrl: string, accessToken: string): Observable<AzureDevOpsProject[]> {
    const url = `${organizationUrl}/_apis/projects?api-version=7.0`;
    const headers = this.getHeadersWithToken(organizationUrl, accessToken);

    return this.http.get<any>(url, { headers })
      .pipe(
        map(response => {
          const projects: AzureDevOpsProject[] = response.value.map((project: any) => ({
            id: project.id,
            name: project.name,
            description: project.description,
            url: project.url,
            state: project.state,
            visibility: project.visibility
          }));
          return projects;
        }),
        catchError(error => {
          console.error('Error fetching projects:', error);
          return throwError(() => error);
        })
      );
  }

  loadWorkItems(): void {
    const connection = this.getCurrentConnection();
    if (!connection) {
      console.error('No connection configured');
      return;
    }

    const wiqlQuery = {
      query: `SELECT [System.Id], [System.Title], [System.Description], [System.AssignedTo], [System.State], [System.WorkItemType], [Microsoft.VSTS.Common.Priority], [System.Tags], [System.TeamProject], [System.AreaPath], [System.CreatedDate], [System.ChangedDate] FROM WorkItems WHERE [System.TeamProject] = '${connection.projectName}' ORDER BY [System.Id]`
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
          const workItems: WorkItem[] = response.value.map((item: any) => {
            return {
              id: item.id,
              title: item.fields['System.Title'] || '',
              description: item.fields['System.Description'] || '',
              assignedTo: item.fields['System.AssignedTo']?.displayName || '',
              state: item.fields['System.State'] || '',
              workItemType: item.fields['System.WorkItemType'] || '',
              priority: item.fields['Microsoft.VSTS.Common.Priority'] || 0,
              tags: item.fields['System.Tags']?.split(';').map((tag: string) => tag.trim()) || [],
              areaPath: item.fields['System.AreaPath'] || '',
              createdDate: new Date(item.fields['System.CreatedDate']),
              changedDate: new Date(item.fields['System.ChangedDate']),
              url: item.url
            };
          });
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

  loadTeams(): void {
    const connection = this.getCurrentConnection();
    if (!connection) {
      console.error('No connection configured');
      return;
    }

    const url = `${connection.organizationUrl}/_apis/projects/${connection.projectName}/teams?api-version=7.0`;

    this.http.get<any>(url, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error loading teams:', error);
          // Fallback to default team
          const defaultTeams: Team[] = [
            { id: 'default', name: 'Default Team', description: 'Default team', areaPaths: ['Default'] }
          ];
          this.teamsSubject.next(defaultTeams);
          return throwError(() => error);
        })
      )
      .subscribe(response => {
        const teams: Team[] = response.value.map((team: any) => ({
          id: team.id,
          name: team.name,
          description: team.description,
          url: team.url,
          areaPaths: [] // Will be populated by getTeamFieldValues
        }));
        
        // Load area paths for each team
        this.loadTeamAreaPaths(teams);
      });
  }

  getTeams(): Observable<Team[]> {
    const connection = this.getCurrentConnection();
    if (!connection) {
      return throwError(() => new Error('No connection configured'));
    }

    const url = `${connection.organizationUrl}/_apis/projects/${connection.projectName}/teams?api-version=7.0`;

    return this.http.get<any>(url, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          const teams: Team[] = response.value.map((team: any) => ({
            id: team.id,
            name: team.name,
            description: team.description,
            url: team.url,
            areaPaths: [] // Will be populated separately
          }));
          return teams;
        }),
        catchError(error => {
          console.error('Error fetching teams:', error);
          return throwError(() => error);
        })
      );
  }

  private loadTeamAreaPaths(teams: Team[]): void {
    const connection = this.getCurrentConnection();
    if (!connection) {
      return;
    }

    // Load area paths for each team in parallel
    const teamFieldValueRequests = teams.map(team => 
      this.getTeamFieldValues(team.id).pipe(
        map(fieldValues => ({ team, fieldValues })),
        catchError(error => {
          console.error(`Error loading team field values for team ${team.name}:`, error);
          // Return team with default area path on error
          return of({ team, fieldValues: null });
        })
      )
    );

    // Wait for all requests to complete
    forkJoin(teamFieldValueRequests).subscribe(results => {
      const updatedTeams = results.map(({ team, fieldValues }) => {
        if (fieldValues && fieldValues.values) {
          // Extract area paths from team field values
          const areaPaths = fieldValues.values.map(value => value.value);
          return { ...team, areaPaths };
        } else {
          // Fallback to default area path
          return { ...team, areaPaths: [connection.projectName] };
        }
      });
      
      this.teamsSubject.next(updatedTeams);
    });
  }

  private getTeamFieldValues(teamId: string): Observable<TeamFieldValues> {
    const connection = this.getCurrentConnection();
    if (!connection) {
      return throwError(() => new Error('No connection configured'));
    }

    const url = `${connection.organizationUrl}/${connection.projectName}/${teamId}/_apis/work/teamsettings/teamfieldvalues?api-version=7.1`;

    return this.http.get<TeamFieldValues>(url, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error fetching team field values:', error);
          return throwError(() => error);
        })
      );
  }

  loadAreaPaths(): void {
    this.getAreaPaths().subscribe({
      next: (areaPaths) => {
        this.areaPathsSubject.next(areaPaths);
      },
      error: (error) => {
        console.error('Error loading area paths:', error);
        // Fallback to default area paths
        const defaultAreaPaths: AreaPath[] = [
          { name: 'Default', path: 'Default', hasChildren: false }
        ];
        this.areaPathsSubject.next(defaultAreaPaths);
      }
    });
  }

  getAreaPaths(): Observable<AreaPath[]> {
    const connection = this.getCurrentConnection();
    if (!connection) {
      return throwError(() => new Error('No connection configured'));
    }

    const url = `${connection.organizationUrl}/_apis/wit/classificationnodes/Areas?api-version=7.0&$depth=2`;

    return this.http.get<any>(url, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          // Parse the area path hierarchy
          const areaPaths: AreaPath[] = [];
          
          function parseNode(node: any, parentPath: string = ''): void {
            const fullPath = parentPath ? `${parentPath}\\${node.name}` : node.name;
            areaPaths.push({
              name: node.name,
              path: fullPath,
              hasChildren: node.children && node.children.length > 0
            });
            
            if (node.children) {
              node.children.forEach((child: any) => parseNode(child, fullPath));
            }
          }
          
          parseNode(response);
          return areaPaths;
        }),
        catchError(error => {
          console.error('Error fetching area paths:', error);
          return throwError(() => error);
        })
      );
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
        map(response => {
          return {
            id: response.id,
            title: response.fields['System.Title'],
            description: response.fields['System.Description'] || '',
            assignedTo: response.fields['System.AssignedTo']?.displayName || '',
            state: response.fields['System.State'],
            workItemType: response.fields['System.WorkItemType'],
            priority: response.fields['Microsoft.VSTS.Common.Priority'] || 0,
            tags: response.fields['System.Tags']?.split(';').map((tag: string) => tag.trim()) || [],
            areaPath: response.fields['System.AreaPath'] || 'Default',
            createdDate: new Date(response.fields['System.CreatedDate']),
            changedDate: new Date(response.fields['System.ChangedDate']),
            url: response.url
          };
        }),
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
        map(response => {
          return {
            id: response.id,
            title: response.fields['System.Title'],
            description: response.fields['System.Description'] || '',
            assignedTo: response.fields['System.AssignedTo']?.displayName || '',
            state: response.fields['System.State'],
            workItemType: response.fields['System.WorkItemType'],
            priority: response.fields['Microsoft.VSTS.Common.Priority'] || 0,
            tags: response.fields['System.Tags']?.split(';').map((tag: string) => tag.trim()) || [],
            areaPath: response.fields['System.AreaPath'] || 'Default',
            createdDate: new Date(response.fields['System.CreatedDate']),
            changedDate: new Date(response.fields['System.ChangedDate']),
            url: response.url
          };
        }),
        catchError(error => {
          console.error('Error creating work item:', error);
          return throwError(() => error);
        })
      );
  }
}