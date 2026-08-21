import handler from "@/lib/api/resend-webhook";
import { adaptVercelHandler } from "@/lib/adaptVercelHandler";

export const maxDuration = 30;

const adapted = adaptVercelHandler(handler);

const adapted = adaptVercelHandler(handler);

export const GET = adapted;
export const POST = adapted;
