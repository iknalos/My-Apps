import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Trophy } from "lucide-react";

interface RegisterProps {
  onRegisterSuccess: (user: { id: string; username: string; role: 'admin' | 'player'; playerId?: string }) => void;
}

export default function Register({ onRegisterSuccess }: RegisterProps) {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<'admin' | 'player'>('player');
  const { toast } = useToast();

  const registerMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string; role: 'admin' | 'player' }) => {
      const response = await apiRequest("POST", "/api/auth/register", credentials);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Registration failed");
      }
      return await response.json();
    },
    onSuccess: (user) => {
      onRegisterSuccess(user);
      toast({
        title: "Welcome!",
        description: `Account created for ${user.username}`,
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password || !confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({ username, password, role });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-center gap-3">
          <Trophy className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">Michaels Mixer</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Register to start managing your badminton sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={registerMutation.isPending}
                  data-testid="input-username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={registerMutation.isPending}
                  data-testid="input-password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={registerMutation.isPending}
                  data-testid="input-confirm-password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Account Type</Label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value as 'admin' | 'player')} disabled={registerMutation.isPending}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="player" id="role-player" data-testid="radio-role-player" />
                    <Label htmlFor="role-player" className="font-normal">Player (create profile, view scores)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="role-admin" data-testid="radio-role-admin" />
                    <Label htmlFor="role-admin" className="font-normal">Admin (full access to manage sessions)</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
                data-testid="button-register"
              >
                {registerMutation.isPending ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => setLocation("/login")}
                data-testid="link-login"
              >
                Sign in here
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
