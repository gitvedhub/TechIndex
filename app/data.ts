export type Service = {
  id: string;
  name: string;
  short: string;
  color: string;
  category: string;
  version: string;
  description: string;
  provider: string;
  updatedAt: string;
  releaseDate: string;
  pricing: string;
  context: string;
  status: string;
  features: string[];
  versions: { name: string; date: string; note: string }[];
  docs: string;
  website: string;
  dataSource?: "catalog" | "gemini" | "custom";
  sourceUrls?: string[];
  pricingDetails?: {
    freeTier: string;
    billingNotes: string;
    plans: { name: string; price: string; description: string; usdAmount?: number | null; billingUnit?: string; sourceUrl?: string }[];
  };
  useCases?: string[];
  integrations?: string[];
  change?: {
    previousVersion: string;
    previousPricing: string;
    pricePercent: number | null;
    currentUsdAmount?: number | null;
    previousUsdAmount?: number | null;
    effectiveDate?: string;
    sourceUrl?: string;
    summary: string;
    trackedAt: string;
  };
};

export const categories = ["All", "AI Models", "Databases", "Cloud", "DevOps", "Vector DB", "Monitoring", "Backend", "Frontend", "Data", "Security", "Messaging", "Payments"];

const featuredServices: Service[] = [
  { id:"openai", name:"OpenAI", short:"OI", color:"#163f38", category:"AI Models", version:"GPT-5.5", description:"Advanced multimodal models for reasoning, generation, and agentic workflows.", provider:"OpenAI", updatedAt:"2026-08-14T08:00:00.000Z", releaseDate:"July 30, 2026", pricing:"From $1.25 / 1M tokens", context:"400K tokens", status:"Stable", features:["Vision", "Audio", "Function calling", "JSON mode", "Embeddings"], versions:[{name:"GPT-5.5",date:"Jul 2026",note:"Latest flagship reasoning model"},{name:"GPT-5.2",date:"Dec 2025",note:"Improved long-context reasoning"},{name:"GPT-5",date:"Aug 2025",note:"Unified flagship model"},{name:"GPT-4.1",date:"Apr 2025",note:"Coding and instruction following"}], docs:"https://platform.openai.com/docs", website:"https://openai.com" },
  { id:"anthropic", name:"Anthropic", short:"AI", color:"#8d5c45", category:"AI Models", version:"Claude 4.5", description:"Safety-focused AI models with strong coding and long-context capabilities.", provider:"Anthropic", updatedAt:"2026-08-14T02:00:00.000Z", releaseDate:"July 2026", pricing:"From $3 / 1M tokens", context:"200K tokens", status:"Stable", features:["Vision", "Tool use", "Prompt caching", "Batch API"], versions:[{name:"Claude 4.5",date:"Jul 2026",note:"Latest intelligence model"},{name:"Claude 4",date:"May 2025",note:"Extended thinking and coding"},{name:"Claude 3.7",date:"Feb 2025",note:"Hybrid reasoning model"}], docs:"https://docs.anthropic.com", website:"https://anthropic.com" },
  { id:"mongodb", name:"MongoDB", short:"M", color:"#2f7d4b", category:"Databases", version:"8.0", description:"Developer data platform built on a flexible document database.", provider:"MongoDB Inc.", updatedAt:"2026-08-13T10:00:00.000Z", releaseDate:"October 2, 2024", pricing:"Free / usage based", context:"128 TB storage", status:"Stable", features:["Vector search", "Transactions", "Time series", "Atlas cloud"], versions:[{name:"8.0",date:"Oct 2024",note:"Faster reads and resharding"},{name:"7.0",date:"Aug 2023",note:"Queryable encryption"},{name:"6.0",date:"Jul 2022",note:"Queryable encryption preview"}], docs:"https://www.mongodb.com/docs", website:"https://mongodb.com" },
  { id:"redis", name:"Redis", short:"R", color:"#a94139", category:"Databases", version:"8.0", description:"Fast, open-source in-memory data store for caching, vectors, and streams.", provider:"Redis", updatedAt:"2026-08-11T10:00:00.000Z", releaseDate:"May 2025", pricing:"Open source / cloud", context:"In-memory", status:"Stable", features:["JSON", "Vector search", "Streams", "Pub/Sub"], versions:[{name:"8.0",date:"May 2025",note:"Integrated Redis Query Engine"},{name:"7.4",date:"Jul 2024",note:"Hash field expiration"},{name:"7.2",date:"Aug 2023",note:"Performance improvements"}], docs:"https://redis.io/docs", website:"https://redis.io" },
  { id:"mysql", name:"MySQL", short:"MY", color:"#0c6b82", category:"Databases", version:"9.4 LTS", description:"The world's most popular open-source relational database for web and cloud applications.", provider:"Oracle", updatedAt:"2026-08-10T10:00:00.000Z", releaseDate:"July 2026", pricing:"Free / commercial", context:"Relational SQL", status:"Stable", features:["SQL", "Transactions", "Replication", "JSON", "HeatWave"], versions:[{name:"9.4 LTS",date:"Jul 2026",note:"Latest long-term support release"},{name:"9.3",date:"Apr 2026",note:"Innovation release"},{name:"8.4 LTS",date:"Apr 2024",note:"Long-term support release"}], docs:"https://dev.mysql.com/doc", website:"https://mysql.com" },
  { id:"postgresql", name:"PostgreSQL", short:"PG", color:"#336791", category:"Databases", version:"17", description:"Advanced open-source relational database known for reliability and extensibility.", provider:"PostgreSQL Global Development Group", updatedAt:"2026-08-08T10:00:00.000Z", releaseDate:"September 2024", pricing:"Free / open source", context:"Relational SQL", status:"Stable", features:["ACID", "JSONB", "Extensions", "Full-text search", "Logical replication"], versions:[{name:"17",date:"Sep 2024",note:"Improved vacuum and query performance"},{name:"16",date:"Sep 2023",note:"Logical replication enhancements"},{name:"15",date:"Oct 2022",note:"MERGE support"}], docs:"https://www.postgresql.org/docs", website:"https://postgresql.org" },
  { id:"kafka", name:"Apache Kafka", short:"K", color:"#323b38", category:"DevOps", version:"4.0", description:"Distributed event streaming platform for high-performance data pipelines.", provider:"Apache Software Foundation", updatedAt:"2026-08-09T10:00:00.000Z", releaseDate:"March 2025", pricing:"Free / open source", context:"Unlimited streams", status:"Stable", features:["KRaft mode", "Connect", "Streams", "Exactly-once"], versions:[{name:"4.0",date:"Mar 2025",note:"ZooKeeper-free by default"},{name:"3.9",date:"Nov 2024",note:"Migration improvements"},{name:"3.8",date:"Jul 2024",note:"Tiered storage updates"}], docs:"https://kafka.apache.org/documentation", website:"https://kafka.apache.org" },
  { id:"kubernetes", name:"Kubernetes", short:"K8", color:"#3f68ae", category:"DevOps", version:"1.33", description:"Open-source system for automating container deployment, scaling, and management.", provider:"CNCF", updatedAt:"2026-08-07T10:00:00.000Z", releaseDate:"April 2025", pricing:"Free / open source", context:"Cluster scale", status:"Stable", features:["Autoscaling", "Service discovery", "Rollouts", "Storage orchestration"], versions:[{name:"1.33",date:"Apr 2025",note:"Octarine release"},{name:"1.32",date:"Dec 2024",note:"Penelope release"},{name:"1.31",date:"Aug 2024",note:"Elli release"}], docs:"https://kubernetes.io/docs", website:"https://kubernetes.io" },
  { id:"docker", name:"Docker", short:"D", color:"#2388d9", category:"DevOps", version:"28", description:"Container platform for building, sharing, and running applications consistently.", provider:"Docker Inc.", updatedAt:"2026-08-07T10:00:00.000Z", releaseDate:"April 2025", pricing:"Free personal / paid teams", context:"Containers", status:"Stable", features:["Containers", "Compose", "BuildKit", "Registry"], versions:[{name:"28",date:"Apr 2025",note:"Latest Docker Engine"},{name:"27",date:"Jun 2024",note:"Container networking updates"}], docs:"https://docs.docker.com", website:"https://docker.com" },
  { id:"pinecone", name:"Pinecone", short:"P", color:"#7459a8", category:"Vector DB", version:"2025-04", description:"Managed vector database for production-ready semantic search applications.", provider:"Pinecone", updatedAt:"2026-08-07T10:00:00.000Z", releaseDate:"April 2025", pricing:"Free starter / usage", context:"Billions of vectors", status:"Stable", features:["Hybrid search", "Namespaces", "Metadata filters", "Serverless"], versions:[{name:"2025-04",date:"Apr 2025",note:"Latest stable API"},{name:"2024-10",date:"Oct 2024",note:"Inference API updates"}], docs:"https://docs.pinecone.io", website:"https://pinecone.io" },
  { id:"aws", name:"AWS", short:"AWS", color:"#9a6730", category:"Cloud", version:"2026.07", description:"Broad cloud platform spanning compute, storage, data, and AI services.", provider:"Amazon", updatedAt:"2026-08-01T10:00:00.000Z", releaseDate:"July 2026", pricing:"Usage based", context:"Global regions", status:"Stable", features:["Compute", "Storage", "AI/ML", "Serverless"], versions:[{name:"2026.07",date:"Jul 2026",note:"Monthly service index"},{name:"2026.06",date:"Jun 2026",note:"Monthly service index"}], docs:"https://docs.aws.amazon.com", website:"https://aws.amazon.com" },
];

