import { unstable_cache as nextCache } from "next/cache";
import { cache as reactCache } from "react";

// Avoid "any" by using "unknown" in the constraint and default
type Callback<Args extends unknown[] = unknown[], Return = unknown> = (
  ...args: Args
) => Promise<Return>;

export function cache<T extends Callback>(
  cb: T,
  keyParts: string[],
  options: { revalidate?: number | false; tags?: string[] } = {}
) {
  return nextCache(reactCache(cb), keyParts, options);
}
