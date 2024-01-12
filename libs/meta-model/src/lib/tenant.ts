import { Template } from "./template";

/**
 * Navigation tree item
 */
 export interface NavigationLayoutItem {
  /**
   * Type of navigation item
   */
  type: 'page' | 'group' | 'section';

  /**
   * Options
   */
  options: {
    /**
     * Page identifier if item type is 'page'
     */
    page?: string;

    /**
     * Optional url for external page not part of application
     */
    url?: string;

    /**
     * Caption for navigation item type 'page' and 'group'
     */
    caption?: string;

    /**
     * Optional icon for navigation item type 'page' and 'group'
     */
     icon?: string;
  };

  /**
   * Collection of child items (only for 'group' and 'section')
   */
  items?: Array<NavigationLayoutItem>;
}

/**
 * Navigation layout for single tenant
 */
export interface NavigationLayout {
  /**
   * Headline for tenant application
   */
  title: string;

  /**
   * Default page activated on tenant entered
   */
  defaultUrl?: string;

  /**
   * Collection of layout items
   */
  items: Array<NavigationLayoutItem>;
}

/**
 * Metadata for tenant
 */
export interface CompiledTenant {
  /**
   * Unique identifier of tenant
   */
  id: string;

  /**
   * Display name of tenant
   */
  name: string;

  /**
   * Navigation metadata for tenant
   */
  navigation?: NavigationLayout;

  /**
   * List of tenant templates
   */
  templates?: Array<Template>;

  /**
   * Custom script for access rights check of tenant
   * @param userinfo Assigned user rights
   * @param right Requested right
   * @returns true if access allowed, false if access denied
   */
  hasRight: (userinfo: Record<string, unknown>, right: string) => boolean;
}
