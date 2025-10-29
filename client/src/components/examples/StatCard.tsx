import StatCard from '../StatCard';
import { Users, Calendar, Trophy } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="Total Players"
        value={127}
        icon={Users}
        subtitle="Active this month"
        trend={{ value: 12, isPositive: true }}
      />
      <StatCard
        title="Sessions"
        value={8}
        icon={Calendar}
        subtitle="This month"
      />
      <StatCard
        title="Matches Played"
        value={342}
        icon={Trophy}
        subtitle="All time"
        trend={{ value: 8, isPositive: true }}
      />
    </div>
  );
}
