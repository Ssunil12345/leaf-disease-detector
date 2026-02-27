export interface LeafResult {
  plantName: string;
  diseaseName: string;
  confidence: number;
  pesticideSuggestions: string[];
  timestamp: number;
  image: string;
}

export interface HistoryItem extends LeafResult {
  id: string;
}

export interface PesticideData {
  [disease: string]: string[];
}
