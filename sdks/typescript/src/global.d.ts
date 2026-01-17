// Type declarations for Node.js globals
declare global {
  const process: NodeProcess;
}

interface NodeProcess {
  env: Record<string, string | undefined>;
}

export {};
