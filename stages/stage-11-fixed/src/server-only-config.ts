export const serverOnlyStoragePolicy = {
  provider: "local-private-storage",
  bucket: "stage-11-fixed-local-demo",
  access: "server-mediated"
};

export function issueControlledObjectReference(objectKey: string): { objectKey: string; access: "server-mediated" } {
  return {
    objectKey,
    access: "server-mediated"
  };
}

