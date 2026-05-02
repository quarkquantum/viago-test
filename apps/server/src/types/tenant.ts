export type AgencyStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export interface AgencyWithDetails {
  id: string;
  name: string;
  slug: string;
  status: AgencyStatus;
}
