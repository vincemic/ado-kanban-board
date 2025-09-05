import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { WorkItem, WorkItemState, WorkItemType, AzureDevOpsConnection, AzureDevOpsProject, Team, AreaPath, TeamFieldValues } from '../models/work-item.model';

@Injectable({
  providedIn: 'root'
})
export class MockAzureDevOpsService {
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

  // Mock data
  private mockTeams: Team[] = [
    {
      id: 'team-frontend',
      name: 'Frontend Team',
      description: 'Responsible for UI/UX development',
      areaPaths: ['Sample Project\\Frontend', 'Sample Project\\UI']
    },
    {
      id: 'team-backend',
      name: 'Backend Team',
      description: 'Responsible for API and database development',
      areaPaths: ['Sample Project\\Backend', 'Sample Project\\API']
    },
    {
      id: 'team-devops',
      name: 'DevOps Team',
      description: 'Responsible for infrastructure and deployment',
      areaPaths: ['Sample Project\\DevOps', 'Sample Project\\Infrastructure']
    },
    {
      id: 'team-qa',
      name: 'QA Team',
      description: 'Responsible for testing and quality assurance',
      areaPaths: ['Sample Project\\QA', 'Sample Project\\Testing']
    }
  ];

  private mockAreaPaths: AreaPath[] = [
    { name: 'Sample Project', path: 'Sample Project', hasChildren: true },
    { name: 'Frontend', path: 'Sample Project\\Frontend', hasChildren: false },
    { name: 'UI', path: 'Sample Project\\UI', hasChildren: false },
    { name: 'Backend', path: 'Sample Project\\Backend', hasChildren: false },
    { name: 'API', path: 'Sample Project\\API', hasChildren: false },
    { name: 'DevOps', path: 'Sample Project\\DevOps', hasChildren: false },
    { name: 'Infrastructure', path: 'Sample Project\\Infrastructure', hasChildren: false },
    { name: 'QA', path: 'Sample Project\\QA', hasChildren: false },
    { name: 'Testing', path: 'Sample Project\\Testing', hasChildren: false }
  ];

  private mockProjects: AzureDevOpsProject[] = [
    {
      id: '12345678-1234-1234-1234-123456789012',
      name: 'Sample Project',
      description: 'A sample project for testing',
      state: 'wellFormed',
      visibility: 'private'
    },
    {
      id: '87654321-4321-4321-4321-210987654321',
      name: 'Demo Project',
      description: 'Demo project for kanban board',
      state: 'wellFormed',
      visibility: 'private'
    },
    {
      id: '11111111-2222-3333-4444-555555555555',
      name: 'Test Project',
      description: 'Testing various features',
      state: 'wellFormed',
      visibility: 'private'
    }
  ];

  private mockWorkItems: WorkItem[] = [
    {
      id: 1,
      title: 'Implement user authentication',
      description: 'Add login functionality with Azure AD integration',
      assignedTo: 'John Doe',
      state: 'New',
      workItemType: 'User Story',
      priority: 1,
      tags: ['authentication', 'security'],
      areaPath: 'Sample Project\\Frontend',
      createdDate: new Date('2024-01-15'),
      changedDate: new Date('2024-01-16'),
      url: 'https://dev.azure.com/mockorg/Sample%20Project/_workitems/edit/1'
    },
    {
      id: 2,
      title: 'Design database schema',
      description: 'Create database tables for user data and work items',
      assignedTo: 'Jane Smith',
      state: 'Active',
      workItemType: 'Task',
      priority: 2,
      tags: ['database', 'schema'],
      areaPath: 'Sample Project\\Backend',
      createdDate: new Date('2024-01-16'),
      changedDate: new Date('2024-01-17'),
      url: 'https://dev.azure.com/mockorg/Sample%20Project/_workitems/edit/2'
    },
    {
      id: 3,
      title: 'Create REST API endpoints',
      description: 'Implement RESTful API for CRUD operations',
      assignedTo: 'Mike Johnson',
      state: 'Active',
      workItemType: 'Task',
      priority: 2,
      tags: ['api', 'backend'],
      areaPath: 'Sample Project\\API',
      createdDate: new Date('2024-01-17'),
      changedDate: new Date('2024-01-18'),
      url: 'https://dev.azure.com/mockorg/Sample%20Project/_workitems/edit/3'
    },
    {
      id: 4,
      title: 'Setup CI/CD pipeline',
      description: 'Configure automated build and deployment pipeline',
      assignedTo: 'Sarah Wilson',
      state: 'Resolved',
      workItemType: 'Task',
      priority: 3,
      tags: ['devops', 'pipeline'],
      areaPath: 'Sample Project\\DevOps',
      createdDate: new Date('2024-01-18'),
      changedDate: new Date('2024-01-20'),
      url: 'https://dev.azure.com/mockorg/Sample%20Project/_workitems/edit/4'
    },
    {
      id: 5,
      title: 'Write unit tests',
      description: 'Create comprehensive unit test coverage',
      assignedTo: 'Tom Brown',
      state: 'Closed',
      workItemType: 'Task',
      priority: 3,
      tags: ['testing', 'quality'],
      areaPath: 'Sample Project\\QA',
      createdDate: new Date('2024-01-19'),
      changedDate: new Date('2024-01-21'),
      url: 'https://dev.azure.com/mockorg/Sample%20Project/_workitems/edit/5'
    },
    {
      id: 6,
      title: 'User interface mockups',
      description: 'Create wireframes and mockups for the user interface',
      assignedTo: 'Lisa Davis',
      state: 'New',
      workItemType: 'User Story',
      priority: 2,
      tags: ['ui', 'design'],
      areaPath: 'Sample Project\\UI',
      createdDate: new Date('2024-01-20'),
      changedDate: new Date('2024-01-20'),
      url: 'https://dev.azure.com/mockorg/Sample%20Project/_workitems/edit/6'
    },
    {
      id: 7,
      title: 'Performance optimization',
      description: 'Optimize application performance and loading times',
      assignedTo: 'Alex Chen',
      state: 'Active',
      workItemType: 'Bug',
      priority: 1,
      tags: ['performance', 'optimization'],
      areaPath: 'Sample Project\\Frontend',
      createdDate: new Date('2024-01-21'),
      changedDate: new Date('2024-01-22'),
      url: 'https://dev.azure.com/mockorg/Sample%20Project/_workitems/edit/7'
    }
  ];

