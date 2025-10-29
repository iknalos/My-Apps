import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SessionCard from "@/components/SessionCard";
import CreateSessionDialog from "@/components/CreateSessionDialog";

export default function Sessions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const mockSessions = [
    {
      id: "1",
      name: "Friday Night Mixed Doubles",
      date: new Date(2025, 10, 1, 19, 0),
      sessionType: "Mixed Doubles",
      courtsAvailable: 4,
      participantCount: 16,
      status: "upcoming" as const,
    },
    {
      id: "2",
      name: "Weekend Warriors",
      date: new Date(2025, 9, 30, 10, 0),
      sessionType: "Open Play",
      courtsAvailable: 6,
      participantCount: 24,
      status: "active" as const,
    },
    {
      id: "3",
      name: "Tuesday Training",
      date: new Date(2025, 9, 27, 18, 0),
      sessionType: "Singles",
      courtsAvailable: 3,
      participantCount: 12,
      status: "completed" as const,
    },
    {
      id: "4",
      name: "Monday Mixed",
      date: new Date(2025, 10, 4, 18, 30),
      sessionType: "Mixed Doubles",
      courtsAvailable: 5,
      participantCount: 20,
      status: "upcoming" as const,
    },
    {
      id: "5",
      name: "Saturday Open",
      date: new Date(2025, 9, 23, 14, 0),
      sessionType: "Open Play",
      courtsAvailable: 4,
      participantCount: 18,
      status: "completed" as const,
    },
  ];

  const filteredSessions = mockSessions.filter((session) => {
    const matchesSearch = session.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sessions</h1>
          <p className="text-muted-foreground">
            Manage and organize badminton sessions
          </p>
        </div>
        <CreateSessionDialog />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search sessions..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-sessions"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sessions</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSessions.map((session) => (
          <SessionCard
            key={session.id}
            {...session}
            onViewDetails={() => console.log("View session:", session.id)}
          />
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No sessions found</p>
        </div>
      )}
    </div>
  );
}
