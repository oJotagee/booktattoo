import DashboardHeader from './_components/header';

export default function Dashboard() {
  const date = Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date());

  return (
    <>
      <DashboardHeader title="Dashboard" subtitle={date} />
      <h1>Dashboard</h1>
    </>
  );
}
