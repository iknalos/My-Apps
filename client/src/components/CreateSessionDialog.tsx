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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { InsertSession } from "@shared/schema";

const sessionTypeOptions = [
  "Singles",
  "Men's Doubles",
  "Women's Doubles",
  "Mixed Doubles",
  "Open Play",
];

const capacityOptions = [8, 10, 12, 14, 16, 20];

export default function CreateSessionDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("19:00");
  const [capacity, setCapacity] = useState("");
  const [courtsAvailable, setCourtsAvailable] = useState("");
  const [numberOfRounds, setNumberOfRounds] = useState("3");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [maxSkillGap, setMaxSkillGap] = useState("");
  const [minGamesPerPlayer, setMinGamesPerPlayer] = useState("");
  const { toast } = useToast();

  const createSessionMutation = useMutation({
    mutationFn: async (session: InsertSession) => {
      const response = await apiRequest("POST", "/api/sessions", session);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({
        title: "Success",
        description: "Session created successfully",
      });
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create session",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setSessionDate("");
    setSessionTime("19:00");
    setCapacity("");
    setCourtsAvailable("");
    setNumberOfRounds("3");
    setSelectedTypes([]);
    setMaxSkillGap("");
    setMinGamesPerPlayer("");
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !sessionDate || !sessionTime || !capacity || !courtsAvailable || !numberOfRounds || selectedTypes.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const dateTimeString = `${sessionDate}T${sessionTime}`;
    const sessionData: InsertSession = {
      name,
      date: new Date(dateTimeString),
      sessionTypes: selectedTypes,
      capacity: parseInt(capacity),
      courtsAvailable: parseInt(courtsAvailable),
      numberOfRounds: parseInt(numberOfRounds),
      maxSkillGap: maxSkillGap ? parseInt(maxSkillGap) : null,
      minGamesPerPlayer: minGamesPerPlayer ? parseInt(minGamesPerPlayer) : null,
      status: "upcoming",
    };

    createSessionMutation.mutate(sessionData);
  };

  const isFormValid = name.trim() !== "" && 
                      sessionDate !== "" && 
                      sessionTime !== "" &&
                      capacity !== "" &&
                      courtsAvailable !== "" &&
                      numberOfRounds !== "" && 
                      selectedTypes.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-session">
          <Plus className="h-4 w-4 mr-2" />
          Create Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>
            Set up a new badminton session with multiple session types.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="session-name">Session Name *</Label>
              <Input
                id="session-name"
                placeholder="e.g. Friday Night Badminton"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-session-name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session-date">Date *</Label>
                <Input
                  id="session-date"
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  data-testid="input-session-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-time">Time *</Label>
                <Input
                  id="session-time"
                  type="time"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                  data-testid="input-session-time"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Select value={capacity} onValueChange={setCapacity}>
                  <SelectTrigger data-testid="select-capacity">
                    <SelectValue placeholder="Select capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    {capacityOptions.map((cap) => (
                      <SelectItem key={cap} value={String(cap)} data-testid={`option-capacity-${cap}`}>
                        {cap} players
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="courts">Courts *</Label>
                <Input
                  id="courts"
                  type="number"
                  placeholder="4"
                  min="1"
                  value={courtsAvailable}
                  onChange={(e) => setCourtsAvailable(e.target.value)}
                  data-testid="input-courts"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rounds">Rounds *</Label>
                <Input
                  id="rounds"
                  type="number"
                  placeholder="3"
                  min="1"
                  max="10"
                  value={numberOfRounds}
                  onChange={(e) => setNumberOfRounds(e.target.value)}
                  data-testid="input-rounds"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Session Types *</Label>
              <p className="text-sm text-muted-foreground">
                Select one or more session types for this event
              </p>
              <div className="space-y-2">
                {sessionTypeOptions.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={() => handleTypeToggle(type)}
                      data-testid={`checkbox-${type.toLowerCase().replace(/\s+/g, "-")}`}
                    />
                    <Label
                      htmlFor={type}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedTypes.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Selected: {selectedTypes.join(", ")}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-skill-gap">Max Skill Gap (Optional)</Label>
                <Input
                  id="max-skill-gap"
                  type="number"
                  placeholder="200"
                  value={maxSkillGap}
                  onChange={(e) => setMaxSkillGap(e.target.value)}
                  data-testid="input-max-skill-gap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-games">Min Games/Player (Optional)</Label>
                <Input
                  id="min-games"
                  type="number"
                  placeholder="3"
                  value={minGamesPerPlayer}
                  onChange={(e) => setMinGamesPerPlayer(e.target.value)}
                  data-testid="input-min-games"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || createSessionMutation.isPending}
              data-testid="button-submit-session"
            >
              {createSessionMutation.isPending ? "Creating..." : "Create Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
