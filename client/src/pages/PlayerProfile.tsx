import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Player, RatingHistory, Match } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

export default function PlayerProfile() {
  const [, params] = useRoute("/players/:id");
  const playerId = params?.id;

  const { data: player, isLoading: playerLoading } = useQuery<Player>({
    queryKey: ["/api/players", playerId],
    enabled: !!playerId,
  });

  const { data: ratingHistory = [], isLoading: historyLoading } = useQuery<RatingHistory[]>({
    queryKey: ["/api/players", playerId, "rating-history"],
    enabled: !!playerId,
  });

  const { data: matches = [], isLoading: matchesLoading } = useQuery<Match[]>({
    queryKey: ["/api/players", playerId, "matches"],
    enabled: !!playerId,
  });

  const { data: allPlayers = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  if (!playerId) {
    return <div className="p-6">Player not found</div>;
  }

  if (playerLoading || historyLoading || matchesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg">Loading player profile...</div>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="p-6">
        <div className="text-center">Player not found</div>
      </div>
    );
  }

  // Calculate stats
  const completedMatches = matches.filter(m => m.status === "completed" && m.team1Set1 !== null);
  const wins = completedMatches.filter(m => {
    const isTeam1 = m.team1Player1Id === playerId || m.team1Player2Id === playerId;
    const team1Sets = [m.team1Set1, m.team1Set2, m.team1Set3].filter((s, i) => {
      const team2Set = [m.team2Set1, m.team2Set2, m.team2Set3][i];
      return s !== null && team2Set !== null && s > team2Set;
    }).length;
    const team2Sets = [m.team2Set1, m.team2Set2, m.team2Set3].filter((s, i) => {
      const team1Set = [m.team1Set1, m.team1Set2, m.team1Set3][i];
      return s !== null && team1Set !== null && s > team1Set;
    }).length;
    return isTeam1 ? team1Sets > team2Sets : team2Sets > team1Sets;
  }).length;

  const winRate = completedMatches.length > 0 ? ((wins / completedMatches.length) * 100).toFixed(1) : "0.0";

  // Prepare chart data - group by event type
  const eventTypes = ["singles", "mixedDoubles", "mensDoubles", "womensDoubles"];
  const eventTypeLabels: Record<string, string> = {
    singles: "Singles",
    mixedDoubles: "Mixed Doubles",
    mensDoubles: "Men's Doubles",
    womensDoubles: "Women's Doubles",
  };

  // Normalize event type
  const normalizeEventType = (eventType: string): string => {
    return eventType.toLowerCase().replace(/['\s]/g, '');
  };

  // Group rating history by event type
  const ratingByEventType = eventTypes.reduce((acc, eventType) => {
    const histories = ratingHistory
      .filter(h => normalizeEventType(h.eventType) === eventType)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    if (histories.length > 0) {
      // Add initial rating point
      const initialRating = histories[0].oldRating;
      acc[eventType] = [
        { date: "Initial", rating: initialRating, eventType },
        ...histories.map((h, idx) => ({
          date: format(new Date(h.createdAt), "MMM dd"),
          rating: h.newRating,
          eventType,
          matchNumber: idx + 1,
        }))
      ];
    }
    return acc;
  }, {} as Record<string, Array<{ date: string; rating: number; eventType: string; matchNumber?: number }>>);

  // Get player name helper
  const getPlayerName = (playerId: string | null): string => {
    if (!playerId) return "";
    const p = allPlayers.find(player => player.id === playerId);
    return p?.name || "Unknown";
  };

  // Format recent matches
  const recentMatches = completedMatches.slice(0, 10);

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="page-player-profile">
      <div className="flex items-center gap-4">
        <Link href="/players">
          <Button variant="ghost" size="icon" data-testid="button-back-to-players">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-player-name">{player.name}</h1>
          <p className="text-muted-foreground">
            {player.gender} • {player.club || "No club"}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Singles Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-singles-rating">{player.singlesRating || 1500}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Doubles Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-doubles-rating">
              {player.gender === "Male" 
                ? (player.mensDoublesRating || 1500)
                : (player.womensDoublesRating || 1500)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mixed Doubles Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-mixed-rating">{player.mixedDoublesRating || 1500}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-win-rate">{winRate}%</div>
            <p className="text-xs text-muted-foreground">{wins}W - {completedMatches.length - wins}L</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Graphs */}
      {Object.entries(ratingByEventType).map(([eventType, data]) => (
        data.length > 1 && (
          <Card key={eventType}>
            <CardHeader>
              <CardTitle>{eventTypeLabels[eventType]} Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis domain={[1000, 2000]} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )
      ))}

      {/* Recent Matches */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Matches</CardTitle>
        </CardHeader>
        <CardContent>
          {recentMatches.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No completed matches yet</p>
          ) : (
            <div className="space-y-3">
              {recentMatches.map((match) => {
                const isTeam1 = match.team1Player1Id === playerId || match.team1Player2Id === playerId;
                const team1Sets = [match.team1Set1, match.team1Set2, match.team1Set3].filter((s, i) => {
                  const team2Set = [match.team2Set1, match.team2Set2, match.team2Set3][i];
                  return s !== null && team2Set !== null && s > team2Set;
                }).length;
                const team2Sets = [match.team2Set1, match.team2Set2, match.team2Set3].filter((s, i) => {
                  const team1Set = [match.team1Set1, match.team1Set2, match.team1Set3][i];
                  return s !== null && team1Set !== null && s > team1Set;
                }).length;
                const won = isTeam1 ? team1Sets > team2Sets : team2Sets > team1Sets;

                // Find rating change for this match
                const ratingChange = ratingHistory.find(h => h.matchId === match.id);

                return (
                  <div
                    key={match.id}
                    className={`p-4 rounded-lg border ${won ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"}`}
                    data-testid={`match-${match.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${won ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                            {won ? "WON" : "LOST"}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {match.eventType}
                          </span>
                        </div>
                        <div className="text-sm">
                          <div className={isTeam1 ? "font-semibold" : ""}>
                            {getPlayerName(match.team1Player1Id)}
                            {match.team1Player2Id && ` & ${getPlayerName(match.team1Player2Id)}`}
                          </div>
                          <div className={!isTeam1 ? "font-semibold" : ""}>
                            {getPlayerName(match.team2Player1Id)}
                            {match.team2Player2Id && ` & ${getPlayerName(match.team2Player2Id)}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-semibold">
                          {team1Sets}-{team2Sets}
                        </div>
                        {ratingChange && (
                          <div className={`flex items-center gap-1 text-sm ${ratingChange.ratingChange > 0 ? "text-green-600 dark:text-green-400" : ratingChange.ratingChange < 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                            {ratingChange.ratingChange > 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : ratingChange.ratingChange < 0 ? (
                              <TrendingDown className="h-4 w-4" />
                            ) : (
                              <Minus className="h-4 w-4" />
                            )}
                            {ratingChange.ratingChange > 0 ? "+" : ""}{ratingChange.ratingChange}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Rating Changes */}
      {ratingHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rating History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ratingHistory.map((history) => (
                <div
                  key={history.id}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                  data-testid={`rating-history-${history.id}`}
                >
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{history.eventType}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(history.createdAt), "MMM dd, yyyy HH:mm")}
                    </div>
                    <div className="text-xs">
                      {history.result === "win" ? "Won" : "Lost"} vs{" "}
                      {history.opponentIds.map(id => getPlayerName(id)).join(" & ")}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm">
                      {history.oldRating} → {history.newRating}
                    </div>
                    <div className={`flex items-center justify-end gap-1 text-sm font-semibold ${history.ratingChange > 0 ? "text-green-600 dark:text-green-400" : history.ratingChange < 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                      {history.ratingChange > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : history.ratingChange < 0 ? (
                        <TrendingDown className="h-4 w-4" />
                      ) : (
                        <Minus className="h-4 w-4" />
                      )}
                      {history.ratingChange > 0 ? "+" : ""}{history.ratingChange}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
