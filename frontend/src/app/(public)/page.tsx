import { Footer } from './_components/footer';
import { Header } from './_components/header';
import { Hero } from './_components/hero';
import { HowWorks } from './_components/how-works';
import { Galery } from './_components/galery';
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
