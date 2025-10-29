import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Edit } from "lucide-react";

interface PlayerCardProps {
  id: string;
  name: string;
  gender: string;
  skillRating: number;
  preferredCategories: string[];
  onEdit?: () => void;
}

export default function PlayerCard({
  name,
  gender,
  skillRating,
  preferredCategories,
  onEdit,
}: PlayerCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const genderColor = gender === "Male" ? "bg-blue-500/10 text-blue-700 dark:text-blue-400" : "bg-pink-500/10 text-pink-700 dark:text-pink-400";

  return (
    <Card className="hover-elevate">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold truncate">{name}</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={onEdit}
                data-testid="button-edit-player"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className={genderColor}>{gender}</Badge>
              <Badge variant="secondary" className="font-mono">
                Rating: {skillRating}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {preferredCategories.map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  className="text-xs"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
