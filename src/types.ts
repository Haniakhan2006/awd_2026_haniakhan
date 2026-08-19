export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: string;
  createdAt: string;
  location?: string;
  isDemo?: boolean;
}

export interface DiseaseReport {
  id?: string;
  userId: string;
  cropName: string;
  imageUrl: string;
  diseaseName: string;
  confidence: number;
  severity: "Low" | "Medium" | "High" | "Critical";
  cause: string;
  symptoms: string[];
  organicTreatment: string[];
  chemicalTreatment: string[];
  medicine: string;
  dosage: string;
  estimatedCost: string;
  safetyPrecautions: string[];
  weatherEffect: string;
  fertilizer: string;
  irrigation: string;
  yieldImpact: string;
  prevention: string[];
  healthScore: number;
  reasoning: string[];
  createdAt: string;
  droneUploaded?: boolean;
  qrCode?: string;
}

export interface DiseaseDatabaseEntry {
  id?: string;
  name: string;
  scientificName?: string;
  type: "Fungus" | "Virus" | "Bacteria" | "Pest" | "Nutrient Deficiency" | "Water Stress" | "Temperature" | "Humidity";
  symptoms: string[];
  organicTreatment: string[];
  chemicalTreatment: string[];
  prevention: string[];
  imageUrl: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  audioUrl?: string;
}

export interface ChatSession {
  id?: string;
  userId: string;
  language: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface CalendarTask {
  id?: string;
  userId: string;
  cropName: string;
  taskType: "Sowing" | "Fertilizer" | "Irrigation" | "Harvest";
  taskName: string;
  date: string;
  completed: boolean;
  notes?: string;
}

export interface NotificationAlert {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: "disease_alert" | "weather_alert" | "irrigation_alert";
  read: boolean;
  createdAt: string;
}

export interface FarmRecordLog {
  id?: string;
  userId: string;
  cropName: string;
  season: string;
  area: string;
  sowingDate: string;
  harvestDate?: string;
  expenses: number;
  harvestAmount?: number;
  revenue?: number;
  createdAt: string;
}

export interface CommunityPost {
  id?: string;
  userId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  imageUrl?: string;
  likes: string[]; // User IDs
  aiSummary?: string;
  createdAt: string;
  commentsCount?: number;
}

export interface PostComment {
  id?: string;
  userId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  createdAt: string;
}
