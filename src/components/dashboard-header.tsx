import { ModeToggle } from "./mode-toggle";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

export function DashboardHeader({
  title = "Dashboard",
  subtitle = "Welcome to your dashboard. Manage your vehicles and view their status in real time."
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-foreground mt-1">{subtitle}</p>
      </div>
      <ModeToggle />
    </div>
  );
}
