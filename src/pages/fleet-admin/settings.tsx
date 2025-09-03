
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
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("English");

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
          <form id="settings-form" className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start flex-1">
            <div className="flex flex-col gap-7 justify-center h-full md:col-span-1">
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
              <div className="flex flex-col gap-2">
                <Label htmlFor="notifications">Notifications:</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="notifications"
                    type="checkbox"
                    checked={notifications}
                    onChange={e => setNotifications(e.target.checked)}
                  />
                  <span className="text-sm">Enable notifications</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="theme">Theme:</Label>
                <select
                  id="theme"
                  value={theme}
                  onChange={e => setTheme(e.target.value)}
                  className="bg-card p-2 rounded"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="language">Language:</Label>
                <select
                  id="language"
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="bg-card p-2 rounded"
                >
                  <option value="English">English</option>
                  <option value="Filipino">Filipino</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-7 items-center justify-center h-full md:col-span-2">
              <div className="flex flex-col gap-2 w-full mb-20">
                <Label>Profile Image:</Label>
                {/* You can add a FileUpload or Avatar component here for profile image */}
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <span>Avatar</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ScrollArea>
  );
}
