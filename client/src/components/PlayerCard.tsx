import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Building2 } from "lucide-react";

interface PlayerCardProps {
  id: string;
  name: string;
  gender: string;
  club?: string | null;
  singlesRating?: number | null;
  mensDoublesRating?: number | null;
  womensDoublesRating?: number | null;
  mixedDoublesRating?: number | null;
  preferredCategories: string[];
  onEdit?: () => void;
}

export default function PlayerCard({
  name,
  gender,
  club,
  singlesRating,
  mensDoublesRating,
  womensDoublesRating,
  mixedDoublesRating,
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
              {club && (
                <Badge variant="outline" className="gap-1">
                  <Building2 className="h-3 w-3" />
                  {club}
                </Badge>
              )}
            </div>
            
            <div className="space-y-1 mb-3">
              {singlesRating && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Singles:</span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {singlesRating}
                  </Badge>
                </div>
              )}
              {mensDoublesRating && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Men's Doubles:</span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {mensDoublesRating}
                  </Badge>
                </div>
              )}
              {womensDoublesRating && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Women's Doubles:</span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {womensDoublesRating}
                  </Badge>
                </div>
              )}
              {mixedDoublesRating && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mixed Doubles:</span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {mixedDoublesRating}
                  </Badge>
                </div>
              )}
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
