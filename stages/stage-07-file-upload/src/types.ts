export type UploadedFile = {
  name: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

export type DemoFormData = {
  get: (name: string) => UploadedFile | null;
};

export type DemoUploadResult = {
  statusCode: number;
  body: unknown;
};

