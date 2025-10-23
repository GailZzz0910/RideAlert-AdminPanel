import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 py-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}

// Enhanced Card Variants
export function InteractiveCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 hover:border-primary/20",
        className
      )}
      {...props}
    />
  )
}

export function GradientCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Card
      className={cn(
        "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-0",
        className
      )}
      {...props}
    />
  )
}

export function HighlightCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Card
      className={cn(
        "border-l-4 border-l-primary bg-primary/5 dark:bg-primary/10",
        className
      )}
      {...props}
    />
  )
}

export function StatCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Card
      className={cn(
        "text-center p-8 hover:shadow-lg transition-all duration-200 hover:-translate-y-1",
        className
      )}
      {...props}
    />
  )
}
