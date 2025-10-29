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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Session, InsertSession } from "@shared/schema";

const sessionTypeOptions = [
  "Singles",
  "Men's Doubles",
  "Women's Doubles",
  "Mixed Doubles",
  "Open Play",
];

const capacityOptions = [8, 10, 12, 14, 16, 20];

interface EditSessionDialogProps {
  session: Session;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditSessionDialog({ session, open, onOpenChange }: EditSessionDialogProps) {
  const [name, setName] = useState(session.name);
  const [date, setDate] = useState(
    new Date(session.date).toISOString().slice(0, 16)
  );
  const [capacity, setCapacity] = useState(session.capacity.toString());
  const [courtsAvailable, setCourtsAvailable] = useState(session.courtsAvailable.toString());
  const [selectedTypes, setSelectedTypes] = useState<string[]>(session.sessionTypes);
  const [maxSkillGap, setMaxSkillGap] = useState(session.maxSkillGap?.toString() || "");
  const [minGamesPerPlayer, setMinGamesPerPlayer] = useState(session.minGamesPerPlayer?.toString() || "");
  const { toast } = useToast();

  const updateSessionMutation = useMutation({
    mutationFn: async (updates: Partial<InsertSession>) => {
      const response = await apiRequest("PATCH", `/api/sessions/${session.id}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({
        title: "Success",
        description: "Session updated successfully",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update session",
        variant: "destructive",
      });
    },
  });

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updates: Partial<InsertSession> = {
      name,
      date: new Date(date),
      sessionTypes: selectedTypes,
      capacity: parseInt(capacity),
      courtsAvailable: parseInt(courtsAvailable),
      maxSkillGap: maxSkillGap ? parseInt(maxSkillGap) : null,
      minGamesPerPlayer: minGamesPerPlayer ? parseInt(minGamesPerPlayer) : null,
      status: session.status,
    };

    updateSessionMutation.mutate(updates);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Session</DialogTitle>
          <DialogDescription>
            Update session information and settings
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-session-name">Session Name</Label>
              <Input
                id="edit-session-name"
                placeholder="e.g. Friday Night Badminton"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                data-testid="input-edit-session-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-date">Date & Time</Label>
              <Input
                id="edit-date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                data-testid="input-edit-session-date"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-capacity">Capacity</Label>
                <Select value={capacity} onValueChange={setCapacity}>
                  <SelectTrigger data-testid="select-edit-capacity">
                    <SelectValue placeholder="Select capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    {capacityOptions.map((cap) => (
                      <SelectItem key={cap} value={String(cap)} data-testid={`option-edit-capacity-${cap}`}>
                        {cap} players
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-courts">Courts Available</Label>
                <Input
                  id="edit-courts"
                  type="number"
                  placeholder="4"
                  min="1"
                  value={courtsAvailable}
                  onChange={(e) => setCourtsAvailable(e.target.value)}
                  required
                  data-testid="input-edit-courts"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Session Types</Label>
              <p className="text-sm text-muted-foreground">
                Select one or more session types for this event
              </p>
              <div className="space-y-2">
                {sessionTypeOptions.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${type}`}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={() => handleTypeToggle(type)}
                      data-testid={`checkbox-edit-${type.toLowerCase().replace(/\s+/g, "-")}`}
                    />
                    <Label
                      htmlFor={`edit-${type}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-max-skill-gap">Max Skill Gap (Optional)</Label>
                <Input
                  id="edit-max-skill-gap"
                  type="number"
                  placeholder="200"
                  value={maxSkillGap}
                  onChange={(e) => setMaxSkillGap(e.target.value)}
                  data-testid="input-edit-max-skill-gap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-min-games">Min Games/Player (Optional)</Label>
                <Input
                  id="edit-min-games"
                  type="number"
                  placeholder="3"
                  value={minGamesPerPlayer}
                  onChange={(e) => setMinGamesPerPlayer(e.target.value)}
                  data-testid="input-edit-min-games"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name || !date || !capacity || !courtsAvailable || selectedTypes.length === 0 || updateSessionMutation.isPending}
              data-testid="button-save-session"
            >
              {updateSessionMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
