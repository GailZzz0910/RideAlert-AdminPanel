
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function Settings() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Simulate loading user data from backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate loading user data
        setUsername("admin_user");
        setEmail("admin@company.com");
        setPhone("+63 912 345 6789");
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Handle success
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Skeleton components
  const FormSkeleton = () => (
    <div className="flex flex-col gap-7 justify-center h-full max-w-md w-full">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="flex flex-col gap-2 animate-pulse">
          <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <ScrollArea className="bg-background h-screen w-full">
        <div className="flex w-full h-full flex-1 items-center justify-center text-card-foreground">
          <div className="flex flex-col justify-between w-full h-full rounded-xl p-12 pt-16">
            <div className="flex w-full justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2 text-primary">Settings</h1>
                <p className="text-sm text-muted-foreground mb-6">
                  Loading your account settings...
                </p>
              </div>
              <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
            <div className="flex items-start flex-1">
              <FormSkeleton />
            </div>
          </div>
        </div>
      </ScrollArea>
    );
  }

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
              disabled={saving}
              className="bg-blue-500 hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-2"
              form="settings-form"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
          <form id="settings-form" onSubmit={handleSubmit} className="flex items-start flex-1">
            <div className="flex flex-col gap-7 justify-center h-full max-w-md w-full">
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">Username:</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