type CatalogSeed = [name: string, category: string, provider?: string, website?: string];

const catalogSeeds: CatalogSeed[] = [
  ["Google Gemini", "AI Models", "Google", "https://ai.google.dev"], ["Ollama", "AI Models", "Ollama", "https://ollama.com"], ["Mistral AI", "AI Models", "Mistral AI", "https://mistral.ai"], ["Hugging Face", "AI Models", "Hugging Face", "https://huggingface.co"], ["Cohere", "AI Models", "Cohere", "https://cohere.com"],
  ["SQLite", "Databases", "SQLite", "https://sqlite.org"], ["MariaDB", "Databases", "MariaDB Foundation", "https://mariadb.org"], ["CockroachDB", "Databases", "Cockroach Labs", "https://cockroachlabs.com"], ["Cassandra", "Databases", "Apache", "https://cassandra.apache.org"], ["DynamoDB", "Databases", "AWS", "https://aws.amazon.com/dynamodb"], ["Elasticsearch", "Databases", "Elastic", "https://elastic.co"], ["Neon", "Databases", "Neon", "https://neon.com"], ["PlanetScale", "Databases", "PlanetScale", "https://planetscale.com"],
  ["Microsoft Azure", "Cloud", "Microsoft", "https://azure.microsoft.com"], ["Google Cloud", "Cloud", "Google", "https://cloud.google.com"], ["Cloudflare", "Cloud", "Cloudflare", "https://cloudflare.com"], ["Vercel", "Cloud", "Vercel", "https://vercel.com"], ["Netlify", "Cloud", "Netlify", "https://netlify.com"], ["DigitalOcean", "Cloud", "DigitalOcean", "https://digitalocean.com"], ["Railway", "Cloud", "Railway", "https://railway.app"], ["Render", "Cloud", "Render", "https://render.com"],
  ["GitHub", "DevOps", "GitHub", "https://github.com"], ["GitLab", "DevOps", "GitLab", "https://gitlab.com"], ["Jenkins", "DevOps", "Jenkins", "https://jenkins.io"], ["CircleCI", "DevOps", "CircleCI", "https://circleci.com"], ["Terraform", "DevOps", "HashiCorp", "https://terraform.io"], ["Ansible", "DevOps", "Red Hat", "https://ansible.com"], ["Helm", "DevOps", "CNCF", "https://helm.sh"], ["Argo CD", "DevOps", "CNCF", "https://argo-cd.readthedocs.io"], ["Pulumi", "DevOps", "Pulumi", "https://pulumi.com"],
  ["Qdrant", "Vector DB", "Qdrant", "https://qdrant.tech"], ["Milvus", "Vector DB", "LF AI & Data", "https://milvus.io"], ["Chroma", "Vector DB", "Chroma", "https://trychroma.com"], ["Weaviate", "Vector DB", "Weaviate", "https://weaviate.io"],
  ["Datadog", "Monitoring", "Datadog", "https://datadoghq.com"], ["Grafana", "Monitoring", "Grafana Labs", "https://grafana.com"], ["Prometheus", "Monitoring", "CNCF", "https://prometheus.io"], ["Sentry", "Monitoring", "Sentry", "https://sentry.io"], ["New Relic", "Monitoring", "New Relic", "https://newrelic.com"], ["PostHog", "Monitoring", "PostHog", "https://posthog.com"],
  ["Supabase", "Backend", "Supabase", "https://supabase.com"], ["Firebase", "Backend", "Google", "https://firebase.google.com"], ["Node.js", "Backend", "OpenJS Foundation", "https://nodejs.org"], ["Deno", "Backend", "Deno", "https://deno.com"], ["Bun", "Backend", "Oven", "https://bun.sh"], ["FastAPI", "Backend", "FastAPI", "https://fastapi.tiangolo.com"], ["Django", "Backend", "Django Software Foundation", "https://djangoproject.com"], ["Laravel", "Backend", "Laravel", "https://laravel.com"], ["Spring Boot", "Backend", "VMware", "https://spring.io/projects/spring-boot"], ["Express", "Backend", "OpenJS Foundation", "https://expressjs.com"], ["NestJS", "Backend", "NestJS", "https://nestjs.com"],
  ["React", "Frontend", "Meta", "https://react.dev"], ["Next.js", "Frontend", "Vercel", "https://nextjs.org"], ["Vue", "Frontend", "Vue.js", "https://vuejs.org"], ["Angular", "Frontend", "Google", "https://angular.dev"], ["Svelte", "Frontend", "Svelte", "https://svelte.dev"], ["Nuxt", "Frontend", "NuxtLabs", "https://nuxt.com"], ["Tailwind CSS", "Frontend", "Tailwind Labs", "https://tailwindcss.com"],
  ["Snowflake", "Data", "Snowflake", "https://snowflake.com"], ["Databricks", "Data", "Databricks", "https://databricks.com"], ["Apache Airflow", "Data", "Apache", "https://airflow.apache.org"], ["dbt", "Data", "dbt Labs", "https://getdbt.com"],
  ["Auth0", "Security", "Okta", "https://auth0.com"], ["Clerk", "Security", "Clerk", "https://clerk.com"], ["Okta", "Security", "Okta", "https://okta.com"],
  ["RabbitMQ", "Messaging", "Broadcom", "https://rabbitmq.com"], ["NATS", "Messaging", "CNCF", "https://nats.io"], ["Apache Pulsar", "Messaging", "Apache", "https://pulsar.apache.org"],
  ["Stripe", "Payments", "Stripe", "https://stripe.com"], ["Twilio", "Messaging", "Twilio", "https://twilio.com"],
];

