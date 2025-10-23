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
  <Card className={"bg-gradient-to-t from-[var(--card)] to-gray /5 dark:to-white/10 rounded-2xl h-[9rem] p-5 flex flex-col items-stretch justify-between " + (className || "") }>
      <CardContent className="p-0 flex flex-col w-full h-full">
        <div className="flex flex-row items-start w-full flex-1">
          <div className="flex flex-col justify-start flex-1 gap-1">
            <span className="text-sm text-card-foreground mb-1">{label}</span>
            <span className="text-2xl font-bold text-card-foreground tracking-tight leading-tight">{typeof count === 'number' ? count.toLocaleString() : count}</span>
          </div>
          <div className="flex items-start pt-1">
            {/* Icon positioned at top right */}
            {icon && React.isValidElement(icon)
              ? React.cloneElement(
                  icon as React.ReactElement<{ className?: string }>,
                  {
                    className: ((icon as React.ReactElement<{ className?: string }>).props.className || "") + " w-10 h-10 min-w-[2.5rem] min-h-[2.5rem]"
                  }
                )
              : icon}
          </div>
        </div>
        {/* Progress bar and percentage below main row, full width */}
        {typeof percent === 'number' && (
          <div className="w-full mt-3">
            <Progress className="text-blue-500 h-2" value={percent} />
            <div className="text-xs text-primary mt-2 text-right font-medium">{percent}%</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
