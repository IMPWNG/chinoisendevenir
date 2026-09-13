export const CONTACT_FROM_EMAIL = "contact@chinoisendevenir.com";
export const CONTACT_FROM_NAME = "Chinois en Devenir";
export const CONTACT_FROM = `${CONTACT_FROM_NAME} <${CONTACT_FROM_EMAIL}>`;
// Sert uniquement à ignorer les boucles, plus à envoyer de copies vers Gmail.
export const ADMIN_NOTIFY_EMAIL = "chinoisendevenir@gmail.com";

export const INBOUND_REPLY_TO =
  process.env.RESEND_INBOUND_EMAIL || CONTACT_FROM_EMAIL;
