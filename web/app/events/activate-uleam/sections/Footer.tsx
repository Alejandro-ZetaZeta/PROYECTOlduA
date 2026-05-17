import type { activateUleam } from "../content";

const SOCIAL_URL = "https://www.instagram.com/dirigenciauleamchone/";

const socials = [
  {
    label: "Facebook",
    href: SOCIAL_URL,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: SOCIAL_URL,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: SOCIAL_URL,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.82a4.85 4.85 0 0 1-1.01-.13z" />
      </svg>
    ),
  },
];

type Props = {
  footer: (typeof activateUleam)["footer"];
};

export function EventFooter({ footer }: Props) {
  return (
    <footer className="mx-auto w-full max-w-6xl px-6 pb-16 sm:px-10">
      <div className="border-t border-card-border pt-10">
        <p className="text-sm leading-[1.75] text-foreground/80">
          {footer.organizedBy}
        </p>

        <div className="mt-4 flex flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:gap-4">
          <p>{footer.contacts.join(" / ")}</p>
          <span className="hidden sm:inline" style={{ color: "rgba(255,255,255,0.18)" }}>·</span>
          <div className="flex items-center gap-4">
            {socials.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-muted transition-colors duration-200 hover:text-gold"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        <p className="mt-8 text-[0.6rem] tracking-[0.35em] text-gold/40">
          LDU-A ULEAM
        </p>
      </div>
    </footer>
  );
}
