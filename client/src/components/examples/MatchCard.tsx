import MatchCard from '../MatchCard';

export default function MatchCardExample() {
  return (
    <div className="p-6 max-w-md space-y-4">
      <MatchCard
        courtNumber={1}
        roundNumber={1}
        team1={{ player1: "Sarah Johnson", player2: "Mike Chen" }}
        team2={{ player1: "Emma Davis", player2: "Tom Wilson" }}
        status="in-progress"
        skillBalance={45}
        onEnterScore={() => console.log('Enter score clicked')}
      />
      <MatchCard
        courtNumber={2}
        roundNumber={1}
        team1={{ player1: "Lisa Park", player2: "David Lee", score: 21 }}
        team2={{ player1: "Anna Smith", player2: "John Brown", score: 18 }}
        status="completed"
        skillBalance={-30}
      />
    </div>
  );
}
