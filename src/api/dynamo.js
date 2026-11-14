// Some of the project's AWS Lambda endpoints answer with a DynamoDB-shaped envelope:
//   { statusCode, body: { status, message: [{ FirstName: { S: "..." }, Age: { N: "27" } }] } }
// This turns that into the plain rows the rest of the app expects. Anything else passes through.

const TYPE_KEYS = ["S", "N", "BOOL"];

function plainValue(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const keys = Object.keys(value);
    if (keys.length === 1 && TYPE_KEYS.includes(keys[0])) {
      return keys[0] === "N" ? Number(value.N) : value[keys[0]];
    }
  }
  return value;
}

export function unwrapDynamo(data) {
  const items = data?.body?.message;
  if (!Array.isArray(items)) return data;
  return items.map((item) =>
    Object.fromEntries(Object.entries(item).map(([key, value]) => [key, plainValue(value)])),
  );
}
