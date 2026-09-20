const steps = [
  {
    number: '01',
    title: 'Escolha o flash',
    description: 'Navegue pela galeria e escolha o design que mais combina com você.'
  },
  {
    number: '02',
    title: 'Reserve com sinal',
    description: 'Selecione data e horário, preencha seus dados e pague um sinal online para garantir sua vaga.'
  },
  {
    number: '03',
    title: 'Venha tatuar',
    description: 'Apareça no estúdio no dia marcado. O restante é pago na hora, e a arte fica para sempre.'
  }
];

export function HowWorks() {
  return (
    <section
      id="how-it-works"
      className="relative w-full py-14 px-6 md:px-28 md:py-22 bg-mist-800/20 scroll-mt-20"
    >
      <h2 className="text-orange-600/80 uppercase text-md mb-5 tracking-widest">Como funciona</h2>
      <h1 className="text-white text-3xl md:text-4xl font-bold md:w-sm">
        Simples, rápido e sem complicação
      </h1>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div key={step.number} className="space-y-4">
            <h3 className="text-white/20 text-4xl mb-2 w-fit border-b-2 border-orange-600/80 p-2 font-medium tracking-widest">
              {step.number}
            </h3>
            <p className="text-white text-lg tracking-widest font-semibold">{step.title}</p>
            <span className="text-white/70 text-sm tracking-wider">{step.description}</span>
          </div>
        ))}
      </div>
    </section>
  );
}