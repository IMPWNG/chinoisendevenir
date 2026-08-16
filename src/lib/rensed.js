import { Resend } from "resend";

const resendLog = import.meta.env.VITE_RESEND_API_KEY;

export const resend = Resend(resendLog);