import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";

interface ScoreEntryDialogProps {
  matchId: string;
  team1Player1: string;
  team1Player2?: string;
  team2Player1: string;
  team2Player2?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialScores?: {
    team1Set1: number;
    team1Set2: number;
    team1Set3: number;
    team2Set1: number;
    team2Set2: number;
    team2Set3: number;
  };
  onScoreSubmit: (matchId: string, scores: {
    team1Set1: number;
    team1Set2: number;
    team1Set3: number;
    team2Set1: number;
    team2Set2: number;
    team2Set3: number;
  }) => void;
}

export default function ScoreEntryDialog({
  matchId,
  team1Player1,
  team1Player2,
  team2Player1,
  team2Player2,
  trigger,
  open: controlledOpen,
  onOpenChange,
  initialScores,
  onScoreSubmit,
}: ScoreEntryDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [team1Set1, setTeam1Set1] = useState("");
  const [team1Set2, setTeam1Set2] = useState("");
  const [team1Set3, setTeam1Set3] = useState("");
  const [team2Set1, setTeam2Set1] = useState("");
  const [team2Set2, setTeam2Set2] = useState("");
  const [team2Set3, setTeam2Set3] = useState("");
  const { toast } = useToast();

  // Pre-populate fields when editing existing scores
  useEffect(() => {
    if (initialScores && open) {
      setTeam1Set1(initialScores.team1Set1 > 0 ? String(initialScores.team1Set1) : "");
      setTeam1Set2(initialScores.team1Set2 > 0 ? String(initialScores.team1Set2) : "");
      setTeam1Set3(initialScores.team1Set3 > 0 ? String(initialScores.team1Set3) : "");
      setTeam2Set1(initialScores.team2Set1 > 0 ? String(initialScores.team2Set1) : "");
      setTeam2Set2(initialScores.team2Set2 > 0 ? String(initialScores.team2Set2) : "");
      setTeam2Set3(initialScores.team2Set3 > 0 ? String(initialScores.team2Set3) : "");
    } else if (!open) {
      // Clear fields when dialog closes
      setTeam1Set1("");
      setTeam1Set2("");
      setTeam1Set3("");
      setTeam2Set1("");
      setTeam2Set2("");
      setTeam2Set3("");
    }
  }, [initialScores, open]);

  // Validate badminton scoring rules
  const validateSetScore = (score1: number, score2: number, setNumber: number): string | null => {
    // Check that scores are within valid range
    if (score1 < 0 || score2 < 0) {
      return `Set ${setNumber}: Scores cannot be negative.`;
    }
    if (score1 > 30 || score2 > 30) {
      return `Set ${setNumber}: Maximum score is 30.`;
    }
    
    // No ties allowed
    if (score1 === score2) {
      return `Set ${setNumber}: Cannot be tied. Each set must have a winner.`;
    }
    
    const winner = score1 > score2 ? score1 : score2;
    const loser = score1 > score2 ? score2 : score1;
    
    // Case 1: Winner reached 30 (always valid)
    if (winner === 30) {
      return null;
    }
    
    // Case 2: Winner has 21+ points
    if (winner >= 21) {
      const difference = winner - loser;
      
      // If winner is between 21-29, must have 2-point lead
      if (difference < 2) {
        return `Set ${setNumber}: To win with ${winner} points, you need a 2-point difference. Current difference is ${difference}.`;
      }
      
      // Valid win with 21+ and 2-point lead
      return null;
    }
    
    // Case 3: Winner has less than 21 points - invalid
    return `Set ${setNumber}: Winner must reach at least 21 points (or 30). Current score: ${winner}-${loser}.`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least the first 2 sets are filled
    if (!team1Set1 || !team2Set1 || !team1Set2 || !team2Set2) {
      toast({
        title: "Incomplete scores",
        description: "Please enter scores for both sets 1 and 2.",
        variant: "destructive",
      });
      return;
    }
    
    // Parse all filled set scores
    const set1 = parseInt(team1Set1);
    const set2 = parseInt(team1Set2);
    const oppSet1 = parseInt(team2Set1);
    const oppSet2 = parseInt(team2Set2);
    
    // Validate Set 1 with badminton rules
    const set1Error = validateSetScore(set1, oppSet1, 1);
    if (set1Error) {
      toast({
        title: "Invalid Score",
        description: set1Error,
        variant: "destructive",
      });
      return;
    }
    
    // Validate Set 2 with badminton rules
    const set2Error = validateSetScore(set2, oppSet2, 2);
    if (set2Error) {
      toast({
        title: "Invalid Score",
        description: set2Error,
        variant: "destructive",
      });
      return;
    }
    
    const team1WonSet1 = set1 > oppSet1;
    const team1WonSet2 = set2 > oppSet2;
    const team2WonSet1 = oppSet1 > set1;
    const team2WonSet2 = oppSet2 > set2;
    
    const setsAreSplit = (team1WonSet1 && team2WonSet2) || (team2WonSet1 && team1WonSet2);
    const matchAlreadyDecided = (team1WonSet1 && team1WonSet2) || (team2WonSet1 && team2WonSet2);
    
    // Prevent 3-0 scores - match ends at 2-0
    if (matchAlreadyDecided && (team1Set3 || team2Set3)) {
      toast({
        title: "Invalid Score",
        description: "Match already decided 2-0. Set 3 should not be played when one team wins the first two sets.",
        variant: "destructive",
      });
      return;
    }
    
    // If sets are split, require set 3 and validate it has a winner
    if (setsAreSplit) {
      if (!team1Set3 || !team2Set3) {
        toast({
          title: "Deciding set required",
          description: "Sets are split 1-1. Please enter set 3 scores.",
          variant: "destructive",
        });
        return;
      }
      const set3 = parseInt(team1Set3);
      const oppSet3 = parseInt(team2Set3);
      
      // Validate Set 3 with badminton rules
      const set3Error = validateSetScore(set3, oppSet3, 3);
      if (set3Error) {
        toast({
          title: "Invalid Score",
          description: set3Error,
          variant: "destructive",
        });
        return;
      }
    }
    
    // Send null for unplayed set 3 instead of 0
    onScoreSubmit(matchId, {
      team1Set1: set1,
      team1Set2: set2,
      team1Set3: team1Set3 && team2Set3 ? parseInt(team1Set3) : 0,
      team2Set1: oppSet1,
      team2Set2: oppSet2,
      team2Set3: team1Set3 && team2Set3 ? parseInt(team2Set3) : 0,
    });
    
    // Reset form
    setTeam1Set1("");
    setTeam1Set2("");
    setTeam1Set3("");
    setTeam2Set1("");
    setTeam2Set2("");
    setTeam2Set3("");
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
          <DialogTitle>{initialScores ? "Edit Match Score" : "Enter Match Score"}</DialogTitle>
          <DialogDescription>
            {initialScores ? "Update the score for this match." : "Record the final score for this match."} Each set: first to 21 with 2-point difference, or first to 30 (regardless of difference).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Team 1</Label>
              <div className="p-3 rounded-md bg-muted">
                <div className="font-medium">{team1Player1}</div>
                {team1Player2 && (
                  <div className="text-sm text-muted-foreground">{team1Player2}</div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Set 1</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    max="30"
                    value={team1Set1}
                    onChange={(e) => setTeam1Set1(e.target.value)}
                    data-testid="input-team1-set1"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Set 2</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    max="30"
                    value={team1Set2}
                    onChange={(e) => setTeam1Set2(e.target.value)}
                    data-testid="input-team1-set2"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Set 3</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    max="30"
                    value={team1Set3}
                    onChange={(e) => setTeam1Set3(e.target.value)}
                    data-testid="input-team1-set3"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Team 2</Label>
              <div className="p-3 rounded-md bg-muted">
                <div className="font-medium">{team2Player1}</div>
                {team2Player2 && (
                  <div className="text-sm text-muted-foreground">{team2Player2}</div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Set 1</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    max="30"
                    value={team2Set1}
                    onChange={(e) => setTeam2Set1(e.target.value)}
                    data-testid="input-team2-set1"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Set 2</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    max="30"
                    value={team2Set2}
                    onChange={(e) => setTeam2Set2(e.target.value)}
                    data-testid="input-team2-set2"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Set 3</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    max="30"
                    value={team2Set3}
                    onChange={(e) => setTeam2Set3(e.target.value)}
                    data-testid="input-team2-set3"
                  />
                </div>
              </div>
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
