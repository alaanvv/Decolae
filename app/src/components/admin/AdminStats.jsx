import StatCard from '../common/StatCard';
import useAdminStats from './useAdminStats';

export default function AdminStats() {
  const stats = useAdminStats();
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((s) => <StatCard key={s.label} {...s} />)}
    </div>
  );
}
