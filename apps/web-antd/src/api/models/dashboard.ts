import type {PageRequestParams} from "#/api/models/core";

export interface RepresentativeSearchParams extends PageRequestParams {

}

export interface RepresentativeItem {
  taskId: string;
  name: string;
  state: string;
  category: string;
  assignee: string;
  assigneeName: string;
  owner: string;
  description: string;
  executionId: string;
  processInstanceId: string;
  processDefinitionId: string;
  taskDefinitionId: string;
}


