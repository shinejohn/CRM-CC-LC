/**
 * Utility to simulate viable async API operations for UI loading states.
 * Replaces hardcoded synchronous setTimeout callbacks.
 */
export const simulateApiDelay = (ms: number = 1500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const simulateStreamingResponse = async function* (fullText: string, speedMs: number = 30) {
  for (let i = 0; i < fullText.length; i++) {
    await simulateApiDelay(speedMs);
    yield fullText.substring(0, i + 1);
  }
};
