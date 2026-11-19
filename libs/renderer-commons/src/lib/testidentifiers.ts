import { EditLayoutItem, PageLayoutItem } from '@ballware/meta-model';

const fallbackSegment = (value: unknown): string|undefined => {
  if (typeof value === 'string') {
    const normalized = value
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');

    return normalized.length > 0 ? normalized : undefined;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }

  return undefined;
};

export const safeTestIdSegment = (value: unknown, fallback: string): string => {
  return fallbackSegment(value) ?? fallbackSegment(fallback) ?? 'item';
};

export const getPageItemTestIdSegment = (item: PageLayoutItem | undefined, index: number): string => {
  const itemOptions = item?.options?.itemoptions as Record<string, unknown>|undefined;

  const key = itemOptions?.['identifier']
    ?? itemOptions?.['entity']
    ?? itemOptions?.['statistic']
    ?? itemOptions?.['caption']
    ?? item?.type;

  return `${safeTestIdSegment(key, 'item')}-${index}`;
};

export const getEditItemTestIdSegment = (item: EditLayoutItem | undefined, index: number): string => {
  const itemOptions = item?.options?.itemoptions as Record<string, unknown>|undefined;

  const key = item?.options?.dataMember
    ?? itemOptions?.['identifier']
    ?? item?.options?.caption
    ?? item?.type;

  return `${safeTestIdSegment(key, 'item')}-${index}`;
};

export const getToolbarItemTestId = (parentPath: string, name: unknown): string => {
  return `${parentPath}.${safeTestIdSegment(name, 'item')}`;
};
