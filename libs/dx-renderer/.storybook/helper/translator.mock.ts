import { Translator } from '@ballware/meta-services';

/**
 * Creates a mocked Translator for Storybook stories
 * Returns the key or a translated value if provided in translations map
 */
export const createMockedTranslator = (options?: {
  translations?: Record<string, string>;
  fallbackToKey?: boolean;
}): Translator => {
  const translations = options?.translations ?? {};
  const fallbackToKey = options?.fallbackToKey ?? true;

  return (key: string, options?: Record<string, unknown>): string => {
    // Check if we have a translation for this key
    if (translations[key]) {
      let translation = translations[key];

      // Simple interpolation support for {{variable}} syntax
      if (options) {
        Object.keys(options).forEach(optionKey => {
          translation = translation.replace(
            new RegExp(`{{\\s*${optionKey}\\s*}}`, 'g'),
            String(options[optionKey])
          );
        });
      }

      return translation;
    }

    // Fallback to key if no translation found
    return fallbackToKey ? key : `[Missing: ${key}]`;
  };
};

/**
 * Creates a simple translator that just returns the key
 */
export const createSimpleTranslator = (): Translator => {
  return createMockedTranslator({ fallbackToKey: true });
};

/**
 * Creates a translator with common translations for testing
 */
export const createTranslatorWithCommonTranslations = (): Translator => {
  return createMockedTranslator({
    translations: {
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.add': 'Add',
      'common.close': 'Close',
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.ok': 'OK',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.reset': 'Reset',
      'common.apply': 'Apply',
      'validation.required': 'This field is required',
      'validation.email': 'Please enter a valid email address',
      'validation.minlength': 'Minimum length is {{min}} characters',
      'validation.maxlength': 'Maximum length is {{max}} characters',
    },
    fallbackToKey: true,
  });
};

