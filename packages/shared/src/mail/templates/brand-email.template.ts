export type BrandEmailInput = {
  preheader?: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
};

const COLORS = {
  background: '#0a0a0a',
  card: '#181818',
  border: '#ffffff1a',
  foreground: '#fafafa',
  muted: '#a3a3a3',
  accent: '#ea580c',
};

/**
 * Template de email com a mesma identidade visual do site (fundo escuro,
 * logo "BookTattoo" e destaque laranja). Usa apenas estilos inline e
 * tabelas, compatível com a maioria dos clientes de email.
 */
export function renderBrandEmail(input: BrandEmailInput): string {
  const { preheader, heading, bodyHtml, ctaLabel, ctaUrl, footerNote } = input;

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${heading}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${COLORS.background};font-family:Helvetica,Arial,sans-serif;">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>` : ''}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.background};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:${COLORS.card};border:1px solid ${COLORS.border};border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 0 32px;">
                <span style="font-size:22px;font-weight:700;color:${COLORS.foreground};">
                  Book<span style="color:${COLORS.accent};">Tattoo</span>
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 8px 32px;">
                <h1 style="margin:0;font-size:20px;line-height:1.4;color:${COLORS.foreground};">${heading}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 8px 32px;font-size:14px;line-height:1.6;color:${COLORS.muted};">
                ${bodyHtml}
              </td>
            </tr>
            ${
              ctaLabel && ctaUrl
                ? `<tr>
              <td style="padding:24px 32px 8px 32px;">
                <a href="${ctaUrl}" style="display:inline-block;background-color:${COLORS.accent};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:6px;">${ctaLabel}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 32px 32px;font-size:12px;line-height:1.6;color:${COLORS.muted};word-break:break-all;">
                Ou copie e cole este link no navegador:<br />
                <a href="${ctaUrl}" style="color:${COLORS.accent};">${ctaUrl}</a>
              </td>
            </tr>`
                : `<tr><td style="padding-bottom:24px;"></td></tr>`
            }
          </table>
          ${
            footerNote
              ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
            <tr>
              <td style="padding:16px 32px;font-size:12px;line-height:1.6;color:${COLORS.muted};text-align:center;">${footerNote}</td>
            </tr>
          </table>`
              : ''
          }
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
