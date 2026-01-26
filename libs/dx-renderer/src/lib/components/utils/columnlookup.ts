import { ApiError } from '@ballware/meta-api';
import { GridLayoutColumn } from '@ballware/meta-model';
import {
  LookupByIdentifierFunc,
  LookupElementType,
  NotificationService,
} from '@ballware/meta-services';
import { createLookupDelegateBuilder, LookupDelegate } from '../../utils';
import { get } from 'lodash';

export const createColumnLookupDelegate = (
  column: GridLayoutColumn,
  lookups: Record<string, LookupElementType>,
  getGenericLookupByIdentifier: LookupByIdentifierFunc,
  lookupParams: Record<string, unknown>,
  row?: Record<string, unknown>,
  notificationService?: NotificationService
): LookupDelegate => {
  const lookupBuilder = createLookupDelegateBuilder(lookups);

  if (column.items) {
    lookupBuilder.forStaticItems(column.items);
  } else if (column.lookupMember) {
    lookupBuilder.forItemsFromMember(
      column.lookupMember,
      (member) => get(lookupParams, member) as Array<Record<string, unknown>>
    );
  } else if (column.itemsMember && row) {
    lookupBuilder.forItemsFromMember(
      column.itemsMember,
      (member) => get(row, member) as Array<Record<string, unknown>>
    );
  } else if (column.lookup) {
    lookupBuilder.forIdentifier(column.lookup);

    if (column.lookupParam) {
      lookupBuilder.withParamFromMember(
        column.lookupParam,
        (member) => get(lookupParams, member) as string
      );
    } else if (column.pickvalueEntity && column.pickvalueField) {
      lookupBuilder.withPickvaluesForEntityAndField(
        column.pickvalueEntity,
        column.pickvalueField
      );
    }
  }

  lookupBuilder.withUnknownLookupFallback(getGenericLookupByIdentifier);

  if (notificationService) {
    lookupBuilder.withApiErrorHandler((error: ApiError) => {
      notificationService.triggerNotification({
        message: error.payload?.Message ?? error.message ?? error.statusText,
        severity: 'error',
      });
    });
  }

  lookupBuilder.withDisplayExpr(column.displayExpr);
  lookupBuilder.withValueExpr(column.valueExpr);
  lookupBuilder.withHintExpr(column.hintExpr);
  lookupBuilder.withAcceptCustomValue(column.acceptCustomValue);

  lookupBuilder.withGroupBy(column.lookupGroupBy);

  return lookupBuilder.build();
};
