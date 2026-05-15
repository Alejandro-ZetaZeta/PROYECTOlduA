import type { activateUleam } from "../content";

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

        <div className="mt-4 flex flex-col gap-1.5 text-sm text-muted sm:flex-row sm:items-center sm:gap-4">
          <p>{footer.contacts.join(" / ")}</p>
          <span
            className="hidden sm:inline"
            style={{ color: "rgba(255,255,255,0.18)" }}
          >
            ·
          </span>
          <p>{footer.social}</p>
        </div>

        <p className="mt-8 text-[0.6rem] tracking-[0.35em] text-gold/40">
          LDU-A ULEAM
        </p>
      </div>
    </footer>
  );
}
