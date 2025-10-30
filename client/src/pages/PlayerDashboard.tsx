import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import type { Player, Match } from "@shared/schema";
import { User, Trophy, Calendar } from "lucide-react";

export default function PlayerDashboard() {
  const { user } = useAuth();

  // SECURITY: Use player-specific endpoints that only return the authenticated user's data
  const { data: player, isLoading: playerLoading } = useQuery<Player>({
    queryKey: ["/api/players/profile"],
  });

  const { data: matches, isLoading: matchesLoading } = useQuery<Match[]>({
    queryKey: ["/api/players/profile/matches"],
    enabled: !!player?.id,
  });

  const { data: sessions } = useQuery({
    queryKey: ["/api/sessions"],
  });

  if (playerLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Profile Found</CardTitle>
            <CardDescription>
              You haven't created a player profile yet
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const completedMatches = matches?.filter(m => m.status === "completed") || [];
  const upcomingMatches = matches?.filter(m => m.status !== "completed") || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">View your player information and match history</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="h-6 w-6" />
            <div>
              <CardTitle>{player.name}</CardTitle>
              <CardDescription>{player.club || "No club"}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Gender</p>
            <p>{player.gender}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Preferred Categories</p>
            <div className="flex flex-wrap gap-2">
              {player.preferredCategories.map((cat) => (
                <Badge key={cat} variant="secondary">{cat}</Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Skill Ratings</p>
            <div className="grid grid-cols-2 gap-3">
              {player.singlesRating && (
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="text-sm">Singles: {player.singlesRating}</span>
                </div>
              )}
              {player.mensDoublesRating && (
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="text-sm">Men's Doubles: {player.mensDoublesRating}</span>
                </div>
              )}
              {player.womensDoublesRating && (
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="text-sm">Women's Doubles: {player.womensDoublesRating}</span>
                </div>
              )}
              {player.mixedDoublesRating && (
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="text-sm">Mixed Doubles: {player.mixedDoublesRating}</span>
                </div>
              )}
            </div>
          </div>

          {player.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
              <p className="text-sm">{player.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Match History</CardTitle>
          <CardDescription>
            {completedMatches.length} completed matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          {matchesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : completedMatches.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No completed matches yet
            </p>
          ) : (
            <div className="space-y-3">
              {completedMatches.slice(0, 10).map((match) => {
                const session = sessions?.find((s: any) => s.id === match.sessionId);
                const isTeam1 = match.team1Player1Id === player.id || match.team1Player2Id === player.id;
                const isWinner = isTeam1
                  ? (match.team1Set1 || 0) + (match.team1Set2 || 0) + (match.team1Set3 || 0) >
                    (match.team2Set1 || 0) + (match.team2Set2 || 0) + (match.team2Set3 || 0)
                  : (match.team2Set1 || 0) + (match.team2Set2 || 0) + (match.team2Set3 || 0) >
                    (match.team1Set1 || 0) + (match.team1Set2 || 0) + (match.team1Set3 || 0);

                return (
                  <div key={match.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{session?.name || "Session"}</p>
                        <p className="text-sm text-muted-foreground">{match.eventType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-right">
                        <p>
                          {match.team1Set1}-{match.team2Set1}, {match.team1Set2}-{match.team2Set2}
                          {match.team1Set3 !== null && `, ${match.team1Set3}-${match.team2Set3}`}
                        </p>
                      </div>
                      <Badge variant={isWinner ? "default" : "secondary"}>
                        {isWinner ? "Won" : "Lost"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
