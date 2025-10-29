import { useState } from "react";
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
import { Trophy } from "lucide-react";

interface ScoreEntryDialogProps {
  team1Player1: string;
  team1Player2?: string;
  team2Player1: string;
  team2Player2?: string;
  trigger?: React.ReactNode;
}

export default function ScoreEntryDialog({
  team1Player1,
  team1Player2,
  team2Player1,
  team2Player2,
  trigger,
}: ScoreEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const [team1Score, setTeam1Score] = useState("");
  const [team2Score, setTeam2Score] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Score submitted:", { team1Score, team2Score });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" data-testid="button-enter-score">
            <Trophy className="h-4 w-4 mr-2" />
            Enter Score
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Enter Match Score</DialogTitle>
          <DialogDescription>
            Record the final score for this match.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Team 1</Label>
              <div className="p-3 rounded-md bg-muted">
                <div className="font-medium">{team1Player1}</div>
                {team1Player2 && (
                  <div className="text-sm text-muted-foreground">{team1Player2}</div>
                )}
              </div>
              <Input
                type="number"
                placeholder="Score"
                min="0"
                value={team1Score}
                onChange={(e) => setTeam1Score(e.target.value)}
                data-testid="input-team1-score"
              />
            </div>

            <div className="space-y-2">
              <Label>Team 2</Label>
              <div className="p-3 rounded-md bg-muted">
                <div className="font-medium">{team2Player1}</div>
                {team2Player2 && (
                  <div className="text-sm text-muted-foreground">{team2Player2}</div>
                )}
              </div>
              <Input
                type="number"
                placeholder="Score"
                min="0"
                value={team2Score}
                onChange={(e) => setTeam2Score(e.target.value)}
                data-testid="input-team2-score"
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
            <Button type="submit" data-testid="button-submit-score">
              Save Score
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
