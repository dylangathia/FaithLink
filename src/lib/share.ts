import { toast } from "sonner";

export const appUrl = (path: string) => `${window.location.origin}${path}`;
export const joinUrl = (code: string) => appUrl(`/join/${code}`);
export const inviteUrl = (token: string) => appUrl(`/invite/${token}`);

const digits = (phone?: string | null) => (phone ?? "").replace(/\D/g, "");

export const whatsappLink = (text: string, phone?: string | null) =>
  `https://wa.me/${digits(phone)}?text=${encodeURIComponent(text)}`;

export const smsLink = (text: string, phone?: string | null) =>
  `sms:${digits(phone) ? `+${digits(phone)}` : ""}?&body=${encodeURIComponent(text)}`;

export const emailLink = (subject: string, body: string, to?: string | null) =>
  `mailto:${to ?? ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export const copyToClipboard = async (text: string, label = "Copied") => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(label);
  } catch {
    toast.error("Couldn't copy — select and copy it manually");
  }
};
