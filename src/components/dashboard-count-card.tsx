import { Progress } from "@/components/ui/progress";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";


interface DashboardCountCardProps {
  label: string;
  count: number;
  icon?: React.ReactNode;
  subtext?: string;
  className?: string;
  percent?: number;
}

export const DashboardCountCard: React.FC<DashboardCountCardProps> = ({ label, count, icon, className, percent }) => {
  return (
  <Card className={"bg-gradient-to-t from-[var(--card)] to-gray /5 dark:to-white/10 rounded-2xl min-h-[7.5rem] p-6 flex flex-col items-stretch justify-between " + (className || "") }>
      <CardContent className="p-0 flex flex-col w-full h-full">
        <div className="flex flex-row items-stretch w-full">
          <div className="flex flex-col justify-center flex-1 gap-1">
            <span className="text-sm text-card-foreground mb-1">{label}</span>
            <span className="text-3xl font-bold text-card-foreground tracking-tight leading-tight">{typeof count === 'number' ? count.toLocaleString() : count}</span>
          </div>
          <div className="flex items-center pl-4">
            {/* Icon is made larger and vertically centered to span about two rows */}
            {icon && React.isValidElement(icon)
              ? React.cloneElement(
                  icon as React.ReactElement<{ className?: string }>,
                  {
                    className: ((icon as React.ReactElement<{ className?: string }>).props.className || "") + " w-12 h-12 min-w-[3rem] min-h-[3rem]"
                  }
                )
              : icon}
          </div>
        </div>
        {/* Progress bar and percentage below main row, full width */}
        {typeof percent === 'number' && (
          <div className="w-full pt-4">
            <Progress className="text-blue-500"value={percent} />
            <div className="text-xs text-primary mt-1 text-right">{percent}%</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
