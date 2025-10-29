import PlayerCard from '../PlayerCard';

export default function PlayerCardExample() {
  return (
    <div className="p-6 max-w-md">
      <PlayerCard
        id="1"
        name="Sarah Johnson"
        gender="Female"
        skillRating={1450}
        preferredCategories={["Mixed Doubles", "Women's Doubles"]}
        onEdit={() => console.log('Edit player clicked')}
      />
    </div>
  );
}
