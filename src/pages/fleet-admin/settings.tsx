
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Settings() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <ScrollArea className="bg-background h-screen w-full">
      <div className="flex w-full h-full flex-1 items-center justify-center text-card-foreground">
        <div className="flex flex-col justify-between w-full h-full rounded-xl p-12">
          <div className="flex w-full justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2 text-primary">Settings</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Update your account settings below.
              </p>
            </div>
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded-lg cursor-pointer"
              form="settings-form"
            >
              Save Changes
            </Button>
          </div>
          <form id="settings-form" className="flex items-start flex-1">
            <div className="flex flex-col gap-7 justify-center h-full max-w-md w-full">
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">Username:</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  className="bg-card"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email:</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="bg-card"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone Number:</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="bg-card"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password:</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-card"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </ScrollArea>
  );
}
