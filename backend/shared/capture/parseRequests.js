const { AnthropicBedrock } = require("@anthropic-ai/bedrock-sdk");
const { validateSplits } = require("./validateSplits");

const client = new AnthropicBedrock({
  awsRegion: process.env.AWS_REGION,
  timeout: 10_000,
  maxRetries: 1,
});

const SYSTEM_PROMPT = `You turn a user's quick prayer note into structured prayer requests.

Rules:
1. Split the note into one request per distinct person or need. A single need about one person is one request.
2. Notes are often grouped: a person's name on its own line, followed by a bulleted list of needs for that person, sometimes repeated for several people. Each bullet is its own request for the person named in the heading above it, even when the bullet does not repeat the name. Include the person's name in requestText so each request makes sense on its own.
3. requestText: rewrite as a short, clear request in the user's own voice. Remove filler words and false starts and fix grammar. Never add details that are not in the note.
4. prayeeId: set it only when the request clearly refers to someone in <prayees> — the same name (case-insensitive) or an unambiguous reference such as "Mom" when a prayee is named "Mom". A bullet under a heading refers to the person in that heading. Otherwise null. When in doubt, use null.
5. categoryId: set it only when exactly one category in <categories> clearly fits. Otherwise null.
6. Only use ids that appear in the lists. Never invent an id.
7. If the note contains no prayer request, return an empty requests array.`;

const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["requests"],
  properties: {
    requests: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["requestText", "prayeeId", "categoryId"],
        properties: {
          requestText: { type: "string" },
          prayeeId: { type: ["string", "null"] },
          categoryId: { type: ["string", "null"] },
        },
      },
    },
  },
};

function renderList(rows) {
  if (rows.length === 0) return "(none)";
  return rows.map((r) => `${r.id}: ${r.name}`).join("\n");
}

async function callModel(text, prayees, categories) {
  const response = await client.messages.create({
    model: process.env.BEDROCK_MODEL_ID,
    max_tokens: 2048,
    output_config: {
      format: { type: "json_schema", schema: OUTPUT_SCHEMA },
    },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content:
          `<prayees>\n${renderList(prayees)}\n</prayees>\n\n` +
          `<categories>\n${renderList(categories)}\n</categories>\n\n` +
          `<capture>\n${text}\n</capture>`,
      },
    ],
  });

  if (response.stop_reason !== "end_turn") {
    throw new Error(`Model stopped with stop_reason=${response.stop_reason}`);
  }

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock) {
    throw new Error("Model returned no text block");
  }

  try {
    return JSON.parse(textBlock.text);
  } catch {
    throw new Error("Model output was not valid JSON");
  }
}

async function parseRequests(text, prayees, categories) {
  const raw = await callModel(text, prayees, categories);
  return validateSplits(raw, prayees, categories);
}
module.exports = { parseRequests };
