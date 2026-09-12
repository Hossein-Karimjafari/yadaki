import {
  Cog,
  Disc3,
  Droplets,
  Fuel,
  Funnel,
  Gauge,
  Lightbulb,
  Snowflake,
  Star,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  disc: Disc3,
  gauge: Gauge,
  wrench: Wrench,
  zap: Zap,
  snowflake: Snowflake,
  funnel: Funnel,
  droplets: Droplets,
  fuel: Fuel,
  lightbulb: Lightbulb,
  cog: Cog,
  // legacy emoji values (before lucide migration)
  "🛑": Disc3,
  "⚙️": Gauge,
  "🔧": Wrench,
  "⚡": Zap,
  "❄️": Snowflake,
  "🧯": Funnel,
  "🛢️": Droplets,
  "⛽": Fuel,
  "💡": Lightbulb,
  "🌀": Cog,
};

export function CategoryIcon({
  name,
  className = "size-6",
}: {
  name?: string | null;
  className?: string;
}) {
  const Icon = (name && CATEGORY_ICONS[name]) || Wrench;
  return <Icon className={className} />;
}

export function Stars({
  value,
  className = "size-4",
}: {
  value: number;
  className?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      dir="ltr"
      aria-label={`${value} از ۵ ستاره`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${className} ${
            i <= value
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200"
          }`}
        />
      ))}
    </span>
  );
}
