export type PlanId = 'BASIC' | 'PROFESSIONAL';

export type PlanLimits = {
  services: number;
  galeries: number;
};

export const TRIAL_DAYS = 7;

export const PLANS: Record<PlanId, PlanLimits> = {
  BASIC: { services: 3, galeries: 5 },
  PROFESSIONAL: { services: 20, galeries: 50 },
};

export type SubscriptionPlanInfo = {
  id: PlanId;
  name: string;
  description: string;
  oldPrice: string;
  price: string;
  features: string[];
};

export const subscriptionPlans: SubscriptionPlanInfo[] = [
  {
    id: 'BASIC',
    name: 'Básico',
    description: 'Para artistas independentes',
    oldPrice: 'R$ 57,90',
    price: 'R$ 27,90',
    features: [
      `Até ${PLANS.BASIC.services} serviços`,
      `Até ${PLANS.BASIC.galeries} produtos na galeria`,
      'Agendamentos ilimitados',
    ],
  },
  {
    id: 'PROFESSIONAL',
    name: 'Profissional',
    description: 'Para estúdios profissionais',
    oldPrice: 'R$ 142,90',
    price: 'R$ 97,90',
    features: [
      `Até ${PLANS.PROFESSIONAL.services} serviços`,
      `Até ${PLANS.PROFESSIONAL.galeries} produtos na galeria`,
      'Agendamentos ilimitados',
    ],
  },
];

export function findPlanInfo(planId: PlanId): SubscriptionPlanInfo {
  return subscriptionPlans.find((plan) => plan.id === planId) ?? subscriptionPlans[0];
}
