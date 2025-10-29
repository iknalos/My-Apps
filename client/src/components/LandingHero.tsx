import { Button } from "@/components/ui/button";
import { Users, Calendar, Trophy } from "lucide-react";
import heroImage from "@assets/generated_images/Badminton_mixed_doubles_action_730e34d9.png";

export default function LandingHero() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <header className="p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-white">BadmintonPro</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-white hover:text-white">
                Sign In
              </Button>
              <Button variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20">
                Get Started
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-6 py-20 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Smart Badminton Pairing for Inclusive Play
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Balance skill levels, ensure gender-aware mixed doubles, and give every player a fair chance. 
              The pairing software that actually works for everyone.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Button size="lg" variant="default" className="text-lg px-8">
                Create Session
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20">
                View Demo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-20">
              <div className="bg-white/10 backdrop-blur-md rounded-md p-6 border border-white/20">
                <Users className="h-10 w-10 text-white mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-white mb-2">Gender-Aware Pairing</h3>
                <p className="text-sm text-white/80">
                  Automatic mixed doubles balancing with fair partner rotation
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-md p-6 border border-white/20">
                <Calendar className="h-10 w-10 text-white mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-white mb-2">Smart Scheduling</h3>
                <p className="text-sm text-white/80">
                  Balance skill levels while keeping weaker players engaged
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-md p-6 border border-white/20">
                <Trophy className="h-10 w-10 text-white mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-white mb-2">Inclusive Rotation</h3>
                <p className="text-sm text-white/80">
                  Everyone gets to play with variety of partners
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
