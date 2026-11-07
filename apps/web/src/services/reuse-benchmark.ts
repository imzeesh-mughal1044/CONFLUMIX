import type { ReuseListing } from "@/types/reuse";

export type ReuseBenchmarkAvailable = {
  status: "available";
  currency: "PKR";
  lowerBound: number;
  upperBound: number;
  comparableCount: number;
  dimensions: string[];
  coverageStart?: string;
  coverageEnd?: string;
  methodology: "p25-p75";
  limitations: string[];
};

export type ReuseBenchmarkResult =
  | ReuseBenchmarkAvailable
  | {
      status: "insufficient";
      reason: string;
      comparableCount?: number;
      unresolvedThreshold: true;
    };

export async function getReusePriceBenchmark(
  listing: ReuseListing,
): Promise<ReuseBenchmarkResult> {
  void listing;
  return {
    status: "insufficient",
    reason:
      "No connected benchmark service or eligible completed Reuse transaction dataset is available.",
    unresolvedThreshold: true,
  };
}
