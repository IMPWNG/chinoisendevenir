import handler from "@/lib/api/auto-reply";
import { adaptVercelHandler } from "@/lib/adaptVercelHandler";

const adapted = adaptVercelHandler(handler);

export const POST = adapted;
export const OPTIONS = adapted;
