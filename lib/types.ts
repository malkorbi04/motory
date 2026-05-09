export type CarStatus = "pending" | "available" | "sold";
export type ConditionType = "New" | "Used";

export interface Car {
  id: string;
  carTitle?: string;
  make: string;
  model: string;
  trim?: string;
  year: number;
  price: number;
  km: number;
  color?: string;
  cylinders?: number;
  transmission?: string;
  fuelType?: string;
  conditionType?: ConditionType;
  paintCondition?: string;
  warranty?: string;
  engineCondition?: string;
  gearCondition?: string;
  chassisCondition?: string;
  interiorColor?: string;
  seatType?: string;
  mainPhotoUrl?: string;
  morePhotoUrls?: string[];
  inspectionReportUrl?: string;
  status: CarStatus;
  submittedById?: string;
  submittedByName?: string;
  submittedByPhone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CarFormData = Omit<Car, "id" | "carTitle" | "createdAt" | "updatedAt">;
