import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  count: number;
  label: string;
  bgColor: string;
  iconColor: string;
  textColor: string;
}

export function StatsCard({ icon: Icon, count, label, bgColor, iconColor, textColor }: StatsCardProps) {
  return (
    <div className={`${bgColor} rounded-2xl p-6 border-2 shadow-md`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${iconColor} rounded-full flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className={`text-3xl font-bold ${textColor}`}>{count}</p>
          <p className={`text-sm font-semibold uppercase ${textColor}`}>{label}</p>
        </div>
      </div>
    </div>
  );
}
