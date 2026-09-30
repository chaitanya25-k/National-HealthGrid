export type Role = 'viewer' | 'manager';

export type FacilityTier = 'PHC' | 'CHC' | 'SDH' | 'DH';

export interface User {
  id: number;
  email: string;
  role: Role;
  hospital_name?: string;
  address?: string;
  state?: string;
  district?: string;
  facility_tier?: FacilityTier;
  facility_id?: number | null;
}

export interface Facility {
  id: number;
  name: string;
  tier: FacilityTier;
  state: string;
  district: string;
  address: string;
  beds_total: number;
  beds_available: number;
  icu_available: number;
  oxygen_cylinders: number;
  created_at?: string;
}

export interface Inventory {
  id?: number;
  facility_id: number;
  paracetamol_500mg: number;
  iv_fluids_500ml: number;
  ors_packets: number;
  amoxicillin_500mg: number;
  oxygen_cylinders: number;
  antivenom_vials: number;
  updated_at?: string;
}

export interface Personnel {
  id?: number;
  facility_id: number;
  doctors: number;
  nurses: number;
  anm_workers: number;
  pharmacists: number;
  updated_at?: string;
}

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'WATCH' | 'INFO';

export interface AlertNotification {
  id: string;
  facility_id: number;
  facility_name: string;
  state: string;
  district: string;
  resource: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  action_needed: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface AIPredictionRisk {
  resource: string;
  risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'WATCH';
  days_remaining?: number;
  current_stock?: number;
  current_occupancy?: string;
  available_beds?: number;
  projected_shortfall?: number;
  reason: string;
}

export interface AIPredictionRecommendation {
  type: 'REDISTRIBUTION' | 'STAFF_DEPLOYMENT' | 'PROCUREMENT_BUFFER' | 'TRIAGE_DIVERSION';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  detail: string;
  action_button?: string;
  source_facility?: string;
  target_facility?: string;
  suggested_quantity?: string;
  transit_eta?: string;
}

export interface FederatedModelOutbreakIndex {
  condition: string;
  surge_coefficient: number;
  risk_level: 'HIGH' | 'MODERATE' | 'LOW';
  affected_districts: string[];
  recommended_stock_multiplier: number;
}

export interface FederatedModelStatus {
  federated_round: number;
  participating_states: number;
  reporting_phcs: number;
  model_consensus_score: number;
  differential_privacy_epsilon: number;
  last_federated_sync: string;
  outbreak_indices: FederatedModelOutbreakIndex[];
}

export interface AIPredictionResponse {
  model: string;
  facility_id: number;
  facility_name: string;
  tier: FacilityTier;
  state: string;
  district: string;
  forecast_horizon_days: number;
  confidence_score: number;
  generated_at: string;
  risks: AIPredictionRisk[];
  recommendations: AIPredictionRecommendation[];
  federated_status: FederatedModelStatus;
  operational_metrics: {
    occupancy_rate: string;
    active_workforce: number;
    emergency_buffer_status: string;
  };
  human_approval_required: boolean;
  advisory_note: string;
}

export interface FacilitySummary extends Facility {
  beds_occupied: number;
  occupancy_rate: number;
  inventory: Inventory;
  personnel: Personnel;
  active_alerts: number;
}

export interface NationalOverviewResponse {
  timestamp: string;
  network_metrics: {
    total_facilities: number;
    total_phcs: number;
    total_chcs: number;
    total_dhs: number;
    total_beds: number;
    available_beds: number;
    total_icu_available: number;
    total_oxygen_cylinders: number;
    unacknowledged_alerts: number;
    medicine_availability_rate: string;
    personnel_reporting_rate: string;
  };
  federated_status: FederatedModelStatus;
  facilities: FacilitySummary[];
  critical_alerts: AlertNotification[];
}

export interface RedistributionOrder {
  id: string;
  source_facility: string;
  source_district: string;
  target_facility: string;
  target_district: string;
  resource: string;
  quantity: string;
  transit_distance_km: number;
  eta_hours: string;
  urgency: 'URGENT' | 'STANDARD' | 'CRITICAL';
  status: 'RECOMMENDED' | 'DISPATCHED' | 'RECEIVED';
  timestamp: string;
}

export interface BackendHealth {
  ok: boolean;
  database: string;
  users: number;
  facilities: number;
  notifications: number;
  version: string;
  uptime?: number;
}
