import { QueryParams } from './queryparams';
import { ScriptUtil } from './scriptutil';

/**
 * Options for line/bar chart
 */
export interface StatisticChartOptions {
  /**
   * Horizontal value bars
   */
  rotated?: boolean;

  /**
   * Property in data containing argument value
   */
  argumentField: string;

  /**
   * Options for argument axis
   */
  argumentAxis?: {
    /**
     * Data type of argument values
     */
    argumentType: 'datetime' | 'numeric' | 'string';

    /**
     * Start value of visual range displayed
     */
    visualRangeFrom?: number;

    /**
     * End value of visual range displayed
     */
    visualRangeTo?: number;

    /**
     * Options for setting tick interval
     */
    tickInterval?: {
      days?: any;
      hours?: any;
      milliseconds?: any;
      minutes?: any;
      months?: any;
      quarters?: any;
      seconds?: any;
      weeks?: any;
      years?: any;
    };

    /**
     * Define constant lines on argument axis in chart
     */
    lines?: Array<{
      /**
       * Constant line argument value
       */
      value: number;

      /**
       * Constant line color
       */
      color: string;

      /**
       * Constant line style
       */
      dashStyle: 'dash' | 'dot' | 'longDash' | 'solid';

      /**
       * Optional label text
       */
      labelText?: string;
    }>;
  };

  /**
   * Options for value axis
   */
  valueAxis?: {
    /**
     * Define constant lines on value axis in chart
     */
    lines?: Array<{
      /**
       * Constant line value
       */
      value: number;

      /**
       * Constant line color
       */
      color: string;

      /**
       * Constant line style
       */
      dashStyle: 'dash' | 'dot' | 'longDash' | 'solid';

      /**
       * Optional label text
       */
      labelText?: string;
    }>;
  };
  /**
   * Options for legend
   */
  legend?: {
    /**
     * Optional title text in legend
     */
    title?: string;

    /**
     * Horizontal alignment of legend
     */
    horizontalAlignment?: 'center' | 'left' | 'right';

    /**
     * Vertical alignment of legend
     */
    verticalAlignment?: 'bottom' | 'top';
  };
  /**
   * Series of data
   */
  series: Array<{
    /**
     * Display type of series
     */
    type: 'bar' | 'line';

    /**
     * Series default hidden
     */
    visible?: boolean;

    /**
     * Display name of series
     */
    name: string;

    /**
     * Value property for series in data item
     */
    valueField: string;

    /**
     * Labels of series visible
     */
    labelVisible?: boolean;

    /**
     * Label value format type
     */
    format?:
      | 'billions'
      | 'currency'
      | 'day'
      | 'decimal'
      | 'exponential'
      | 'fixedPoint'
      | 'largeNumber'
      | 'longDate'
      | 'longTime'
      | 'millions'
      | 'millisecond'
      | 'month'
      | 'monthAndDay'
      | 'monthAndYear'
      | 'percent'
      | 'quarter'
      | 'quarterAndYear'
      | 'shortDate'
      | 'shortTime'
      | 'thousands'
      | 'trillions'
      | 'year'
      | 'dayOfWeek'
      | 'hour'
      | 'longDateLongTime'
      | 'minute'
      | 'second'
      | 'shortDateShortTime';

    /**
     * Precision of numeric value
     */
    precision?: number;
  }>;
}

/**
 * Options for statistic map
 */
export interface StatisticMapOptions {
  /**
   * Data item property containing location
   */
  locationField: string;

  /**
   * Data item property containing tooltip text
   */
  tooltipField: string;
}

/**
 * Options for pivot grid
 */
export interface StatisticPivotOptions {
  /**
   * Show summary values of hierarchy levels
   */
  showRowTotals?: boolean;

  /**
   * Show summary values of entire column
   */
  showRowGrandTotals?: boolean;

