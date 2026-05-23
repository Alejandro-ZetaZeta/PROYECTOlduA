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
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {footer.contacts.map(({ number, message }) => {
              const waNumber = "593" + number.slice(1);
              const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
              return (
                <a
                  key={number}
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`WhatsApp ${number}`}
                  className="flex items-center gap-1.5 transition-colors duration-200 hover:text-gold"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4 shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.827L.057 23.998l6.304-1.654A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.002-1.368l-.359-.213-3.721.976.993-3.623-.234-.373A9.818 9.818 0 0 1 2.182 12c0-5.424 4.394-9.818 9.818-9.818 5.424 0 9.818 4.394 9.818 9.818 0 5.424-4.394 9.818-9.818 9.818z" />
                  </svg>
                  <span>{number}</span>
                </a>
              );
            })}
          </div>
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
