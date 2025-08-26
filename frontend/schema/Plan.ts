interface Plan {
  id: string;
  name: string;
  features: PlanFeature[];
  price: number;
  interval: string;
}

interface PlanFeature {
  name: string;
}

export type { Plan, PlanFeature };
