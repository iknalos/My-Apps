import SessionCard from '../SessionCard';

export default function SessionCardExample() {
  return (
    <div className="p-6 max-w-sm">
      <SessionCard
        id="1"
        name="Friday Night Mixed Doubles"
        date={new Date(2025, 10, 1, 19, 0)}
        sessionType="Mixed Doubles"
        courtsAvailable={4}
        participantCount={16}
        status="upcoming"
        onViewDetails={() => console.log('View details clicked')}
      />
    </div>
  );
}
