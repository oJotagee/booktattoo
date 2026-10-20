import type { Metadata } from 'next';
import Link from 'next/link';

import { BASE_OPEN_GRAPH, SITE_NAME } from '@/lib/site';
import { Footer } from '../_components/footer';
import { Header } from '../_components/header';

const LAST_UPDATED = '20 de outubro de 2026';

const title = 'Política de privacidade';

const description =
  'Saiba quais dados pessoais o BookTattoo coleta no cadastro e no agendamento, para que são usados, com quem são compartilhados e como exercer seus direitos pela LGPD.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/privacidade' },
  openGraph: {
    ...BASE_OPEN_GRAPH,
    url: '/privacidade',
    title: `${title} | ${SITE_NAME}`,
    description,
  },
};

const sections = [
  {
    title: '1. Quem é o controlador dos dados',
    content: [
      'O BookTattoo é operado por 62.750.951 JOAO GUILHERME SANTOS OLIVEIRA, Microempreendedor Individual inscrito no CNPJ 62.750.951/0001-35, com endereço comercial na Rua Adão Mariano Gomes, 945, Jardim Brasil, Itapetininga/SP, CEP 18214-558. Para qualquer assunto relacionado aos seus dados pessoais, fale com o nosso encarregado (DPO) pelo e-mail booktattoo4@gmail.com.',
    ],
  },
  {
    title: '2. Quais dados coletamos',
    content: [
      'Cadastro de tatuadores: nome, e-mail e senha (armazenada apenas como hash). Se você entrar com Google, recebemos nome, e-mail e foto de perfil da sua conta nesse serviço.',
      'Perfil do tatuador: foto, biografia, função, horários de atendimento e as imagens e informações dos flashes publicados.',
      'Agendamento de clientes: nome completo, e-mail, telefone, data e horário escolhidos e o flash reservado.',
      'Pagamento: o sinal é pago no checkout do Stripe. Os dados do cartão são digitados e processados diretamente pelo Stripe; o BookTattoo não recebe nem armazena o número do cartão.',
      'Dados técnicos: cookies de sessão necessários para manter o tatuador conectado ao painel.',
    ],
  },
  {
    title: '3. Para que usamos os dados',
    content: [
      'Criar e manter a conta do tatuador e exibir o seu perfil público e os seus flashes (execução de contrato).',
      'Registrar o agendamento, reservar o horário, cobrar o sinal e enviar e-mails de confirmação, cancelamento e reembolso ao cliente e ao tatuador (execução de contrato).',
      'Permitir que o tatuador entre em contato com o cliente sobre a sessão agendada (execução de contrato).',
      'Prevenir fraudes, manter a segurança da plataforma e cumprir obrigações legais e fiscais (legítimo interesse e obrigação legal).',
    ],
  },
  {
    title: '4. Com quem compartilhamos',
    content: [
      'Com o tatuador responsável pelo flash agendado, que recebe os dados do cliente para realizar o atendimento.',
      'Com prestadores de serviço que operam dados em nosso nome: Stripe (pagamentos), Google (login social), Amazon Web Services (armazenamento de imagens) e Vercel (hospedagem do site). Alguns desses fornecedores podem tratar dados fora do Brasil, com as salvaguardas previstas na LGPD.',
      'Com autoridades públicas, quando houver obrigação legal ou ordem judicial.',
      'Não vendemos dados pessoais.',
    ],
  },
  {
    title: '5. Por quanto tempo guardamos',
    content: [
      'Os dados da conta ficam armazenados enquanto ela estiver ativa. Os dados de agendamentos e pagamentos são mantidos pelo prazo necessário para cumprir obrigações legais, fiscais e de defesa em eventuais disputas. Depois disso, são excluídos ou anonimizados.',
    ],
  },
  {
    title: '6. Seus direitos',
    content: [
      'Pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018, art. 18), você pode pedir: confirmação de que tratamos seus dados, acesso, correção, anonimização, bloqueio ou eliminação de dados desnecessários, portabilidade, informação sobre compartilhamentos e revisão de consentimentos.',
      'Envie o pedido para booktattoo4@gmail.com. Responderemos em até 15 dias. Você também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).',
    ],
  },
  {
    title: '7. Cookies',
    content: [
      'Usamos apenas cookies essenciais para autenticação no painel do tatuador. Não usamos cookies de publicidade nem de rastreamento de terceiros.',
    ],
  },
  {
    title: '8. Segurança',
    content: [
      'O site é servido apenas por HTTPS, as senhas são armazenadas como hash e o acesso aos dados é restrito ao necessário para cada função.',
    ],
  },
  {
    title: '9. Alterações desta política',
    content: [
      'Podemos atualizar esta política quando houver mudanças no serviço ou na legislação. A data da última atualização fica sempre indicada nesta página.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />

      <main className="w-full pt-32 pb-14 px-6 md:px-28 md:pb-22">
        <div className="border-b border-white/10 pb-10">
          <p className="text-orange-600/80 uppercase text-md mb-5 tracking-widest">Privacidade</p>
          <h1 className="text-white text-4xl md:text-6xl font-semibold leading-tight">
            Política de privacidade
          </h1>
          <p className="mt-6 text-white/50 text-sm md:text-base">
            Última atualização: {LAST_UPDATED}
          </p>
        </div>

        <div className="mt-10 max-w-3xl space-y-10">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-white text-xl md:text-2xl font-semibold">{section.title}</h2>
              {section.content.map((paragraph) => (
                <p key={paragraph} className="text-white/70 text-sm md:text-base leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <p className="text-white/50 text-sm">
            Dúvidas sobre agendamentos?{' '}
            <Link href="/galery" className="text-orange-500 hover:underline">
              Veja a galeria
            </Link>{' '}
            ou fale com o tatuador responsável pelo flash.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
