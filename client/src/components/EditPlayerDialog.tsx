import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Player, InsertPlayer } from "@shared/schema";

const categories = ["Singles", "Men's Doubles", "Women's Doubles", "Mixed Doubles"];

interface EditPlayerDialogProps {
  player: Player;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditPlayerDialog({ player, open, onOpenChange }: EditPlayerDialogProps) {
  const [name, setName] = useState(player.name);
  const [gender, setGender] = useState(player.gender);
  const [club, setClub] = useState(player.club || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(player.preferredCategories);
  const [notes, setNotes] = useState(player.notes || "");
  const [singlesRating, setSinglesRating] = useState(player.singlesRating?.toString() || "");
  const [mensDoublesRating, setMensDoublesRating] = useState(player.mensDoublesRating?.toString() || "");
  const [womensDoublesRating, setWomensDoublesRating] = useState(player.womensDoublesRating?.toString() || "");
  const [mixedDoublesRating, setMixedDoublesRating] = useState(player.mixedDoublesRating?.toString() || "");
  const { toast } = useToast();

  const updatePlayerMutation = useMutation({
    mutationFn: async (updates: Partial<InsertPlayer>) => {
      const response = await apiRequest("PATCH", `/api/players/${player.id}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "Success",
        description: "Player updated successfully",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update player",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates: Partial<InsertPlayer> = {
      name,
      gender,
      club: club || null,
      preferredCategories: selectedCategories,
      notes: notes || null,
      singlesRating: singlesRating ? parseInt(singlesRating) : null,
      mensDoublesRating: mensDoublesRating ? parseInt(mensDoublesRating) : null,
      womensDoublesRating: womensDoublesRating ? parseInt(womensDoublesRating) : null,
      mixedDoublesRating: mixedDoublesRating ? parseInt(mixedDoublesRating) : null,
    };

    updatePlayerMutation.mutate(updates);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Player</DialogTitle>
          <DialogDescription>
            Update player information and ratings
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter player name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                data-testid="input-edit-player-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-gender">Gender</Label>
              <Select value={gender} onValueChange={setGender} required>
                <SelectTrigger id="edit-gender" data-testid="select-edit-gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-club">Club (Optional)</Label>
              <Input
                id="edit-club"
                placeholder="e.g. City Badminton Club"
                value={club}
                onChange={(e) => setClub(e.target.value)}
                data-testid="input-edit-club"
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
                        id={`edit-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                        disabled={shouldDisable}
                        data-testid={`checkbox-edit-${category.toLowerCase().replace(/\s+/g, "-")}`}
                      />
                      <Label
                        htmlFor={`edit-${category}`}
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
              <Label>Ratings</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-singles-rating" className="text-sm">
                    Singles
                  </Label>
                  <Input
                    id="edit-singles-rating"
                    type="number"
                    placeholder="1000-2500"
                    value={singlesRating}
                    onChange={(e) => setSinglesRating(e.target.value)}
                    data-testid="input-edit-singles-rating"
                  />
                </div>
                {gender === "Male" && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-mens-doubles-rating" className="text-sm">
                      Men's Doubles
                    </Label>
                    <Input
                      id="edit-mens-doubles-rating"
                      type="number"
                      placeholder="1000-2500"
                      value={mensDoublesRating}
                      onChange={(e) => setMensDoublesRating(e.target.value)}
                      data-testid="input-edit-mens-doubles-rating"
                    />
                  </div>
                )}
                {gender === "Female" && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-womens-doubles-rating" className="text-sm">
                      Women's Doubles
                    </Label>
                    <Input
                      id="edit-womens-doubles-rating"
                      type="number"
                      placeholder="1000-2500"
                      value={womensDoublesRating}
                      onChange={(e) => setWomensDoublesRating(e.target.value)}
                      data-testid="input-edit-womens-doubles-rating"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="edit-mixed-doubles-rating" className="text-sm">
                    Mixed Doubles
                  </Label>
                  <Input
                    id="edit-mixed-doubles-rating"
                    type="number"
                    placeholder="1000-2500"
                    value={mixedDoublesRating}
                    onChange={(e) => setMixedDoublesRating(e.target.value)}
                    data-testid="input-edit-mixed-doubles-rating"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Textarea
                id="edit-notes"
                placeholder="Any special notes or constraints"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                data-testid="input-edit-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name || !gender || selectedCategories.length === 0 || updatePlayerMutation.isPending}
              data-testid="button-save-player"
            >
              {updatePlayerMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
