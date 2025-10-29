import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Session, Player } from "@shared/schema";
import { UserPlus } from "lucide-react";

interface JoinSessionDialogProps {
  session: Session;
  onSuccess?: () => void;
}

export default function JoinSessionDialog({ session, onSuccess }: JoinSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const joinSessionMutation = useMutation({
    mutationFn: async (data: { playerId: string; selectedEvents: string[] }) => {
      const response = await apiRequest("POST", `/api/sessions/${session.id}/registrations`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", session.id, "registrations"] });
      toast({
        title: "Success",
        description: "Successfully registered for session",
      });
      setOpen(false);
      resetForm();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to register for session",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedPlayerId("");
    setSelectedEvents([]);
  };

  const handleEventToggle = (eventType: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventType) ? prev.filter((e) => e !== eventType) : [...prev, eventType]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlayerId || selectedEvents.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a player and at least one event",
        variant: "destructive",
      });
      return;
    }

    joinSessionMutation.mutate({
      playerId: selectedPlayerId,
      selectedEvents,
    });
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        data-testid="button-join-session"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Join Session
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Join {session.name}</DialogTitle>
            <DialogDescription>
              Select a player and the events they want to participate in
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="player-select">Select Player *</Label>
                <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                  <SelectTrigger data-testid="select-player">
                    <SelectValue placeholder="Choose a player" />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map((player) => (
                      <SelectItem key={player.id} value={player.id} data-testid={`option-player-${player.id}`}>
                        {player.name} ({player.gender})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Events *</Label>
                <p className="text-sm text-muted-foreground">
                  Choose which events this player will participate in
                </p>
                <div className="space-y-2">
                  {session.sessionTypes.map((eventType) => (
                    <div key={eventType} className="flex items-center space-x-2">
                      <Checkbox
                        id={`event-${eventType}`}
                        checked={selectedEvents.includes(eventType)}
                        onCheckedChange={() => handleEventToggle(eventType)}
                        data-testid={`checkbox-event-${eventType.toLowerCase().replace(/\s+/g, "-")}`}
                      />
                      <Label
                        htmlFor={`event-${eventType}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {eventType}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedEvents.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {selectedEvents.join(", ")}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedPlayerId || selectedEvents.length === 0 || joinSessionMutation.isPending}
                data-testid="button-submit-registration"
              >
                {joinSessionMutation.isPending ? "Registering..." : "Register"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
