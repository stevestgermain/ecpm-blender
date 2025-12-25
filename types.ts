export interface LineItem {
  id: string;
  budget: number | '';
  cpm: number | '';
}

export interface BlenderResult {
  totalBudget: number;
  totalImpressions: number;
  blendedEcpm: number;
}
