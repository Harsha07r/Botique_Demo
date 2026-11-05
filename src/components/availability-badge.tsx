import { AVAILABILITY_LABEL } from "@/lib/format";
import type { Availability } from "@/lib/types";

const STYLE: Record<Availability, string> = {
  in_stock: "bg-[#e3f3e8] text-[#0a5a2b]",
  made_to_order: "bg-[#fbefd2] text-[#6b4a05]",
  sold_out: "bg-[#eee] text-[#4a4a4a]",
};

export function AvailabilityBadge({ value, className = "" }: { value: Availability; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STYLE[value]} ${className}`}>
      {AVAILABILITY_LABEL[value]}
    </span>
  );
}
