import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import SkillAssessment from "@/components/SkillAssessment";
import type { InsertPlayer } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";

const categories = ["Singles", "Men's Doubles", "Women's Doubles", "Mixed Doubles"];

interface CategoryRatings {
  singlesRating: number | null;
  mensDoublesRating: number | null;
  womensDoublesRating: number | null;
  mixedDoublesRating: number | null;
}

export default function CreatePlayerProfile() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"basic" | "assessment">("basic");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [club, setClub] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const createProfileMutation = useMutation({
    mutationFn: async (player: InsertPlayer) => {
      const response = await apiRequest("POST", "/api/players/profile", player);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create profile");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Profile created",
        description: "Your player profile has been created successfully",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleBasicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && gender && selectedCategories.length > 0) {
      setStep("assessment");
    }
  };

  const handleAssessmentComplete = (ratings: CategoryRatings) => {
    const playerData: InsertPlayer = {
      name,
      gender,
      club: club || null,
      preferredCategories: selectedCategories,
      notes: notes || null,
      ...ratings,
    };

    createProfileMutation.mutate(playerData);
  };

  const handleBack = () => {
    setStep("basic");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-center gap-3">
          <Trophy className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">Michaels Mixer</h1>
        </div>

        <Card>
          {step === "basic" ? (
            <>
              <CardHeader>
                <CardTitle>Create Your Player Profile</CardTitle>
                <CardDescription>
                  Welcome {user?.username}! Let's set up your player profile to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBasicSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      data-testid="input-player-name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={gender} onValueChange={setGender} required>
                      <SelectTrigger data-testid="select-gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="club">Club (Optional)</Label>
                    <Input
                      id="club"
                      value={club}
                      onChange={(e) => setClub(e.target.value)}
                      placeholder="Your badminton club"
                      data-testid="input-club"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Event Categories *</Label>
                    <p className="text-sm text-muted-foreground">
                      Select the categories you want to participate in
                    </p>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => handleCategoryToggle(category)}
                            data-testid={`checkbox-category-${category}`}
                          />
                          <Label
                            htmlFor={`category-${category}`}
                            className="font-normal cursor-pointer"
                          >
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional information..."
                      rows={3}
                      data-testid="textarea-notes"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!name || !gender || selectedCategories.length === 0}
                    data-testid="button-next"
                  >
                    Next: Skill Assessment
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Skill Assessment</CardTitle>
                <CardDescription>
                  Rate your skill level in each selected category (1000-2000)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SkillAssessment
                  selectedCategories={selectedCategories}
                  onComplete={handleAssessmentComplete}
                  onBack={handleBack}
                  isLoading={createProfileMutation.isPending}
                />
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
