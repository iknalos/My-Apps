import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Plus } from "lucide-react";

export default function CreateSessionDialog() {
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Create session submitted");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-session">
          <Plus className="h-4 w-4 mr-2" />
          Create Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>
            Set up a new badminton session with pairing constraints.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="session-name">Session Name</Label>
              <Input
                id="session-name"
                placeholder="e.g. Friday Night Mixed Doubles"
                data-testid="input-session-name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date & Time</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  data-testid="input-session-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courts">Courts Available</Label>
                <Input
                  id="courts"
                  type="number"
                  placeholder="4"
                  min="1"
                  data-testid="input-courts"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-type">Session Type</Label>
              <Select>
                <SelectTrigger id="session-type" data-testid="select-session-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Singles">Singles</SelectItem>
                  <SelectItem value="Men's Doubles">Men's Doubles</SelectItem>
                  <SelectItem value="Women's Doubles">Women's Doubles</SelectItem>
                  <SelectItem value="Mixed Doubles">Mixed Doubles</SelectItem>
                  <SelectItem value="Open Play">Open Play</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-skill-gap">
                Max Skill Gap (Optional)
              </Label>
              <Input
                id="max-skill-gap"
                type="number"
                placeholder="e.g. 200"
                data-testid="input-max-skill-gap"
              />
              <p className="text-xs text-muted-foreground">
                Maximum skill rating difference allowed between teammates
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-games">
                Min Games Per Player (Optional)
              </Label>
              <Input
                id="min-games"
                type="number"
                placeholder="e.g. 3"
                min="1"
                data-testid="input-min-games"
              />
              <p className="text-xs text-muted-foreground">
                Ensures each player gets a minimum number of matches
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" data-testid="button-submit-session">
              Create Session
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
