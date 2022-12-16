/**
 * Reference of toolbar item
 */
 export interface ToolbarItemRef {
    /**
     * Set option value of toolbar item component
     * @param option Identifier of option
     * @param value New value of option
     */
    setOption: (option: string, value: unknown) => void;
  
    /**
     * Get option value of toolbar item component
     * @param option Identifier of option
     */
    getOption: (option: string) => any;
  }