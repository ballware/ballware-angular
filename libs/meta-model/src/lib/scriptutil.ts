/**
 * Adapter for utilities available in custom scripts
 */
 export interface ScriptUtil {
  /**
   * Generate new UUID
   */
  uuid: () => string;

  /**
   * Parse JSON to object
   *
   * @param json String with serialized JSON
   * @returns Deserialized object
   */
  parse: (
    json: string
  ) => Record<string, unknown> | Array<Record<string, unknown>>;

  /**
   * Stringify object to JSON
   *
   * @param json object to serialize
   * @returns String with serialized object
   */
  stringify: (
    json: Record<string, unknown> | Array<Record<string, unknown>>
  ) => string;

  /**
   * Convert universal date to local date
   */
  dateToLocalDate: (date: Date) => Date;

  /**
   * Convert local date to universal date
   */
  localDateToDate: (date: Date) => Date;

  /**
   * Get date with first day of current year
   */
  beginOfYear: () => Date;

  /**
   * Get Date with last day of current year
   */
  endOfYear: () => Date;

  /**
   * Get date with first day of previous year
   */

  beginOfLastYear: () => Date;

  /**
   * Get Date with last day of previous year
   */
  endOfLastYear: () => Date;

  /**
   * Fetch lookup select list by definition
   *
   * @param lookup Lookup definition object
   * @param callback Callback function called with result
   */
  withLookupList: (
    lookup: unknown,
    callback: (items: Array<Record<string, unknown>>) => void
  ) => void;

  /**
   * Fetch lookup single element by definition and id
   *
   * @param lookup Lookup definition object
   * @param id Id of lookup element
   * @param callback Callback function called with result
   */
  withLookupById: (
    lookup: unknown,
    id: string,
    callback: (item?: Record<string, unknown>) => void
  ) => void;

  /**
   * Fetch autocomplete list by definition
   *
   * @param autocomplete Autocomplete definition object
   * @param callback Callback function called with result
   */
  withAutocompleteList: (
    autocomplete: unknown,
    callback: (items: Array<Record<string, unknown>>) => void
  ) => void;

  /**
   * Fetch JSON from url
   */
  getJson: (
    url: string,
    success: (response: unknown) => void,
    failure: (message: string) => void
  ) => void;

  /**
   * Fetch text from url
   */
  getText: (
    url: string,
    success: (response: string) => void,
    failure: (message: string) => void
  ) => void;

  /**
   * Find coordinates for adress
   */
  geocodeAddress: (
    address: string,
    callback: (location: { lat: number; lng: number }) => void
  ) => void;

  /**
   * Find adress for coordinates
   */
  geocodeLocation: (
    location: { lat: number; lng: number },
    callback: (
      addresses: Array<{
        street?: string;
        houseNumber?: string;
        zipCode?: string;
        city?: string;
        country?: string;
      }>
    ) => void
  ) => void;
}
