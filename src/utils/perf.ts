const interactionMarks = new Map<string, number>();

export interface InteractionMeta {
  [key: string]: string | number | boolean;
}

const formatMeta = (meta?: InteractionMeta) => {
  if (!meta) return "";
  return ` ${JSON.stringify(meta)}`;
};

export function markInteractionStart(label: string, meta?: InteractionMeta) {
  if (typeof performance === "undefined") {
    return;
  }
  interactionMarks.set(label, performance.now());
  console.info(`[perf] ${label} start${formatMeta(meta)}`);
}

export function markInteractionEnd(label: string, meta?: InteractionMeta) {
  if (typeof performance === "undefined") {
    return;
  }
  const start = interactionMarks.get(label);
  if (typeof start !== "number") {
    return;
  }
  const duration = performance.now() - start;
  console.info(
    `[perf] ${label} end: ${duration.toFixed(1)}ms${formatMeta(meta)}`
  );
  interactionMarks.delete(label);
}

