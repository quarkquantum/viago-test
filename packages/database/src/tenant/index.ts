/**
 * @deprecated This module is deprecated.
 * The system now uses a single shared database with agency_id for data separation.
 * Use AgencyScopeOptions and related functions from './query-scope' instead.
 */

export type { AgencyScopeOptions } from './query-scope';
export { createAgencyFilter, getAgencyScope, withAgencyScope } from './query-scope';
