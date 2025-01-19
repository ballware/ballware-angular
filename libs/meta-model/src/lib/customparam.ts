import { ScriptUtil } from "./scriptutil";

/**
 * Prepare custom param object containing values needed for other custom scripts
 *
 * @param lookups Lookup definitions prepared for business object
 * @param util Utility for performing misc operations
 * @param initialCustomParam Predefined custom param from parent
 * @param callback Async callback operation performed by custom script when custom param preparation is finished
 */
export type PrepareCustomParamFunc = (
    lookups: Record<string, unknown>,
    util: ScriptUtil,
    initialCustomParam: Record<string, unknown>,
    callback: (customParam: Record<string, unknown>) => void
  ) => void;