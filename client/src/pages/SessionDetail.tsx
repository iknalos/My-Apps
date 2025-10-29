import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Play, RotateCw } from "lucide-react";
import MatchCard from "@/components/MatchCard";
import ScoreEntryDialog from "@/components/ScoreEntryDialog";

export default function SessionDetail() {
  const [activeRound, setActiveRound] = useState(1);

  const mockMatches = [
    {
      id: "1",
      courtNumber: 1,
      roundNumber: 1,
      team1: { player1: "Sarah Johnson", player2: "Mike Chen" },
      team2: { player1: "Emma Davis", player2: "Tom Wilson" },
      status: "in-progress" as const,
      skillBalance: 45,
    },
    {
      id: "2",
      courtNumber: 2,
      roundNumber: 1,
      team1: { player1: "Lisa Park", player2: "David Lee", score: 21 },
      team2: { player1: "Anna Smith", player2: "John Brown", score: 18 },
      status: "completed" as const,
      skillBalance: -30,
    },
    {
      id: "3",
      courtNumber: 3,
      roundNumber: 1,
      team1: { player1: "Chris Anderson", player2: "Maria Garcia" },
      team2: { player1: "Kevin Zhang", player2: "Sophie Taylor" },
      status: "scheduled" as const,
      skillBalance: 15,
    },
    {
      id: "4",
      courtNumber: 4,
      roundNumber: 1,
      team1: { player1: "Ryan Miller", player2: "Jessica Wang" },
      team2: { player1: "Alex Kim", player2: "Rachel Green" },
      status: "scheduled" as const,
      skillBalance: -60,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" data-testid="button-back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Friday Night Mixed Doubles</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
              Active
            </Badge>
            <span className="text-sm text-muted-foreground">
              November 1, 2025 at 7:00 PM
            </span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">16 players • 4 courts</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-regenerate">
            <RotateCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
          <Button data-testid="button-start-round">
            <Play className="h-4 w-4 mr-2" />
            Start Round
          </Button>
        </div>
      </div>

      <Tabs value={`round-${activeRound}`} onValueChange={(v) => setActiveRound(parseInt(v.split('-')[1]))}>
        <TabsList>
          <TabsTrigger value="round-1" data-testid="tab-round-1">Round 1</TabsTrigger>
          <TabsTrigger value="round-2" data-testid="tab-round-2">Round 2</TabsTrigger>
          <TabsTrigger value="round-3" data-testid="tab-round-3">Round 3</TabsTrigger>
        </TabsList>

        <TabsContent value="round-1" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mockMatches.map((match) => (
              <MatchCard
                key={match.id}
                {...match}
                onEnterScore={() => console.log("Enter score for match:", match.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="round-2" className="mt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Round 2 matches will be generated after Round 1 completes</p>
          </div>
        </TabsContent>

        <TabsContent value="round-3" className="mt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Round 3 matches will be generated after Round 2 completes</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
