export interface Usage {
  id: number;
  value: string;
  label: string;
}

export interface UsageSearchResponse {
  data: Usage[];
}

export interface UsageCreateRequest {
  name: string;
}

export interface UsageUpdateRequest {
  id: number;
  value: string;
  file?: File;
}

export interface UsageFileRequest {
  week: number;
  year: number;
  files: File;
  catId: number;
}

export interface UsageDeleteRequest {
  id: number;
}
