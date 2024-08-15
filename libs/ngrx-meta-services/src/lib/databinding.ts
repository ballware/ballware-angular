/**
 * Find property value in a dot separated path of object tree
 * @param item Root item of object tree
 * @param dataMember Dot separated path of data property in tree
 * @returns Value of property if found in tree
 */
 export const getByPath = (
    item: Record<string, unknown>,
    dataMember: string
  ): unknown => {
    const path = dataMember?.split('.');
  
    if (path) {
      let pathSubitem: unknown = item;
  
      for (let idx = 0; idx < path.length; idx++) {
        const pathElement = path[idx];
  
        if (pathSubitem) {
          pathSubitem = (pathSubitem as Record<string, unknown>)[pathElement];
        }
      }
  
      return pathSubitem;
    }
  
    return undefined;
  };
  
  /**
   * Set property value in a dot separated path of object tree
   * @param item Root item of object tree
   * @param dataMember Dot separated path of data property in tree
   * @param value New value of property
   */
  export const setByPath = (
    item: Record<string, unknown>,
    dataMember: string,
    value: unknown
  ): void => {
    const path = dataMember?.split('.');
  
    if (path) {
      let pathSubitem: unknown = item;
  
      for (let idx = 0; idx < path.length - 1; idx++) {
        const pathElement = path[idx];
  
        if (pathSubitem) {
          if (!(pathSubitem as Record<string, unknown>)[pathElement]) {
            (pathSubitem as Record<string, unknown>)[pathElement] = {};
          }
  
          pathSubitem = (pathSubitem as Record<string, unknown>)[pathElement];
        }
      }
  
      (pathSubitem as Record<string, unknown>)[path[path.length - 1]] = value;
    }
  };