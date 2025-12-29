import { GridLayoutColumn } from '@ballware/meta-model';
import { LookupDelegateBuilderFactory } from '../../utils';
import { LookupDescriptor, LookupElementType } from '@ballware/meta-services';
import { get } from 'lodash';

export const prepareLookupDelegateForGridLayoutColumn = (
  column: GridLayoutColumn,
  createLookupDelegateBuilder: LookupDelegateBuilderFactory,
  getGenericLookupByIdentifier: (identifier: string) => LookupDescriptor,
  item: Record<string, unknown>,
  lookups: Record<string, LookupElementType>,
  lookupParams: Record<string, unknown>) => {
  let lookupBuilder = createLookupDelegateBuilder(lookups);

  if (column.items) {
    lookupBuilder.forStaticItems(column.items);
  } else if (column.itemsMember) {
    lookupBuilder.forItemsFromMember(column.itemsMember, (member) => get(item, member) as Array<Record<string, unknown>>);
  } else if (column.lookupMember) {
    lookupBuilder.forItemsFromMember(column.lookupMember, (member) => get(lookupParams, member) as Array<Record<string, unknown>>);
  } else if (column.lookup) {
    lookupBuilder.forIdentifier(column.lookup);

    if (column.lookupParam) {
      lookupBuilder.withParamFromMember(column.lookupParam, (member) => get(lookupParams, member) as string);
    } else if (column.pickvalueEntity && column.pickvalueField) {
      lookupBuilder.withPickvaluesForEntityAndField(column.pickvalueEntity, column.pickvalueField);
    }
  }

  lookupBuilder.withUnknownLookupFallback(getGenericLookupByIdentifier);

  if (column.type === 'staticmultilookup') {
    lookupBuilder.withValueExpr(column.valueExpr ?? 'Value');
    lookupBuilder.withDisplayExpr(column.displayExpr ?? 'Text');
  } else {
    if (column.valueExpr) {
      lookupBuilder.withValueExpr(column.valueExpr);
    }

    if (column.displayExpr) {
      lookupBuilder.withDisplayExpr(column.displayExpr);
    }
  }

  return lookupBuilder.build();
}
