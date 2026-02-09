export interface FieldConfig {
  id?: number;
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  readOnly?: boolean;
  readOnlyOnEdit?: boolean;
  defaultValue?: string;
  placeholder?: string;
  helpText?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
    decimals?: number;
    prefix?: string;
    suffix?: string;
  };
  options?: string[] | { label: string; value: string }[];
  endpoint?: string;
  labelField?: string;
  valueField?: string;
  relatedTable?: string;
  relatedDisplayField?: string;
  autoCode?: string;
  autoFill?: Record<string, string>;
  dependency?: {
    field: string;
    queryParam: string;
  };
  formula?: string;
  uploadDir?: string;
  detailFields?: DetailField[];
  sortOrder?: number;
  showInList?: boolean;
  showInForm?: boolean;
  showInDetail?: boolean;
}

export interface DetailField {
  name: string;
  label: string;
  type: string;
  endpoint?: string;
  labelField?: string;
  valueField?: string;
  relatedTable?: string;
  autoFill?: Record<string, string>;
  readOnly?: boolean;
}

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "time"
  | "color"
  | "select"
  | "email"
  | "currency"
  | "rupiah"
  | "async-select"
  | "gram"
  | "formula"
  | "detail"
  | "file"
  | "image"
  | "password"
  | "url";

export interface ModuleConfig {
  id?: number;
  name: string;
  resourceName: string;
  tableName: string;
  title: string;
  description?: string;
  icon?: string;
  moduleType: "master" | "transaction" | "report" | "dashboard";
  route?: string;
  classForm?: string;
  printable?: boolean;
  published?: boolean;
  publishedAt?: Date;
  metadata?: {
    stockLogic?: {
      type: "reduce" | "increase";
      targetTable: string;
      identifierField: string;
      stockField: string;
      quantityField: string;
    };
    [key: string]: any;
  };
  sortOrder?: number;
  fields: FieldConfig[];
}

export interface PageConfig {
  id?: number;
  moduleId?: number;
  title: string;
  slug: string;
  type: "list" | "form" | "detail" | "custom" | "dashboard";
  layout?: string;
  content?: any;
  published?: boolean;
  publishedAt?: Date;
  sortOrder?: number;
  components?: PageComponentConfig[];
}

export interface PageComponentConfig {
  id?: number;
  type: "table" | "form" | "chart" | "card" | "custom";
  config: any;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  sortOrder?: number;
}

export interface RelationshipConfig {
  id?: number;
  sourceModuleId: number;
  targetModuleId: number;
  relationshipType: "one-to-one" | "one-to-many" | "many-to-many";
  sourceField: string;
  targetField?: string;
  cascadeDelete?: boolean;
  required?: boolean;
}

export interface FormBuilderConfig {
  id?: number;
  name: string;
  title: string;
  description?: string;
  schema: ModuleConfig;
  status?: "draft" | "published";
  version?: number;
}
