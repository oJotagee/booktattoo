import { HowWorks } from './_components/how-works';
import { Footer } from './_components/footer';
import { Header } from './_components/header';
import { Galery } from './_components/galery';
import { Hero } from './_components/hero';
import { Team } from './_components/team';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />

      <Hero />

      <HowWorks />

      <Galery />

      <Team />

      <Footer />
    </div>
  );
}
