export const CONTACT_FROM_EMAIL = "contact@chinoisendevenir.com";
export const ADMIN_NOTIFY_EMAIL = "chinoisendevenir@gmail.com";

// Adresse qui DOIT arriver dans Resend Receiving (pas Gmail).
// Exemple : replies@inbound.chinoisendevenir.com ou xxx@yyyy.resend.app
export const INBOUND_REPLY_TO =
  process.env.RESEND_INBOUND_EMAIL || CONTACT_FROM_EMAIL;
