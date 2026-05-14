import type { activateUleam } from "../content";

type Props = {
  footer: (typeof activateUleam)["footer"];
};

export function EventFooter({ footer }: Props) {
  return (
    <footer className="mx-auto w-full max-w-6xl px-6 pb-14 sm:px-10">
      <div className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card p-6">
        <p className="text-sm leading-6 text-foreground/90">{footer.organizedBy}</p>

        <div className="flex flex-col gap-1 text-sm text-muted sm:flex-row sm:items-center sm:gap-3">
          <p>Mas informacion: {footer.contacts.join(" / ")}</p>
          <span className="hidden text-muted/60 sm:inline">·</span>
          <p>{footer.social}</p>
        </div>
      </div>
    </footer>
  );
}
