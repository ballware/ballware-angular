/**
 * Reference of edit item
 */
 export interface EditItemRef {
    /**
     * Set option value of edit item component
     * @param option Identifier of option
     * @param value New value of option
     */
    setOption(option: string, value: unknown): void;

    /**
     * Get option value of edit item component
     * @param option Identifier of option
     */
    getOption(option: string): unknown;
  }
