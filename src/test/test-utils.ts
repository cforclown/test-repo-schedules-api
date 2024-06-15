
export function docToJSON (doc: any): Record<string, any> {
  return JSON.parse(JSON.stringify(doc));
}

interface IExpectDocToEqualOpt {
  ignoreTimestamp?: boolean;
  excludeFields?: string[];
}
export function expectDocumentToEqual (
  doc: any,
  toEqual: any,
  opt?: IExpectDocToEqualOpt
): void {
  const rawDoc = docToJSON(doc);
  const toEqualRaw = docToJSON(toEqual);

  if (opt?.ignoreTimestamp) {
    delete toEqualRaw.createdAt;
    delete toEqualRaw.updatedAt;
  }
  if (opt?.excludeFields?.length) {
    opt.excludeFields.forEach(field => {
      delete rawDoc[field];
      delete toEqualRaw[field];
    });
  }

  expect(rawDoc).toMatchObject(toEqualRaw);
}
