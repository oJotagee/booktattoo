import DashboardHeader from '../_components/header';

export default function PlansPage() {
  return (
    <>
      <DashboardHeader title="Planos" subtitle="Gerencie sua assinatura" />

      <h1 className="text-xl font-bold md:hidden">Planos</h1>
      <h2 className="text-white/30 text-sm mb-4 md:hidden">Gerencie sua assinatura</h2>
    </>
  );
}
