import handler from "@/lib/api/resend-webhook";
import { adaptVercelHandler } from "@/lib/adaptVercelHandler";

const adapted = adaptVercelHandler(handler);

export const GET = adapted;
export const POST = adapted;
