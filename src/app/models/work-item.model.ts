export interface WorkItem {
  id: number;
  title: string;
  description?: string;
  assignedTo?: string;
  state: string;
  workItemType: string;
  priority?: number;
  tags?: string[];
  areaPath?: string;
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

export interface AzureDevOpsProject {
  id: string;
  name: string;
  description?: string;
  url?: string;
  state?: string;
  visibility?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  url?: string;
  areaPaths: string[];
}

export interface TeamFieldValue {
  value: string;
  includeChildren: boolean;
}

export interface TeamFieldValues {
  field: {
    referenceName: string;
    url: string;
  };
  defaultValue: string;
  values: TeamFieldValue[];
  url: string;
}

export interface AreaPath {
  name: string;
  path: string;
  hasChildren?: boolean;
  children?: AreaPath[];
}