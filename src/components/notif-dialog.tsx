import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";

const dummyNotifications = [
  {
    id: 1,
    title: "Vehicle Alert",
    description: "Vehicle #1234 has left the designated area.",
    time: "2 min ago"
  },
  {
    id: 2,
    title: "Trip Completed",
    description: "Trip #5678 has been completed successfully.",
    time: "10 min ago"
  },
  {
    id: 3,
    title: "New Feature",
    description: "You can now track multiple vehicles at once!",
    time: "1 hour ago"
  }
];

export default function NotifDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="relative p-2 rounded-lg transition-colors cursor-pointer"
          variant="ghost"
          size="icon"
        >
          <Bell className="w-5 h-5 text-primary" strokeWidth={2} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
  <DropdownMenuLabel className="text-1xl font-bold">Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {dummyNotifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
        ) : (
          dummyNotifications.map((notif, idx) => (
            <>
              <DropdownMenuItem key={notif.id} className="flex flex-col items-start py-4 gap-1 cursor-default select-none">
                <span className="font-bold text-lg">{notif.title}</span>
                <span className="text-base text-gray-700 dark:text-gray-300">{notif.description}</span>
                <span className="text-sm text-gray-400">{notif.time}</span>
              </DropdownMenuItem>
              {idx < dummyNotifications.length - 1 && (
                <DropdownMenuSeparator className="mx-4" />
              )}
            </>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
