import { createPublicClient, http } from 'viem';
import { ARC_TESTNET } from './constants';

export const arcClient = createPublicClient({
  transport: http(ARC_TESTNET.rpcUrl),
});

export async function getBlockTimestamp() {
  try {
    const block = await arcClient.getBlock();
    return Number(block.timestamp);
  } catch {
    return Math.floor(Date.now() / 1000);
  }
}
