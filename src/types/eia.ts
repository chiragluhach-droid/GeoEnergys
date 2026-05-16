export interface EIAResponseItem {
  period: string;
  value: string | number | null;
  countryRegionId?: string;
  countryRegionTypeId?: string;
  activityId?: string;
  productId?: string;
  unit?: string;
  [key: string]: string | number | null | undefined;
}

export interface EIAResponse {
  request: {
    command: string;
    params: Record<string, string | string[]>;
  };
  response: {
    total: number;
    dateFormat: string;
    frequency: string;
    data: EIAResponseItem[];
    description?: string;
  };
}

export interface EIAFetchParams {
  route: string;
  facets?: Record<string, string[]>;
  frequency?: "annual" | "monthly" | "quarterly";
  start?: string;
  end?: string;
  length?: number;
  offset?: number;
}
