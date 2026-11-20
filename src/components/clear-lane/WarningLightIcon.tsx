import { Cog, Droplet, BatteryWarning, CircleAlert, Disc3, CircleDot, ShieldAlert, Thermometer, LifeBuoy, Waves } from "lucide-react";
import type { WarningLightId } from "@/lib/types";

export const LIGHT_ICONS: Record<WarningLightId, typeof Cog> = {
  "check-engine": Cog,
  oil: Droplet,
  battery: BatteryWarning,
  brake: CircleAlert,
  abs: Disc3,
  "tire-pressure": CircleDot,
  airbag: ShieldAlert,
  coolant: Thermometer,
  steering: LifeBuoy,
  traction: Waves,
};
