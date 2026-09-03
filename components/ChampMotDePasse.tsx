"use client";

import { useState } from "react";

export default function ChampMotDePasse({
  value,
  onChange,
  placeholder,
  required,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        required={required}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-lg bg-surface pl-4 pr-12 text-base text-encre shadow-legere"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-encre-douce"
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      >
        {visible ? <IconeOeilBarre /> : <IconeOeil />}
      </button>
    </div>
  );
}

function IconeOeil() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconeOeilBarre() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c7 0 10.5 7 10.5 7a13.3 13.3 0 0 1-3.1 3.9M6.6 6.6C3.4 8.5 1.5 12 1.5 12s3.5 7 10.5 7a10.3 10.3 0 0 0 4.4-.9" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}
