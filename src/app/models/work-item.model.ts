export interface WorkItem {
  id: number;
  title: string;
  description?: string;
  assignedTo?: string;
  state: string;
  workItemType: string;
  priority?: number;
  tags?: string[];
  createdDate?: Date;
  changedDate?: Date;
  url?: string;
}

export interface WorkItemState {
  name: string;
  category: string;
  color?: string;
}

export interface WorkItemType {
  name: string;
  icon?: string;
  color?: string;
}

export interface AzureDevOpsConnection {
  organizationUrl: string;
  projectName: string;
  accessToken?: string;
}