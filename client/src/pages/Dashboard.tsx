import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Calendar, Trophy } from "lucide-react";
import SessionCard from "@/components/SessionCard";
import StatCard from "@/components/StatCard";
import CreateSessionDialog from "@/components/CreateSessionDialog";
import EditSessionDialog from "@/components/EditSessionDialog";
import type { Session } from "@shared/schema";

export default function Dashboard() {
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  const { data: sessions = [], isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

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
          value={0}
          icon={Users}
          subtitle="Active this month"
        />
        <StatCard 
          title="Sessions" 
          value={sessions.length} 
          icon={Calendar} 
          subtitle="Total sessions" 
        />
        <StatCard
          title="Matches Played"
          value={0}
          icon={Trophy}
          subtitle="All time"
        />
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Sessions</h2>
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No sessions found. Click "Create Session" to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onViewDetails={() => console.log("View session:", session.id)}
                onEdit={() => setEditingSession(session)}
              />
            ))}
          </div>
        )}
      </div>

      {editingSession && (
        <EditSessionDialog
          session={editingSession}
          open={!!editingSession}
          onOpenChange={(open) => !open && setEditingSession(null)}
        />
      )}
    </div>
  );
}
