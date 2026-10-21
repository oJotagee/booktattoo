import { steps } from './how-works';

export const faq = [
  {
    question: 'O BookTattoo é um estúdio de tatuagem?',
    answer:
      'Não. O BookTattoo é uma plataforma de agendamento. Cada tatuador cadastrado publica os próprios flashes, define os horários e atende no próprio estúdio.',
  },
  {
    question: 'Como agendar um flash tattoo no BookTattoo?',
    answer: steps.map((step) => `${step.title}: ${step.description}`).join(' '),
  },
  {
    question: 'Como funciona o pagamento do sinal?',
    answer:
      'O sinal é pago online com cartão de crédito no checkout seguro do Stripe. O valor restante do flash é pago direto ao tatuador, no dia da sessão.',
  },
  {
    question: 'Por quanto tempo meu horário fica reservado?',
    answer:
      'Ao seguir para o pagamento, o horário fica reservado por 30 minutos. Se o sinal não for pago nesse prazo, o horário volta a ficar disponível.',
  },
  {
    question: 'Onde vou ser atendido?',
    answer:
      'No estúdio do tatuador que publicou o flash. Depois do agendamento, ele recebe seu nome, e-mail e telefone para combinar os detalhes da sessão.',
  },
  {
    question: 'Sou tatuador. Como publico meus flashes?',
    answer:
      'Crie uma conta pelo botão Painel, ative um plano, cadastre os seus flashes e conecte uma conta Stripe para receber os sinais online.',
  },
];

export function Faq() {
  return (
    <section id="faq" className="relative w-full py-14 px-6 md:px-28 md:py-22 scroll-mt-20">
      <p className="text-orange-600/80 uppercase text-md mb-5 tracking-widest">Dúvidas</p>
      <h2 className="text-white text-3xl md:text-4xl font-bold md:w-sm">Perguntas frequentes</h2>

      <dl className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {faq.map((item) => (
          <div key={item.question} className="space-y-2">
            <dt className="text-white text-lg font-semibold">{item.question}</dt>
            <dd className="text-white/70 text-sm md:text-base leading-relaxed">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
