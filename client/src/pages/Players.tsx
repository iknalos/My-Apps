import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import PlayerCard from "@/components/PlayerCard";
import CreatePlayerDialog from "@/components/CreatePlayerDialog";

export default function Players() {
  const [searchQuery, setSearchQuery] = useState("");

  const mockPlayers: any[] = [];

  const filteredPlayers = mockPlayers.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Players</h1>
          <p className="text-muted-foreground">
            Manage player profiles and category-specific skill ratings
          </p>
        </div>
        <CreatePlayerDialog />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search players..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          data-testid="input-search-players"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map((player) => (
          <PlayerCard
            key={player.id}
            {...player}
            onEdit={() => console.log("Edit player:", player.id)}
          />
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No players found. Click "Add Player" to create your first player.</p>
        </div>
      )}
    </div>
  );
}
