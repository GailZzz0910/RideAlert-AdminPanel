import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { useState } from "react";

const routes = ["Igpit - Cogon", "Cogon - Igpit", "Other Route"];
const statuses = ["Available", "Unavailable", "In Service", "Maintenance"];

export default function AddVehicle() {
  const [selectedRoute, setSelectedRoute] = useState(routes[0]);
  const [selectedStatus, setSelectedStatus] = useState(statuses[0]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  return (
    <ScrollArea className="bg-background h-screen w-full ">
      <div className="flex w-full h-full flex-1 items-center justify-center text-card-foreground">
        <div className="flex flex-col justify-between w-full h-full rounded-xl p-12">
          <div className="flex w-full justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground mb-6">
                Fill in the details below to add a new vehicle.
              </p>
            </div>
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded-lg cursor-pointer"
              form="add-vehicle-form"
            >
              Save Vehicle
            </Button>
          </div>
          <form id="add-vehicle-form" className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start flex-1">
            <div className="flex flex-col gap-7 justify-center h-full md:col-span-1">
              <div className="flex flex-col gap-2">
                <Label htmlFor="plate">Plate:</Label>
                <Input
                  id="plate"
                  type="text"
                  placeholder="Enter vehicle plate number"
                  required
                  className="bg-card"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="driver">Driver:</Label>
                <Input
                  id="driver"
                  type="text"
                  placeholder="Enter driver name"
                  required
                  className="bg-card"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="route">Route Assigned:</Label>
                <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {routes.map((route) => (
                      <SelectItem key={route} value={route}>
                        {route}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="capacity">Capacity:</Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  placeholder="Enter capacity"
                  required
                  className="bg-card"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Status:</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Current Location:</Label>
                <span className="text-base font-medium">Auto-detect via GPS</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <svg
                    width="12"
                    height="12"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="12" fill="#888" />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dy=".3em"
                      fontSize="8"
                      fill="#fff"
                    >
                      i
                    </text>
                  </svg>
                  ETA will be calculated automatically based on GPS data
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ScrollArea>
  );
}
