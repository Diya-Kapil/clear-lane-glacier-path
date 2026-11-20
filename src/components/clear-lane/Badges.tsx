import { Captions, Video, Zap, MessageSquareText, CircleCheck, CircleAlert, OctagonX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AccessFeature, LaneStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const FEATURE_META: Record<AccessFeature, { label: string; Icon: typeof Captions }> = {
  captions: { label: "Captions at counter", Icon: Captions },
  interpreter: { label: "Video interpreter available", Icon: Video },
  "visual-alerts": { label: "Visual alerts", Icon: Zap },
  "text-first": { label: "Text-first service", Icon: MessageSquareText },
};

export function FeatureBadge({ feature }: { feature: AccessFeature }) {
  const { label, Icon } = FEATURE_META[feature];
  return (
    <Badge variant="glacier" className="font-medium">
      <Icon aria-hidden /> {label}
    </Badge>
  );
}

const LANE_META: Record<LaneStatus, { label: string; Icon: typeof CircleCheck; bar: string; badge: "success" | "warning" | "danger" }> = {
  quiet: { label: "Quiet", Icon: CircleCheck, bar: "bg-success", badge: "success" },
  busy: { label: "Busy", Icon: CircleAlert, bar: "bg-warning", badge: "warning" },
  full: { label: "Full", Icon: OctagonX, bar: "bg-destructive", badge: "danger" },
};

/** Lane status: text label + icon + meter (never colour alone). */
export function LaneMeter({ status, load }: { status: LaneStatus; load: number }) {
  const m = LANE_META[status];
  return (
    <div className="flex items-center gap-3">
      <Badge variant={m.badge}>
        <m.Icon aria-hidden /> {m.label} today
      </Badge>
      <div
        role="meter"
        aria-label="Service lane busyness"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={load}
        aria-valuetext={`${m.label}, ${load}% booked`}
        className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted"
      >
        <div className={cn("h-full rounded-full", m.bar)} style={{ width: `${load}%` }} />
      </div>
      <span className="w-12 text-right text-sm tabular-nums text-muted-foreground">{load}%</span>
    </div>
  );
}
