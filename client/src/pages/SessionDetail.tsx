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
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
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
      return await apiRequest("PATCH", `/api/matches/${matchId}`, {
        ...scores,
        status: "completed",
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

  // Helper function to get player rating based on event type
  const getPlayerRating = (playerId: string | null, eventType: string): number => {
    if (!playerId) return 1500; // Default rating
    const player = players.find(p => p.id === playerId);
    if (!player) return 1500;
    
    // Normalize event type to handle both formats ("Mixed Doubles" and "mixedDoubles")
    const normalizedType = eventType.toLowerCase().replace(/['\s]/g, '');
    
    switch (normalizedType) {
      case "singles":
        return player.singlesRating || 1500;
      case "mensdoubles":
        return player.mensDoublesRating || 1500;
      case "womensdoubles":
        return player.womensDoublesRating || 1500;
      case "mixeddoubles":
        return player.mixedDoublesRating || 1500;
      default:
        return 1500;
    }
  };

  // Calculate handicap based on rating difference
  const calculateHandicap = (team1Rating: number, team2Rating: number): string | null => {
    const diff = Math.abs(team1Rating - team2Rating);
    
    if (diff < 100) {
      return null; // No handicap needed for close matches
    }
    
    const higherTeam = team1Rating > team2Rating ? "Team 1" : "Team 2";
    const lowerTeam = team1Rating > team2Rating ? "Team 2" : "Team 1";
    
    // Calculate required extra points for stronger team
    // For every 100 rating points difference, stronger team needs +2 points to win
    const extraPoints = Math.floor(diff / 100) * 2;
    
    return `Handicap: ${higherTeam} must win by ${extraPoints}+ points per set`;
  };

  // Convert API matches to MatchCard format
  const formatMatchForCard = (match: Match) => {
    // Get player ratings based on event type
    const team1Player1Rating = getPlayerRating(match.team1Player1Id, match.eventType);
    const team1Player2Rating = match.team1Player2Id ? getPlayerRating(match.team1Player2Id, match.eventType) : 0;
    const team2Player1Rating = getPlayerRating(match.team2Player1Id, match.eventType);
    const team2Player2Rating = match.team2Player2Id ? getPlayerRating(match.team2Player2Id, match.eventType) : 0;
    
    // Calculate team ratings (average for doubles, direct for singles)
    const team1Rating = match.team1Player2Id 
      ? Math.round((team1Player1Rating + team1Player2Rating) / 2)
      : team1Player1Rating;
    const team2Rating = match.team2Player2Id
      ? Math.round((team2Player1Rating + team2Player2Rating) / 2)
      : team2Player1Rating;
    
    // Calculate skill balance and handicap
    const skillBalance = team1Rating - team2Rating;
    const handicapInfo = calculateHandicap(team1Rating, team2Rating);
    
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
    
    // Check if match has been scored (has at least set 1 and 2 scores)
    const isMatchScored = match.team1Set1 !== null && match.team2Set1 !== null && 
                          match.team1Set2 !== null && match.team2Set2 !== null;
    
    // Format set scores for display (e.g., "21-19, 21-18")
    const formatSetScores = (team1Sets: (number | null)[], team2Sets: (number | null)[]) => {
      const scores: string[] = [];
      for (let i = 0; i < 3; i++) {
        if (team1Sets[i] !== null && team2Sets[i] !== null) {
          scores.push(`${team1Sets[i]}-${team2Sets[i]}`);
        }
      }
      return scores.join(", ");
    };
    
    const team1Sets = [match.team1Set1, match.team1Set2, match.team1Set3];
    const team2Sets = [match.team2Set1, match.team2Set2, match.team2Set3];
    const setScores = formatSetScores(team1Sets, team2Sets);
    
    return {
      id: match.id,
      courtNumber: match.courtNumber,
      roundNumber: match.roundNumber,
      eventType: match.eventType,
      team1: {
        player1: getPlayerName(match.team1Player1Id),
        player2: match.team1Player2Id ? getPlayerName(match.team1Player2Id) : undefined,
        player1Rating: team1Player1Rating,
        player2Rating: team1Player2Rating > 0 ? team1Player2Rating : undefined,
        score: isMatchScored ? team1SetsWon : undefined,
        isWinner: team1IsWinner,
        setScores: setScores,
      },
      team2: {
        player1: getPlayerName(match.team2Player1Id),
        player2: match.team2Player2Id ? getPlayerName(match.team2Player2Id) : undefined,
        player1Rating: team2Player1Rating,
        player2Rating: team2Player2Rating > 0 ? team2Player2Rating : undefined,
        score: isMatchScored ? team2SetsWon : undefined,
        isWinner: team2IsWinner,
        setScores: setScores,
      },
      status: match.status as "scheduled" | "in-progress" | "completed",
      skillBalance,
      handicapInfo: handicapInfo || undefined,
      team1Player1Id: match.team1Player1Id,
      team1Player2Id: match.team1Player2Id,
      team2Player1Id: match.team2Player1Id,
      team2Player2Id: match.team2Player2Id,
      // Store raw scores for editing
      team1Set1: match.team1Set1,
      team1Set2: match.team1Set2,
      team1Set3: match.team1Set3,
      team2Set1: match.team2Set1,
      team2Set2: match.team2Set2,
      team2Set3: match.team2Set3,
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
                        onEnterScore={() => setSelectedMatchId(match.id)}
                      />
                      <ScoreEntryDialog
                        matchId={match.id}
                        team1Player1={match.team1.player1}
                        team1Player2={match.team1.player2}
                        team2Player1={match.team2.player1}
                        team2Player2={match.team2.player2}
                        open={selectedMatchId === match.id}
                        onOpenChange={(open) => {
                          if (!open) setSelectedMatchId(null);
                        }}
                        initialScores={match.status === "completed" ? {
                          team1Set1: match.team1Set1 || 0,
                          team1Set2: match.team1Set2 || 0,
                          team1Set3: match.team1Set3 || 0,
                          team2Set1: match.team2Set1 || 0,
                          team2Set2: match.team2Set2 || 0,
                          team2Set3: match.team2Set3 || 0,
                        } : undefined}
                        onScoreSubmit={(matchId, scores) => {
                          handleScoreSubmit(matchId, scores);
                          setSelectedMatchId(null);
                        }}
                      />
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
