/**
 * Approval workflow types
 */

export interface Approval {
  id: string;
  approvable_type: string;
  approvable_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProvisioningTask {
  id: string;
  approval_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}
