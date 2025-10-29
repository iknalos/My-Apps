import { Users, Calendar, Trophy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import SessionCard from "@/components/SessionCard";
import StatCard from "@/components/StatCard";
import CreateSessionDialog from "@/components/CreateSessionDialog";

export default function Dashboard() {
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your badminton sessions and players
          </p>
        </div>
        <CreateSessionDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Players"
          value={127}
          icon={Users}
          subtitle="Active this month"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard title="Sessions" value={8} icon={Calendar} subtitle="This month" />
        <StatCard
          title="Matches Played"
          value={342}
          icon={Trophy}
          subtitle="All time"
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Sessions</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {mockSessions.map((session) => (
            <SessionCard
              key={session.id}
              {...session}
              onViewDetails={() => console.log("View session:", session.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