  private mockStates: WorkItemState[] = [
    { name: 'New', category: 'Proposed', color: '#007ACC' },
    { name: 'Active', category: 'InProgress', color: '#FF9800' },
    { name: 'Resolved', category: 'Resolved', color: '#4CAF50' },
    { name: 'Closed', category: 'Completed', color: '#9E9E9E' }
  ];

  constructor() {}

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

  getProjects(organizationUrl: string, accessToken: string): Observable<AzureDevOpsProject[]> {
    // Simulate API delay
    return of(this.mockProjects).pipe(delay(1000));
  }

  loadWorkItems(): void {
    // Simulate loading delay
    setTimeout(() => {
      this.workItemsSubject.next([...this.mockWorkItems]);
    }, 500);
  }

  loadWorkItemStates(): void {
    // Simulate loading delay
    setTimeout(() => {
      this.workItemStatesSubject.next([...this.mockStates]);
    }, 300);
  }

  loadTeams(): void {
    // Simulate loading delay
    setTimeout(() => {
      this.teamsSubject.next([...this.mockTeams]);
    }, 200);
  }

  getTeams(): Observable<Team[]> {
    return of([...this.mockTeams]).pipe(delay(200));
  }

  loadAreaPaths(): void {
    // Simulate loading delay
    setTimeout(() => {
      this.areaPathsSubject.next([...this.mockAreaPaths]);
    }, 200);
  }

  getAreaPaths(): Observable<AreaPath[]> {
    return of([...this.mockAreaPaths]).pipe(delay(200));
  }

  updateWorkItemState(workItemId: number, newState: string): Observable<WorkItem> {
    const workItem = this.mockWorkItems.find(wi => wi.id === workItemId);
    if (!workItem) {
      return throwError(() => new Error(`Work item with id ${workItemId} not found`));
    }

    // Update the work item state
    workItem.state = newState;
    workItem.changedDate = new Date();
    
    // Update the subject with new data
    this.workItemsSubject.next([...this.mockWorkItems]);

    // Simulate API delay and return updated work item
    return of({ ...workItem }).pipe(delay(500));
  }

  createWorkItem(workItem: Partial<WorkItem>): Observable<WorkItem> {
    const newId = Math.max(...this.mockWorkItems.map(wi => wi.id)) + 1;
    const newWorkItem: WorkItem = {
      id: newId,
      title: workItem.title || '',
      description: workItem.description || '',
      assignedTo: workItem.assignedTo || '',
      state: workItem.state || 'New',
      workItemType: workItem.workItemType || 'Task',
      priority: workItem.priority || 2,
      tags: workItem.tags || [],
      areaPath: workItem.areaPath || 'Sample Project\\Frontend',
      createdDate: new Date(),
      changedDate: new Date(),
      url: `https://dev.azure.com/mockorg/Sample%20Project/_workitems/edit/${newId}`
    };

    // Add to mock data
    this.mockWorkItems.push(newWorkItem);
    
    // Update the subject with new data
    this.workItemsSubject.next([...this.mockWorkItems]);

    // Simulate API delay and return created work item
    return of({ ...newWorkItem }).pipe(delay(800));
  }

  // Method to reset mock data (useful for testing)
  resetMockData(): void {
    this.workItemsSubject.next([]);
    this.workItemStatesSubject.next([]);
    this.teamsSubject.next([]);
    this.connectionSubject.next(null);
  }

  // Method to add more mock work items
  addMockWorkItem(workItem: Partial<WorkItem>): void {
    const newId = Math.max(...this.mockWorkItems.map(wi => wi.id)) + 1;
    const newWorkItem: WorkItem = {
      id: newId,
      title: workItem.title || `Mock Work Item ${newId}`,
      description: workItem.description || 'Mock description',
      assignedTo: workItem.assignedTo || 'Mock User',
      state: workItem.state || 'New',
      workItemType: workItem.workItemType || 'Task',
      priority: workItem.priority || 2,
      tags: workItem.tags || ['mock'],
      areaPath: workItem.areaPath || 'Sample Project\\Frontend',
      createdDate: new Date(),
      changedDate: new Date(),
      url: `https://dev.azure.com/mockorg/Sample%20Project/_workitems/edit/${newId}`
    };

    this.mockWorkItems.push(newWorkItem);
    this.workItemsSubject.next([...this.mockWorkItems]);
  }
}