  /**
   * List of pivot fields
   */
  fields: Array<{
    /**
     * Display name of field
     */
    caption: string;

    /**
     * Data item property containing field value
     */
    dataField: string;

    /**
     * Pivot area to assign field to
     */
    area?: 'row' | 'column' | 'data';

    /**
     * Data type of field value
     */
    dataType?: 'date' | 'number' | 'string';

    /**
     * Optional group interval for data type date
     */

    groupInterval?: 'day' | 'dayOfWeek' | 'month' | 'quarter' | 'year';

    /**
     * Aggregate function type for summary of field
     */
    summaryType?: 'avg' | 'count' | 'custom' | 'max' | 'min' | 'sum';

    /**
     * All items expanded after pivot initialized
     */
    expanded?: boolean;

    /**
     * Show totals for field
     */
    showTotals?: boolean;

    /**
     * Show grand totals for field
     */
    showGrandTotals?: boolean;

    /**
     *
     */
    format?:
      | 'billions'
      | 'currency'
      | 'day'
      | 'decimal'
      | 'exponential'
      | 'fixedPoint'
      | 'largeNumber'
      | 'longDate'
      | 'longTime'
      | 'millions'
      | 'millisecond'
      | 'month'
      | 'monthAndDay'
      | 'monthAndYear'
      | 'percent'
      | 'quarter'
      | 'quarterAndYear'
      | 'shortDate'
      | 'shortTime'
      | 'thousands'
      | 'trillions'
      | 'year'
      | 'dayOfWeek'
      | 'hour'
      | 'longDateLongTime'
      | 'minute'
      | 'second'
      | 'shortDateShortTime';

    /**
     * Precision for numeric format
     */
    precision?: number;

    /**
     * Optional field width in pixels
     */
    width?: number;
  }>;
}

/**
 * Statistic layout item metadata
 */
export interface StatisticLayout {
  /**
   * Type of statistic layout item
   */
  type: 'chart' | 'map' | 'pivot';

  /**
   * Optional headline of item
   */
  title?: string;

  /**
   * Optional fixed width of item
   */
  height?: string;

  /**
   * Type specific options for layout item
   */
  options: StatisticChartOptions | StatisticMapOptions | StatisticPivotOptions;
}

/**
 * Customize display text for argument axis label
 * @param layout Statistic layout
 * @param value Current axis value
 * @param params Head params of containing page
 * @param customParam Prepared custom param of containing page
 * @param util Util for misc script operations
 * @returns Display text for label
 */
export type ArgumentAxisCustomizeTextFunc = (
  layout: StatisticLayout,
  value: unknown,
  params: Record<string, unknown>,
  customParam: Record<string, unknown>,
  util: ScriptUtil
) => string|undefined;

/**
 * Mapping script to prepare fetched data for statistic display
 * @param data Fetched raw data
 * @param layout Layout for display statistic
 * @param customParam Custom param prepared by containing page
 * @param params Head params by containing page
 * @param lookups Lookups prepared by containing page
 * @param util Util for misc operations in scripts
 * @param callback Callback executed after preparation of layout and data
 */
export type StatisticMappingFunc = (
  data: Array<Record<string, unknown>>,
  layout: StatisticLayout,
  customParam: Record<string, unknown>,
  params: Record<string, unknown>,
  lookups: Record<string, unknown>,
  util: ScriptUtil,
  callback: (
    layout: StatisticLayout,
    data: Array<Record<string, unknown>>
  ) => void
) => void;

/**
 * Custom scripts for statistic layout
 */
export interface CompiledStatisticCustomScripts {
  /**
   * Customize display text for argument axis label
   */
  argumentAxisCustomizeText: ArgumentAxisCustomizeTextFunc;
}

/**
 * Compiled metadta for statistic container
 */
export interface CompiledStatistic {
  /**
   * Unique identifier of statistic container
   */
  identifier: string;

  /**
   * Display name of statistic container
   */
  name: string;

  /**
   * Layout of statistic container
   */
  layout?: StatisticLayout;

  /**
   * Mapping script to prepare fetched data for statistic display
   * @param data Fetched raw data
   * @param layout Layout for display statistic
   * @param customParam Custom param prepared by containing page
   * @param params Head params by containing page
   * @param lookups Lookups prepared by containing page
   * @param util Util for misc operations in scripts
   * @param callback Callback executed after preparation of layout and data
   */
  mappingScript: StatisticMappingFunc;

  /**
   * Compiled custom scripts for statistic layout
   */
  customScripts: CompiledStatisticCustomScripts;
}
