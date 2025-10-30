import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

interface Team {
  player1: string;
  player2?: string;
  player1Rating?: number;
  player2Rating?: number;
  score?: number;
  isWinner?: boolean;
  setScores?: string; // e.g., "21-19, 21-18"
}

interface MatchCardProps {
  courtNumber: number;
  roundNumber: number;
  eventType?: string;
  team1: Team;
  team2: Team;
  status: "scheduled" | "in-progress" | "completed";
  skillBalance?: number;
  handicapInfo?: string;
  onEnterScore?: () => void;
}

export default function MatchCard({
  courtNumber,
  roundNumber,
  eventType,
  team1,
  team2,
  status,
  skillBalance = 0,
  handicapInfo,
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

  // Get event type label (XD, MD, WD, Singles)
  const getEventLabel = (type?: string) => {
    if (!type) return null;
    if (type === "mixedDoubles") return "XD";
    if (type === "mensDoubles") return "MD";
    if (type === "womensDoubles") return "WD";
    if (type === "singles") return "Singles";
    return type;
  };

  const eventLabel = getEventLabel(eventType);

  return (
    <Card className="hover-elevate">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="font-semibold">
            Court {courtNumber}
          </Badge>
          {eventLabel && (
            <Badge variant="secondary" className="font-semibold">
              {eventLabel}
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">Round {roundNumber}</span>
        </div>
        <Badge className={statusColors[status]}>{status}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className={`flex items-center justify-between p-3 rounded-md ${team1.isWinner ? "bg-green-100 dark:bg-green-900/30" : "bg-muted/50"}`}>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{team1.player1}</span>
                {team1.player1Rating && (
                  <span className="text-xs font-mono text-muted-foreground">({team1.player1Rating})</span>
                )}
              </div>
              {team1.player2 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{team1.player2}</span>
                  {team1.player2Rating && (
                    <span className="text-xs font-mono text-muted-foreground">({team1.player2Rating})</span>
                  )}
                </div>
              )}
              {status === "completed" && team1.setScores && (
                <div className="text-xs text-muted-foreground mt-1">
                  {team1.setScores}
                </div>
              )}
            </div>
            {status === "completed" && team1.score !== undefined && (
              <div className="text-2xl font-mono font-bold">
                {team1.score}
              </div>
            )}
          </div>

          <div className="text-center text-sm font-semibold text-muted-foreground">vs</div>

          <div className={`flex items-center justify-between p-3 rounded-md ${team2.isWinner ? "bg-green-100 dark:bg-green-900/30" : "bg-muted/50"}`}>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{team2.player1}</span>
                {team2.player1Rating && (
                  <span className="text-xs font-mono text-muted-foreground">({team2.player1Rating})</span>
                )}
              </div>
              {team2.player2 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{team2.player2}</span>
                  {team2.player2Rating && (
                    <span className="text-xs font-mono text-muted-foreground">({team2.player2Rating})</span>
                  )}
                </div>
              )}
              {status === "completed" && team2.setScores && (
                <div className="text-xs text-muted-foreground mt-1">
                  {team2.setScores}
                </div>
              )}
            </div>
            {status === "completed" && team2.score !== undefined && (
              <div className="text-2xl font-mono font-bold">
                {team2.score}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Balance:</span>
            <span className={`font-mono font-medium ${balanceColor}`}>
              {skillBalance > 0 ? "+" : ""}
              {skillBalance}
            </span>
          </div>
          {handicapInfo && (
            <div className="text-xs text-center text-amber-600 dark:text-amber-400 font-medium">
              {handicapInfo}
            </div>
          )}
        </div>

        {onEnterScore && (
          <Button
            className="w-full"
            variant="outline"
            onClick={onEnterScore}
            data-testid="button-enter-score"
          >
            <Trophy className="h-4 w-4 mr-2" />
            {status === "completed" ? "Edit Score" : "Enter Score"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
