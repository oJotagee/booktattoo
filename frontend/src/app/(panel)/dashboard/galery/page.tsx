import DashboardHeader from '../_components/header';

export default function GaleryPage() {
  return (
    <>
      <DashboardHeader title="Galeria" subtitle="Gerencie sua galeria" />

      <h1 className="text-xl font-bold md:hidden">Galeria</h1>
      <h2 className="text-white/30 text-sm mb-4 md:hidden">Gerencie sua galeria</h2>
    </>
  );
}
