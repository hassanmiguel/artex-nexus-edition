/**
 * Provider presets for the LLM settings "New/Edit model profile" form.
 *
 * Selecting a preset fills in the API format, base URL and a suggested model;
 * the user still supplies the API key. Entries without an LLM chat endpoint are
 * kept in the catalog because they are part of the supported API ecosystem, but
 * are marked as non-chat so the form does not suggest a base URL that cannot
 * serve /chat/completions.
 */

export type LLMProviderFormat = "anthropic" | "openai" | "openai-responses" | "";

export type LLMProviderPreset = {
  id: string;
  name: string;
  category: string;
  format: LLMProviderFormat;
  baseUrl: string;
  model: string;
  note?: string;
};

export const LLM_PROVIDER_CATEGORIES = {
  llm: "AI / LLM",
  multi: "Multi-model gateway",
  image: "Image generation",
  video: "Video generation",
  audio: "Voice / Audio / Speech",
  search: "Search / Web / Research",
  coding: "Coding / Developer",
  vector: "Vector DB / AI memory",
  maps: "Maps / Location",
  payment: "Payment",
  auth: "Authentication",
  email: "Email / Communication",
  storage: "Storage / File",
  analytics: "Analytics / Monitoring",
  translate: "Translation",
  automation: "Automation / Workflow",
  data: "Weather / Finance / Data",
  document: "Document / OCR / PDF",
  simulation: "Robotics / 3D / Simulation",
} as const;

export type LLMProviderCategory = keyof typeof LLM_PROVIDER_CATEGORIES;

type Row = [
  id: string,
  name: string,
  category: LLMProviderCategory,
  format: LLMProviderFormat,
  baseUrl: string,
  model: string,
];

const NON_CHAT_NOTE =
  "Not an LLM chat API. Use its native SDK or an OpenAI-compatible gateway; fill the fields below manually.";

