import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import PlayerCard from "@/components/PlayerCard";
import CreatePlayerDialog from "@/components/CreatePlayerDialog";

export default function Players() {
  const [searchQuery, setSearchQuery] = useState("");

  const mockPlayers = [
    {
      id: "1",
      name: "Sarah Johnson",
      gender: "Female",
      singlesRating: 1450,
      womensDoublesRating: 1620,
      mixedDoublesRating: 1580,
      preferredCategories: ["Singles", "Women's Doubles", "Mixed Doubles"],
    },
    {
      id: "2",
      name: "Mike Chen",
      gender: "Male",
      singlesRating: 1380,
      mensDoublesRating: 1720,
      mixedDoublesRating: 1650,
      preferredCategories: ["Men's Doubles", "Mixed Doubles"],
    },
    {
      id: "3",
      name: "Emma Davis",
      gender: "Female",
      singlesRating: 1320,
      womensDoublesRating: 1380,
      mixedDoublesRating: 1420,
      preferredCategories: ["Singles", "Women's Doubles", "Mixed Doubles"],
    },
    {
      id: "4",
      name: "Tom Wilson",
      gender: "Male",
      singlesRating: null,
      mensDoublesRating: 1550,
      mixedDoublesRating: 1490,
      preferredCategories: ["Men's Doubles", "Mixed Doubles"],
    },
    {
      id: "5",
      name: "Lisa Park",
      gender: "Female",
      singlesRating: 1720,
      womensDoublesRating: 1650,
      mixedDoublesRating: null,
      preferredCategories: ["Singles", "Women's Doubles"],
    },
    {
      id: "6",
      name: "David Lee",
      gender: "Male",
      singlesRating: 1490,
      mensDoublesRating: 1520,
      mixedDoublesRating: 1470,
      preferredCategories: ["Singles", "Men's Doubles", "Mixed Doubles"],
    },
  ];

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
          <p className="text-muted-foreground">No players found</p>
        </div>
      )}
    </div>
  );
}