const palette = ["#176b5b", "#3566a8", "#8a5b9d", "#b06b3b", "#3d7b50", "#9b4b49"];

function catalogService([name, category, provider = name, website = ""]: CatalogSeed, index: number): Service {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const initials = name.split(/\s+/).map((word) => word[0]).join("").slice(0, 3).toUpperCase();
  const categoryPurpose: Record<string, string> = {
    "AI Models": "provides models and tools for building AI-powered products, search, automation, and content workflows.",
    Databases: "stores and queries application data with production-oriented reliability, scaling, and developer tooling.",
    Cloud: "delivers managed infrastructure and deployment services for running applications at global scale.",
    DevOps: "supports software delivery, infrastructure automation, and reliable production operations.",
    "Vector DB": "indexes embeddings for semantic search, retrieval-augmented generation, and recommendation systems.",
    Monitoring: "helps teams observe application behavior, investigate failures, and improve production reliability.",
    Backend: "provides backend building blocks for APIs, data access, authentication, and application logic.",
    Frontend: "helps teams build responsive web interfaces with reusable components and modern tooling.",
    Data: "supports analytics engineering, orchestration, transformation, and large-scale data processing.",
    Security: "manages identity and application access with authentication, authorization, and security controls.",
    Messaging: "connects applications through reliable messages, events, notifications, and real-time communication.",
    Payments: "provides APIs and operational tools for accepting, managing, and reconciling digital payments.",
  };
  return { id, name, short: initials, color: palette[index % palette.length], category, version: "Latest", description: `${name} ${categoryPurpose[category] ?? "provides developer infrastructure and application tooling."}`, provider, updatedAt: "2026-08-04T10:00:00.000Z", releaseDate: "See official changelog", pricing: "See provider pricing", context: "Provider managed", status: "Catalog", features:[category, "Official documentation", "Release tracking"], versions:[{name:"Latest",date:"Verify with Gemini",note:"Refresh this profile for the latest verified release details."}], docs: website, website, dataSource:"catalog", sourceUrls: website ? [website] : [] };
}

