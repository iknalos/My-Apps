import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

interface Team {
  player1: string;
  player2?: string;
  score?: number;
  isWinner?: boolean;
}

interface MatchCardProps {
  courtNumber: number;
  roundNumber: number;
  team1: Team;
  team2: Team;
  status: "scheduled" | "in-progress" | "completed";
  skillBalance?: number;
  onEnterScore?: () => void;
}

export default function MatchCard({
  courtNumber,
  roundNumber,
  team1,
  team2,
  status,
  skillBalance = 0,
  onEnterScore,
}: MatchCardProps) {
  const statusColors = {
    scheduled: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    "in-progress": "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    completed: "bg-green-500/10 text-green-700 dark:text-green-400",
  };

  const balanceColor =
    Math.abs(skillBalance) < 100
      ? "text-green-600 dark:text-green-400"
      : Math.abs(skillBalance) < 200
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";

  return (
    <Card className="hover-elevate">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-semibold">
            Court {courtNumber}
          </Badge>
          <span className="text-sm text-muted-foreground">Round {roundNumber}</span>
        </div>
        <Badge className={statusColors[status]}>{status}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
            <div className="flex-1">
              <div className={`font-medium ${team1.isWinner ? "text-green-600 dark:text-green-400" : ""}`}>
                {team1.player1}
              </div>
              {team1.player2 && (
                <div className={`text-sm ${team1.isWinner ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                  {team1.player2}
                </div>
              )}
            </div>
            {status === "completed" && team1.score !== undefined && (
              <div className={`text-2xl font-mono font-bold ${team1.isWinner ? "text-green-600 dark:text-green-400" : ""}`}>
                {team1.score}
              </div>
            )}
          </div>

          <div className="text-center text-sm font-semibold text-muted-foreground">vs</div>

          <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
            <div className="flex-1">
              <div className={`font-medium ${team2.isWinner ? "text-green-600 dark:text-green-400" : ""}`}>
                {team2.player1}
              </div>
              {team2.player2 && (
                <div className={`text-sm ${team2.isWinner ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                  {team2.player2}
                </div>
              )}
            </div>
            {status === "completed" && team2.score !== undefined && (
              <div className={`text-2xl font-mono font-bold ${team2.isWinner ? "text-green-600 dark:text-green-400" : ""}`}>
                {team2.score}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Balance:</span>
          <span className={`font-mono font-medium ${balanceColor}`}>
            {skillBalance > 0 ? "+" : ""}
            {skillBalance}
          </span>
        </div>

        {status !== "completed" && (
          <Button
            className="w-full"
            variant="outline"
            onClick={onEnterScore}
            data-testid="button-enter-score"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Enter Score
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
