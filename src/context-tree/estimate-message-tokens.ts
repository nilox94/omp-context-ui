import * as compaction from "@oh-my-pi/pi-agent-core/compaction";

type EstimateTokensFn = (message: unknown) => number;

/** OMP exposes estimateTokens at runtime; published d.ts omit it. */
export const estimateMessageTokens: EstimateTokensFn = (
	compaction as { estimateTokens: EstimateTokensFn }
).estimateTokens;