// Base URLs are the providers' public OpenAI-compatible/Anthropic-compatible
// endpoints where one exists. {placeholders} must be replaced by the user.
const ROWS: Row[] = [
  // 1. AI / LLM providers
  ["openai", "OpenAI", "llm", "openai", "https://api.openai.com/v1", "gpt-4o"],
  ["anthropic", "Anthropic (Claude)", "llm", "anthropic", "https://api.anthropic.com/v1", "claude-sonnet-4-5"],
  ["google-gemini", "Google Gemini", "llm", "openai", "https://generativelanguage.googleapis.com/v1beta/openai", "gemini-2.5-flash"],
  ["deepseek", "DeepSeek", "llm", "openai", "https://api.deepseek.com/v1", "deepseek-chat"],
  ["xai", "xAI (Grok)", "llm", "openai", "https://api.x.ai/v1", "grok-4"],
  ["mistral", "Mistral AI", "llm", "openai", "https://api.mistral.ai/v1", "mistral-large-latest"],
  ["cohere", "Cohere", "llm", "openai", "https://api.cohere.com/compatibility/v1", "command-a-03-2025"],
  ["meta-llama", "Meta Llama", "llm", "", "", ""],
  ["alibaba-qwen", "Alibaba Qwen", "llm", "openai", "https://dashscope.aliyuncs.com/compatible-mode/v1", "qwen-plus"],
  ["azure-ai", "Microsoft Azure AI", "llm", "openai", "https://{resource}.openai.azure.com/openai/deployments/{deployment}", ""],
  ["amazon-bedrock", "Amazon Bedrock", "llm", "", "", ""],
  ["ibm-watsonx", "IBM watsonx", "llm", "openai", "https://us-south.ml.cloud.ibm.com/ml/v1", ""],
  ["ai21", "AI21 Labs", "llm", "openai", "https://api.ai21.com/studio/v1", "jamba-large"],
  ["moonshot", "Moonshot AI (Kimi)", "llm", "openai", "https://api.moonshot.ai/v1", "kimi-k2"],
  ["zai", "Z.ai (GLM)", "llm", "openai", "https://api.z.ai/api/paas/v4", "glm-4.6"],
  ["minimax", "MiniMax", "llm", "openai", "https://api.minimaxi.com/v1", "MiniMax-Text-01"],
  ["nvidia-nim", "NVIDIA NIM", "llm", "openai", "https://integrate.api.nvidia.com/v1", ""],
  ["baidu-ernie", "Baidu ERNIE", "llm", "openai", "https://qianfan.baidubce.com/v2", "ernie-4.0-8k"],
  ["tencent-hunyuan", "Tencent Hunyuan", "llm", "openai", "https://api.hunyuan.cloud.tencent.com/v1", "hunyuan-turbo"],
  ["upstage", "Upstage", "llm", "openai", "https://api.upstage.ai/v1", "solar-pro2"],
  ["groq", "Groq", "llm", "openai", "https://api.groq.com/openai/v1", "llama-3.3-70b-versatile"],
  ["cerebras", "Cerebras", "llm", "openai", "https://api.cerebras.ai/v1", "llama-3.3-70b"],
  ["sambanova", "SambaNova", "llm", "openai", "https://api.sambanova.ai/v1", "Meta-Llama-3.3-70B-Instruct"],
  ["perplexity", "Perplexity", "llm", "openai", "https://api.perplexity.ai", "sonar-pro"],
  ["google-vertex", "Google Vertex AI", "llm", "openai", "https://{region}-aiplatform.googleapis.com/v1", ""],

  // 2. Multi-model API providers
  ["openrouter", "OpenRouter", "multi", "openai", "https://openrouter.ai/api/v1", "openai/gpt-4o"],
  ["together", "Together AI", "multi", "openai", "https://api.together.xyz/v1", "meta-llama/Llama-3.3-70B-Instruct-Turbo"],
  ["huggingface", "Hugging Face", "multi", "openai", "https://api-inference.huggingface.co/v1", ""],
  ["replicate", "Replicate", "multi", "", "", ""],
  ["fireworks", "Fireworks AI", "multi", "openai", "https://api.fireworks.ai/inference/v1", ""],
  ["deepinfra", "DeepInfra", "multi", "openai", "https://api.deepinfra.com/v1/openai", ""],
  ["edenai", "Eden AI", "multi", "", "", ""],
  ["siliconflow", "SiliconFlow", "multi", "openai", "https://api.siliconflow.cn/v1", "Qwen/Qwen2.5-72B-Instruct"],
  ["cloudflare-workers-ai", "Cloudflare Workers AI", "multi", "openai", "https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/v1", ""],
  ["vercel-ai-gateway", "Vercel AI Gateway", "multi", "openai", "https://ai-gateway.vercel.sh/v1", ""],
  ["litellm", "LiteLLM", "multi", "openai", "http://localhost:4000/v1", ""],
  ["portkey", "Portkey", "multi", "openai", "https://api.portkey.ai/v1", ""],
  ["helicone", "Helicone", "multi", "openai", "https://ai-gateway.helicone.ai/v1", ""],
  ["unify", "Unify AI", "multi", "openai", "https://api.unify.ai/v1", ""],

  // 3. Image generation APIs
  ["black-forest-labs", "Black Forest Labs (FLUX)", "image", "", "", ""],
  ["stability-ai", "Stability AI", "image", "", "", ""],
  ["fal-ai", "fal.ai", "image", "", "", ""],
  ["runware", "Runware", "image", "", "", ""],
  ["ideogram", "Ideogram", "image", "", "", ""],
  ["recraft", "Recraft", "image", "", "", ""],
  ["leonardo-ai", "Leonardo AI", "image", "", "", ""],
  ["openai-images", "OpenAI Images", "image", "openai", "https://api.openai.com/v1", "gpt-image-1"],
  ["google-imagen", "Google Imagen", "image", "", "", ""],
  ["adobe-firefly", "Adobe Firefly", "image", "", "", ""],
  ["bria-ai", "Bria AI", "image", "", "", ""],

  // 4. Video generation APIs
  ["runway", "Runway", "video", "", "", ""],
  ["luma-ai", "Luma AI", "video", "", "", ""],
  ["kling-ai", "Kling AI", "video", "", "", ""],
  ["pika", "Pika", "video", "", "", ""],
  ["heygen", "HeyGen", "video", "", "", ""],
  ["synthesia", "Synthesia", "video", "", "", ""],
  ["google-veo", "Google Veo", "video", "", "", ""],

  // 5. Voice / Audio / Speech APIs
  ["elevenlabs", "ElevenLabs", "audio", "", "", ""],
  ["deepgram", "Deepgram", "audio", "", "", ""],
  ["assemblyai", "AssemblyAI", "audio", "", "", ""],
  ["cartesia", "Cartesia", "audio", "", "", ""],
  ["hume-ai", "Hume AI", "audio", "", "", ""],
  ["playht", "PlayHT", "audio", "", "", ""],
  ["speechify", "Speechify", "audio", "", "", ""],
  ["openai-audio", "OpenAI Audio", "audio", "openai", "https://api.openai.com/v1", "gpt-4o-mini-tts"],
  ["google-cloud-speech", "Google Cloud Speech", "audio", "", "", ""],
  ["azure-speech", "Azure Speech", "audio", "", "", ""],
  ["amazon-polly", "Amazon Polly", "audio", "", "", ""],
  ["nvidia-riva", "NVIDIA Riva", "audio", "", "", ""],
  ["resemble-ai", "Resemble AI", "audio", "", "", ""],
  ["gladia", "Gladia", "audio", "", "", ""],

  // 6. Search / Web / Research APIs
  ["tavily", "Tavily", "search", "", "", ""],
  ["exa", "Exa", "search", "", "", ""],
  ["brave-search", "Brave Search", "search", "", "", ""],
  ["serpapi", "SerpAPI", "search", "", "", ""],
  ["firecrawl", "Firecrawl", "search", "", "", ""],
  ["jina-ai", "Jina AI", "search", "openai", "https://api.jina.ai/v1", ""],
  ["google-custom-search", "Google Programmable Search", "search", "", "", ""],
  ["bing-search", "Bing Search", "search", "", "", ""],
  ["you-com", "You.com", "search", "", "", ""],
  ["dataforseo", "DataForSEO", "search", "", "", ""],
  ["scrapingbee", "ScrapingBee", "search", "", "", ""],
  ["apify", "Apify", "search", "", "", ""],

  // 7. Coding / Developer APIs
  ["github", "GitHub API", "coding", "", "", ""],
  ["gitlab", "GitLab API", "coding", "", "", ""],
  ["sourcegraph", "Sourcegraph", "coding", "", "", ""],
  ["greptile", "Greptile", "coding", "", "", ""],
  ["coderabbit", "CodeRabbit", "coding", "", "", ""],
  ["e2b", "E2B", "coding", "", "", ""],
  ["daytona", "Daytona", "coding", "", "", ""],
  ["codesandbox", "CodeSandbox", "coding", "", "", ""],
  ["bitbucket", "Bitbucket API", "coding", "", "", ""],
  ["sentry", "Sentry", "coding", "", "", ""],
  ["sonarqube", "SonarQube", "coding", "", "", ""],

  // 8. Vector databases / AI memory
  ["pinecone", "Pinecone", "vector", "", "", ""],
  ["qdrant", "Qdrant", "vector", "", "", ""],
  ["weaviate", "Weaviate", "vector", "", "", ""],
  ["chroma", "Chroma", "vector", "", "", ""],
  ["milvus", "Milvus", "vector", "", "", ""],
  ["zilliz", "Zilliz", "vector", "", "", ""],
  ["supabase", "Supabase", "vector", "", "", ""],
  ["mongodb-atlas", "MongoDB Atlas", "vector", "", "", ""],
  ["redis", "Redis", "vector", "", "", ""],
  ["elasticsearch", "Elasticsearch", "vector", "", "", ""],
  ["typesense", "Typesense", "vector", "", "", ""],
  ["lancedb", "LanceDB", "vector", "", "", ""],

  // 9. Maps / Location APIs
  ["google-maps", "Google Maps", "maps", "", "", ""],
  ["mapbox", "Mapbox", "maps", "", "", ""],
  ["here", "HERE Technologies", "maps", "", "", ""],
  ["openstreetmap", "OpenStreetMap", "maps", "", "", ""],
  ["tomtom", "TomTom", "maps", "", "", ""],
  ["locationiq", "LocationIQ", "maps", "", "", ""],

  // 10. Payment APIs
  ["stripe", "Stripe", "payment", "", "", ""],
  ["paypal", "PayPal", "payment", "", "", ""],
  ["flutterwave", "Flutterwave", "payment", "", "", ""],
  ["paystack", "Paystack", "payment", "", "", ""],
  ["mpesa", "M-Pesa Daraja", "payment", "", "", ""],
  ["square", "Square", "payment", "", "", ""],
  ["adyen", "Adyen", "payment", "", "", ""],
  ["razorpay", "Razorpay", "payment", "", "", ""],
  ["coinbase", "Coinbase Developer Platform", "payment", "", "", ""],

  // 11. Authentication APIs
  ["clerk", "Clerk", "auth", "", "", ""],
  ["auth0", "Auth0", "auth", "", "", ""],
  ["firebase-auth", "Firebase Authentication", "auth", "", "", ""],
  ["workos", "WorkOS", "auth", "", "", ""],
  ["okta", "Okta", "auth", "", "", ""],
  ["keycloak", "Keycloak", "auth", "", "", ""],

  // 12. Email / Communication APIs
  ["resend", "Resend", "email", "", "", ""],
  ["sendgrid", "SendGrid", "email", "", "", ""],
  ["mailgun", "Mailgun", "email", "", "", ""],
  ["amazon-ses", "Amazon SES", "email", "", "", ""],
  ["postmark", "Postmark", "email", "", "", ""],
  ["twilio", "Twilio", "email", "", "", ""],
  ["vonage", "Vonage", "email", "", "", ""],
  ["infobip", "Infobip", "email", "", "", ""],
  ["whatsapp", "WhatsApp Business Cloud API", "email", "", "", ""],
  ["telegram", "Telegram Bot API", "email", "", "", ""],
  ["discord", "Discord API", "email", "", "", ""],
  ["slack", "Slack API", "email", "", "", ""],

  // 13. Storage / File APIs
  ["cloudinary", "Cloudinary", "storage", "", "", ""],
  ["amazon-s3", "Amazon S3", "storage", "", "", ""],
  ["cloudflare-r2", "Cloudflare R2", "storage", "", "", ""],
  ["google-cloud-storage", "Google Cloud Storage", "storage", "", "", ""],
  ["azure-blob", "Azure Blob Storage", "storage", "", "", ""],
  ["backblaze-b2", "Backblaze B2", "storage", "", "", ""],
  ["uploadcare", "Uploadcare", "storage", "", "", ""],

  // 14. Analytics / Monitoring APIs
  ["posthog", "PostHog", "analytics", "", "", ""],
  ["mixpanel", "Mixpanel", "analytics", "", "", ""],
  ["amplitude", "Amplitude", "analytics", "", "", ""],
  ["datadog", "Datadog", "analytics", "", "", ""],
  ["new-relic", "New Relic", "analytics", "", "", ""],
  ["grafana", "Grafana", "analytics", "", "", ""],
  ["better-stack", "Logtail / Better Stack", "analytics", "", "", ""],
  ["opentelemetry", "OpenTelemetry", "analytics", "", "", ""],

  // 15. Translation APIs
  ["deepl", "DeepL", "translate", "", "", ""],
  ["google-translate", "Google Translate", "translate", "", "", ""],
  ["microsoft-translator", "Microsoft Translator", "translate", "", "", ""],
  ["amazon-translate", "Amazon Translate", "translate", "", "", ""],
  ["modernmt", "ModernMT", "translate", "", "", ""],
  ["libretranslate", "LibreTranslate", "translate", "", "", ""],

  // 16. Automation / Workflow APIs
  ["zapier", "Zapier", "automation", "", "", ""],
  ["make", "Make", "automation", "", "", ""],
  ["n8n", "n8n", "automation", "", "", ""],
  ["pipedream", "Pipedream", "automation", "", "", ""],
  ["temporal", "Temporal", "automation", "", "", ""],
  ["trigger-dev", "Trigger.dev", "automation", "", "", ""],
  ["inngest", "Inngest", "automation", "", "", ""],
  ["activepieces", "Activepieces", "automation", "", "", ""],

  // 17. Weather / Finance / Data APIs
  ["openweather", "OpenWeather", "data", "", "", ""],
  ["weatherapi", "WeatherAPI", "data", "", "", ""],
  ["tomorrow-io", "Tomorrow.io", "data", "", "", ""],
  ["alpha-vantage", "Alpha Vantage", "data", "", "", ""],
  ["polygon-io", "Polygon.io", "data", "", "", ""],
  ["finnhub", "Finnhub", "data", "", "", ""],
  ["twelve-data", "Twelve Data", "data", "", "", ""],
  ["coingecko", "CoinGecko", "data", "", "", ""],
  ["coinmarketcap", "CoinMarketCap", "data", "", "", ""],
  ["kraken", "Kraken API", "data", "", "", ""],
  ["binance", "Binance API", "data", "", "", ""],
  ["yahoo-finance", "Yahoo Finance", "data", "", "", ""],

  // 18. Document / OCR / PDF APIs
  ["google-document-ai", "Google Document AI", "document", "", "", ""],
  ["azure-document-intelligence", "Azure AI Document Intelligence", "document", "", "", ""],
  ["aws-textract", "AWS Textract", "document", "", "", ""],
  ["mistral-ocr", "Mistral OCR", "document", "openai", "https://api.mistral.ai/v1", "mistral-ocr-latest"],
  ["unstructured", "Unstructured", "document", "", "", ""],
  ["mindee", "Mindee", "document", "", "", ""],
  ["adobe-pdf-services", "Adobe PDF Services", "document", "", "", ""],
  ["ocr-space", "OCR.space", "document", "", "", ""],

  // 19. Robotics / 3D / Simulation APIs
  ["nvidia-omniverse", "NVIDIA Omniverse", "simulation", "", "", ""],
  ["nvidia-isaac", "NVIDIA Isaac", "simulation", "", "", ""],
  ["unity", "Unity API", "simulation", "", "", ""],
  ["unreal", "Unreal Engine API", "simulation", "", "", ""],
  ["sketchfab", "Sketchfab API", "simulation", "", "", ""],
  ["cesium", "Cesium API", "simulation", "", "", ""],
];

export const LLM_PROVIDERS: LLMProviderPreset[] = ROWS.map(
  ([id, name, category, format, baseUrl, model]) => ({
    id,
    name,
    category: LLM_PROVIDER_CATEGORIES[category],
    format,
    baseUrl,
    model,
    ...(format === "" ? { note: NON_CHAT_NOTE } : {}),
  }),
);

export function filterLLMProviders(query: string): LLMProviderPreset[] {
  const q = query.trim().toLowerCase();
  if (!q) return LLM_PROVIDERS;
  return LLM_PROVIDERS.filter(
    (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.id.includes(q),
  );
}
