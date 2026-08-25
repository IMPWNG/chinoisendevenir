import { handleWhatsAppSend } from "@/lib/api/whatsapp-send";

export const maxDuration = 30;

export async function GET(request) {
  return handleWhatsAppSend(request);
}

export async function POST(request) {
  return handleWhatsAppSend(request);
}
