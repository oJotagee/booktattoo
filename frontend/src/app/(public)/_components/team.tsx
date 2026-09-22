import Image from 'next/image';

const team = [
  {
    name: 'Ana Lima',
    role: 'Tradicional & Neo',
    img: '/team-1.jpg',
  },
  {
    name: 'Kenji Mori',
    role: 'Japonês & Chicano',
    img: '/team-2.jpg',
  },
  {
    name: 'Pedro Ink',
    role: 'Blackwork',
    img: '/team-3.jpg',
  },
  {
    name: 'Sara Valle',
    role: 'Fineline & Mini',
    img: '/team-4.jpg',
  },
];

export function Team() {
  return (
    <section className="relative w-full py-14 px-6 md:px-28 md:py-22 bg-mist-800/20">
      <h2 className="text-orange-600/80 uppercase text-md mb-5 tracking-widest">Equipe</h2>
      <h1 className="text-white text-3xl md:text-4xl font-bold md:w-sm">Nossos artistas</h1>

      <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {team.map((member, index) => (
          <div key={index}>
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden">
              <Image src={member.img} alt={member.name} fill className="object-cover" />
            </div>
            <div className="flex flex-col items-center p-4">
              <span className="text-white font-medium truncate">{member.name}</span>
              <span className="text-white/30 text-sm">{member.role}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
