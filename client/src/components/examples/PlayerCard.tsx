import PlayerCard from '../PlayerCard';

export default function PlayerCardExample() {
  return (
    <div className="p-6 max-w-md space-y-4">
      <PlayerCard
        id="1"
        name="Sarah Johnson"
        gender="Female"
        singlesRating={1450}
        womensDoublesRating={1620}
        mixedDoublesRating={1580}
        preferredCategories={["Singles", "Women's Doubles", "Mixed Doubles"]}
        onEdit={() => console.log('Edit player clicked')}
      />
      <PlayerCard
        id="2"
        name="Mike Chen"
        gender="Male"
        singlesRating={1380}
        mensDoublesRating={1720}
        mixedDoublesRating={1650}
        preferredCategories={["Men's Doubles", "Mixed Doubles"]}
        onEdit={() => console.log('Edit player clicked')}
      />
    </div>
  );
}
