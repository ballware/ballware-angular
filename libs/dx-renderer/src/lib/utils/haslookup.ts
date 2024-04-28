import { LookupDescriptor } from "@ballware/meta-services";
import DataSource from "devextreme/data/data_source";

export interface HasLookup {
  lookup: LookupDescriptor|undefined;
  dataSource: DataSource;

  getLookupItemDisplayValue(item: Record<string, unknown>): string|undefined;
  getLookupItemHintValue(item: Record<string, unknown>): string|undefined;
  get hasLookupItemHint(): boolean;
}
