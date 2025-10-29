import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import SkillAssessment from "./SkillAssessment";
import type { InsertPlayer } from "@shared/schema";

const categories = ["Singles", "Men's Doubles", "Women's Doubles", "Mixed Doubles"];

interface CategoryRatings {
  singlesRating: number | null;
  mensDoublesRating: number | null;
  womensDoublesRating: number | null;
  mixedDoublesRating: number | null;
}

export default function CreatePlayerDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"basic" | "assessment">("basic");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [club, setClub] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const createPlayerMutation = useMutation({
    mutationFn: async (player: InsertPlayer) => {
      const response = await apiRequest("POST", "/api/players", player);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "Success",
        description: "Player created successfully",
      });
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create player",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setStep("basic");
    setName("");
    setGender("");
    setClub("");
    setSelectedCategories([]);
    setNotes("");
  };

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

    createPlayerMutation.mutate(playerData);
  };

  const handleBack = () => {
    setStep("basic");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-player">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Player
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        {step === "basic" ? (
          <>
            <DialogHeader>
              <DialogTitle>Add New Player</DialogTitle>
              <DialogDescription>
                Enter basic player information. You'll assess skill levels next.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleBasicSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter player name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    data-testid="input-player-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender} required>
                    <SelectTrigger id="gender" data-testid="select-gender">
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
                    placeholder="e.g. City Badminton Club"
                    value={club}
                    onChange={(e) => setClub(e.target.value)}
                    data-testid="input-club"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preferred Categories</Label>
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const shouldDisable =
                        (category === "Men's Doubles" && gender === "Female") ||
                        (category === "Women's Doubles" && gender === "Male");

                      return (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={category}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => handleCategoryToggle(category)}
                            disabled={shouldDisable}
                            data-testid={`checkbox-${category.toLowerCase().replace(/\s+/g, "-")}`}
                          />
                          <Label
                            htmlFor={category}
                            className={`text-sm font-normal cursor-pointer ${
                              shouldDisable ? "text-muted-foreground" : ""
                            }`}
                          >
                            {category}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special notes or constraints"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    data-testid="input-notes"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!name || !gender || selectedCategories.length === 0}
                  data-testid="button-next-assessment"
                >
                  Next: Skill Assessment
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Skill Assessment for {name}</DialogTitle>
              <DialogDescription>
                Answer questions to determine skill ratings for each category
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <SkillAssessment
                gender={gender}
                preferredCategories={selectedCategories}
                onComplete={handleAssessmentComplete}
                onBack={handleBack}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
