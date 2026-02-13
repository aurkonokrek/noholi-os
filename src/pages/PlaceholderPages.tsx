const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="space-y-5">
    <div>
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      <p className="text-[13px] text-muted-foreground">
        This section is under development.
      </p>
    </div>
    <div className="bg-card border border-border rounded p-8 text-center text-muted-foreground text-sm">
      Content for {title} will appear here.
    </div>
  </div>
);

export const Fines = () => <PlaceholderPage title="Fines" />;
export const Reports = () => <PlaceholderPage title="Reports" />;
export const SettingsPage = () => <PlaceholderPage title="Settings" />;