const changeProfiles: Record<string, NonNullable<Service["change"]>> = {
  openai: { previousVersion:"GPT-5.2", previousPricing:"From $1.50 / 1M tokens", pricePercent:-16.7, summary:"New flagship release with a lower tracked entry price.", trackedAt:"Latest snapshot" },
  anthropic: { previousVersion:"Claude 4", previousPricing:"From $3 / 1M tokens", pricePercent:0, summary:"Model generation changed while tracked entry pricing stayed level.", trackedAt:"Latest snapshot" },
  mongodb: { previousVersion:"7.0", previousPricing:"Free / usage based", pricePercent:0, summary:"Major version update; base tracked pricing is unchanged.", trackedAt:"Latest snapshot" },
  redis: { previousVersion:"7.4", previousPricing:"Open source / cloud", pricePercent:0, summary:"Query features moved into the core release without a tracked base-price change.", trackedAt:"Latest snapshot" },
  mysql: { previousVersion:"9.3", previousPricing:"Free / commercial", pricePercent:0, summary:"Moved from the previous innovation release to the latest tracked release.", trackedAt:"Latest snapshot" },
  postgresql: { previousVersion:"16", previousPricing:"Free / open source", pricePercent:0, summary:"Major database release with no license-price change.", trackedAt:"Latest snapshot" },
  kafka: { previousVersion:"3.9", previousPricing:"Free / open source", pricePercent:0, summary:"Major platform release; open-source pricing remains unchanged.", trackedAt:"Latest snapshot" },
  kubernetes: { previousVersion:"1.32", previousPricing:"Free / open source", pricePercent:0, summary:"One minor release ahead with no license-price change.", trackedAt:"Latest snapshot" },
};

export const services: Service[] = [...featuredServices, ...catalogSeeds.map(catalogService)].map((service) => ({
  ...service,
  dataSource: service.dataSource ?? "catalog",
  sourceUrls: service.sourceUrls ?? [service.docs, service.website].filter(Boolean),
  change: changeProfiles[service.id] ?? {
    previousVersion: service.versions[1]?.name ?? "Previous snapshot",
    previousPricing: service.pricing,
    pricePercent: service.pricing.toLowerCase().includes("free") ? 0 : null,
    summary: "Release metadata changed; comparable pricing data is not yet available.",
    trackedAt: "Latest snapshot",
  },
}));
