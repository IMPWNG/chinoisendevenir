const SITE_URL = "https://chinoisendevenir.com/";

export const EMAIL_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.65;
    color: #243447;
    background: #f4f6f8;
  }
  .container {
    max-width: 640px;
    margin: 0 auto;
    background: #ffffff;
    border: 1px solid #e6e9ee;
  }
  .header {
    background: #1d3557;
    color: #ffffff;
    padding: 28px 32px;
    border-bottom: 3px solid #e63946;
  }
  .header h1 {
    font-size: 20px;
    font-weight: 650;
    letter-spacing: -0.02em;
    margin-bottom: 6px;
  }
  .header p {
    font-size: 13px;
    color: rgba(255,255,255,0.78);
  }
  .content {
    padding: 32px;
  }
  .greeting {
    font-size: 15px;
    margin-bottom: 20px;
    color: #243447;
  }
  .section {
    margin-bottom: 22px;
  }
  .section-title {
    font-size: 12px;
    font-weight: 700;
    color: #1d3557;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 10px;
  }
  .section p, .note p {
    font-size: 14.5px;
    line-height: 1.75;
    color: #3d4d5c;
    margin-bottom: 12px;
  }
  .formule-card {
    background: #ffffff;
    border: 1px solid #e6e9ee;
    border-left: 3px solid #1d3557;
    padding: 20px 22px;
    margin: 16px 0;
  }
  .formule-card.featured {
    background: #f8fafc;
    border-left-color: #e63946;
  }
  .formule-title {
    font-size: 16px;
    font-weight: 700;
    color: #1d3557;
    margin-bottom: 4px;
  }
  .formule-price {
    font-size: 14px;
    font-weight: 650;
    color: #243447;
    margin-bottom: 10px;
  }
  .formule-intro {
    font-size: 14px;
    color: #3d4d5c;
    margin-bottom: 12px;
    line-height: 1.7;
  }
  .formule-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .formule-list li {
    font-size: 13.5px;
    color: #3d4d5c;
    margin-bottom: 7px;
    padding-left: 16px;
    position: relative;
    line-height: 1.55;
  }
  .formule-list li:before {
    content: "–";
    position: absolute;
    left: 0;
    color: #1d3557;
  }
  .note {
    background: #f8fafc;
    border: 1px solid #e6e9ee;
    padding: 18px 20px;
    margin: 22px 0;
  }
  .note h4 {
    font-size: 13px;
    font-weight: 700;
    color: #1d3557;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 10px;
  }
  .note ul, .note ol {
    margin: 10px 0 0 18px;
    color: #3d4d5c;
  }
  .note li {
    font-size: 13.5px;
    margin-bottom: 6px;
    line-height: 1.55;
  }
  .cta {
    border: 1px solid #e6e9ee;
    background: #f8fafc;
    padding: 20px 22px;
    margin: 22px 0;
  }
  .cta p {
    font-size: 14.5px;
    color: #243447;
    margin-bottom: 10px;
  }
  .cta-choice {
    font-size: 14px;
    color: #1d3557;
    font-weight: 650;
    line-height: 1.8;
  }
  .cta-link {
    display: inline-block;
    margin-top: 8px;
    color: #1d3557;
    font-weight: 650;
    text-decoration: none;
    border-bottom: 1px solid #1d3557;
  }
  .footer {
    padding: 24px 32px 28px;
    border-top: 1px solid #e6e9ee;
    background: #f8fafc;
  }
  .footer p {
    font-size: 13px;
    color: #6c757d;
    margin-bottom: 6px;
  }
  .footer-brand {
    font-size: 14px;
    font-weight: 700;
    color: #1d3557;
    margin: 8px 0 10px;
  }
  .footer-link {
    color: #1d3557;
    text-decoration: none;
  }
`;

export function wrapEmailHtml({ title, subtitle, prenom, bodyHtml }) {
  const greeting = prenom
    ? `Bonjour ${escapeHtml(prenom)},`
    : "Bonjour,";

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(title)}</title>
        <style>${EMAIL_STYLES}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${escapeHtml(title)}</h1>
            ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
          </div>
          <div class="content">
            <div class="greeting"><p>${greeting}</p></div>
            ${bodyHtml}
          </div>
          <div class="footer">
            <p>Cordialement,</p>
            <div class="footer-brand">L'équipe Chinois en Devenir</div>
            <p>
              <a href="${SITE_URL}" class="footer-link">${SITE_URL}</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function plainTextToEmailBodyHtml(text) {
  const blocks = String(text || "")
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (!blocks.length) {
    return `<div class="section"><p></p></div>`;
  }

  return blocks
    .map((block) => {
      const html = escapeHtml(block).replaceAll("\n", "<br>");
      return `<div class="section"><p>${html}</p></div>`;
    })
    .join("\n");
}

export function generateCustomEmailHtml(contact, extras = {}) {
  const title =
    String(extras.customTitle || extras.customSubject || "").trim() ||
    "Votre projet d'études en Chine";
  const subtitle = String(extras.customSubtitle || "").trim();
  return wrapEmailHtml({
    title,
    subtitle,
    prenom: contact?.prenom || "",
    bodyHtml: plainTextToEmailBodyHtml(extras.customMessage),
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function sanitizeEmailSubject(value, maxLen = 180) {
  return String(value ?? "")
    .replace(/[\r\n\u0000-\u001f\u007f\u2028\u2029]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

export { SITE_URL, escapeHtml };
