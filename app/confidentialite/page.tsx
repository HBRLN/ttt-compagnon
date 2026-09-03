import Link from "next/link";

export default function PageConfidentialite() {
  return (
    <div className="flex min-h-dvh flex-col pb-10">
      <header className="flex items-center gap-2 px-4 pt-6 pb-2">
        <Link
          href="/"
          className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-500 active:bg-neutral-100"
          aria-label="Retour"
        >
          ←
        </Link>
        <h1 className="text-lg font-semibold">Confidentialité</h1>
      </header>

      <div className="flex flex-col gap-4 px-5 pt-2 text-neutral-700">
        <p>
          Cette application est utilisée par ton tatoueur pour organiser ses
          rendez-vous. Voici ce qui est fait de tes données.
        </p>

        <section>
          <h2 className="font-medium text-neutral-900">Ce qui est collecté</h2>
          <p>
            Prénom, nom, téléphone, email, et les informations liées au
            rendez-vous (date, projet, emplacement, tarif, notes du tatoueur).
          </p>
        </section>

        <section>
          <h2 className="font-medium text-neutral-900">Pourquoi</h2>
          <p>
            Uniquement pour organiser le rendez-vous et t&apos;envoyer les emails
            de confirmation et de rappel qui s&apos;y rapportent.
          </p>
        </section>

        <section>
          <h2 className="font-medium text-neutral-900">Combien de temps</h2>
          <p>
            Les rendez-vous sont conservés 3 ans, puis supprimés
            automatiquement.
          </p>
        </section>

        <section>
          <h2 className="font-medium text-neutral-900">Comment demander la suppression</h2>
          <p>
            Écris directement à ton tatoueur — il peut supprimer tes données à
            tout moment depuis l&apos;application.
          </p>
        </section>
      </div>
    </div>
  );
}
