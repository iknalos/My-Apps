import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Activity } from "lucide-react";
import { format } from "date-fns";

interface SessionCardProps {
  id: string;
  name: string;
  date: Date;
  sessionType: string;
  courtsAvailable: number;
  participantCount: number;
  status: "upcoming" | "active" | "completed";
  onViewDetails?: () => void;
}

export default function SessionCard({
  name,
  date,
  sessionType,
  courtsAvailable,
  participantCount,
  status,
  onViewDetails,
}: SessionCardProps) {
  const statusColors = {
    upcoming: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    active: "bg-green-500/10 text-green-700 dark:text-green-400",
    completed: "bg-muted text-muted-foreground",
  };

  const statusBorderColors = {
    upcoming: "border-l-blue-500",
    active: "border-l-green-500",
    completed: "border-l-muted",
  };

  return (
    <Card className={`border-l-4 ${statusBorderColors[status]} hover-elevate`}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{name}</CardTitle>
        <Badge className={statusColors[status]}>{status}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(date, "MMM dd, yyyy 'at' h:mm a")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>{sessionType}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {participantCount} players • {courtsAvailable} courts
            </span>
          </div>
        </div>
        <Button
          className="w-full"
          variant="outline"
          onClick={onViewDetails}
          data-testid="button-view-session"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
