export interface FormValue {
  label?: string;
  value?: string;
  selected?: boolean;
}

export interface FormField {
  id?: any;
  name?: string;
  type?: string;
  icon?: string;
  required?: boolean;
  label?: string;
  placeholder?: string;
  handle?: any;
  min?: number;
  max?: number;
  value?: any;
  fieldOption?: FormValue[];
  catId?: number;
  toggle?: boolean;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

export enum CategoryNames {
  VB = "Văn bản",
  GV = "Giao việc",
}

export interface Category {
  id: number;
  name: string;
}
