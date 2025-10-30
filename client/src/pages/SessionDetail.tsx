import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Play, RotateCw } from "lucide-react";
import { format } from "date-fns";
import MatchCard from "@/components/MatchCard";
import ScoreEntryDialog from "@/components/ScoreEntryDialog";
import type { Session, Match, Player } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SessionDetail() {
  const params = useParams();
  const sessionId = params.id;
  const [, setLocation] = useLocation();
  const [activeRound, setActiveRound] = useState(1);
  const { toast } = useToast();

  const { data: session, isLoading: sessionLoading } = useQuery<Session>({
    queryKey: ["/api/sessions", sessionId],
    enabled: !!sessionId,
  });

  const { data: matches = [], isLoading: matchesLoading } = useQuery<Match[]>({
    queryKey: ["/api/sessions", sessionId, "matches"],
    enabled: !!sessionId,
  });

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const updateScoreMutation = useMutation({
    mutationFn: async ({ matchId, scores }: {
      matchId: string;
      scores: {
        team1Set1: number;
        team1Set2: number;
        team1Set3: number;
        team2Set1: number;
        team2Set2: number;
        team2Set3: number;
      };
    }) => {
      return await apiRequest(`/api/matches/${matchId}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...scores,
          status: "completed",
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "matches"] });
      toast({
        title: "Score saved",
        description: "Match score has been successfully recorded.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save score. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleScoreSubmit = (matchId: string, scores: {
    team1Set1: number;
    team1Set2: number;
    team1Set3: number;
    team2Set1: number;
    team2Set2: number;
    team2Set3: number;
  }) => {
    updateScoreMutation.mutate({ matchId, scores });
  };

  if (sessionLoading || !session) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading session...</p>
      </div>
    );
  }

  // Helper function to get player name by ID
  const getPlayerName = (playerId: string | null): string => {
    if (!playerId) return "";
    const player = players.find(p => p.id === playerId);
    return player?.name || "Unknown";
  };

  // Convert API matches to MatchCard format
  const formatMatchForCard = (match: Match) => {
    // Calculate total sets won for each team
    const team1SetsWon = [match.team1Set1, match.team1Set2, match.team1Set3].filter((s, i) => {
      const team2Set = [match.team2Set1, match.team2Set2, match.team2Set3][i];
      return s != null && team2Set != null && s > team2Set;
    }).length;
    
    const team2SetsWon = [match.team2Set1, match.team2Set2, match.team2Set3].filter((s, i) => {
      const team1Set = [match.team1Set1, match.team1Set2, match.team1Set3][i];
      return s != null && team1Set != null && s > team1Set;
    }).length;
    
    // Determine winner (team that won 2 or more sets)
    const team1IsWinner = team1SetsWon >= 2;
    const team2IsWinner = team2SetsWon >= 2;
    
    return {
      id: match.id,
      courtNumber: match.courtNumber,
      roundNumber: match.roundNumber,
      team1: {
        player1: getPlayerName(match.team1Player1Id),
        player2: match.team1Player2Id ? getPlayerName(match.team1Player2Id) : undefined,
        score: team1SetsWon > 0 ? team1SetsWon : undefined,
        isWinner: team1IsWinner,
      },
      team2: {
        player1: getPlayerName(match.team2Player1Id),
        player2: match.team2Player2Id ? getPlayerName(match.team2Player2Id) : undefined,
        score: team2SetsWon > 0 ? team2SetsWon : undefined,
        isWinner: team2IsWinner,
      },
      status: match.status as "scheduled" | "in-progress" | "completed",
      skillBalance: 0, // Can calculate this if needed
      team1Player1Id: match.team1Player1Id,
      team1Player2Id: match.team1Player2Id,
      team2Player1Id: match.team2Player1Id,
      team2Player2Id: match.team2Player2Id,
    };
  };

  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.roundNumber]) {
      acc[match.roundNumber] = [];
    }
    acc[match.roundNumber].push(formatMatchForCard(match));
    return acc;
  }, {} as Record<number, ReturnType<typeof formatMatchForCard>[]>);

  const status = session.status as "upcoming" | "active" | "completed";
  const statusColors = {
    upcoming: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    active: "bg-green-500/10 text-green-700 dark:text-green-400",
    completed: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocation("/sessions")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{session.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge className={statusColors[status]}>
              {status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {format(new Date(session.date), "MMM dd, yyyy 'at' h:mm a")}
            </span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              {session.sessionTypes.join(", ")}
            </span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              {session.courtsAvailable} courts • {session.numberOfRounds} rounds
            </span>
          </div>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No draws generated yet. Create draws from the Sessions page.
          </p>
        </div>
      ) : (
        <Tabs value={`round-${activeRound}`} onValueChange={(v) => setActiveRound(parseInt(v.split('-')[1]))}>
          <TabsList>
            {Array.from({ length: session.numberOfRounds }, (_, i) => i + 1).map((round) => (
              <TabsTrigger 
                key={round} 
                value={`round-${round}`} 
                data-testid={`tab-round-${round}`}
              >
                Round {round}
              </TabsTrigger>
            ))}
          </TabsList>

          {Array.from({ length: session.numberOfRounds }, (_, i) => i + 1).map((round) => (
            <TabsContent key={round} value={`round-${round}`} className="mt-6">
              {matchesByRound[round] && matchesByRound[round].length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {matchesByRound[round].map((match) => (
                    <div key={match.id}>
                      <MatchCard
                        {...match}
                        onEnterScore={() => {}}
                      />
                      {match.status !== "completed" && (
                        <div className="mt-2">
                          <ScoreEntryDialog
                            matchId={match.id}
                            team1Player1={match.team1.player1}
                            team1Player2={match.team1.player2}
                            team2Player1={match.team2.player1}
                            team2Player2={match.team2.player2}
                            onScoreSubmit={handleScoreSubmit}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No matches in this round</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
