import { Resend } from "resend";

export async function envoyerEmail(params: {
  a: string;
  repondreA?: string | null;
  objet: string;
  texte: string;
}) {
  const cleApi = process.env.RESEND_API_KEY;
  if (!cleApi) {
    throw new Error("RESEND_API_KEY manquante");
  }

  const resend = new Resend(cleApi);

  return resend.emails.send({
    from: process.env.RESEND_FROM || "Compagnon <onboarding@resend.dev>",
    to: params.a,
    replyTo: params.repondreA || undefined,
    subject: params.objet,
    text: params.texte,
  });
}
