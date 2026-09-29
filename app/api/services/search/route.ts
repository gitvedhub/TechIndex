import { env } from "cloudflare:workers";
import { services, type Service } from "../../../data";
import { createSearchPrompt } from "../prompt.js";

type Runtime = { GEMINI_API_KEY?: string; GEMINI_MODEL?: string };

const schema = {
  type: "object",
  properties: {
    name:{type:"string"}, provider:{type:"string"}, category:{type:"string"}, description:{type:"string"},
    website:{type:"string"}, docs:{type:"string"}, version:{type:"string"}, releaseDate:{type:"string"},
    status:{type:"string"}, context:{type:"string"}, pricing:{type:"string"},
    freeTier:{type:"string"}, billingNotes:{type:"string"},
    plans:{type:"array",items:{type:"object",properties:{name:{type:"string"},price:{type:"string"},description:{type:"string"},usdAmount:{type:["number","null"]},billingUnit:{type:"string"},sourceUrl:{type:"string"}},required:["name","price","description","usdAmount","billingUnit","sourceUrl"]}},
    features:{type:"array",items:{type:"string"}}, useCases:{type:"array",items:{type:"string"}}, integrations:{type:"array",items:{type:"string"}},
    versions:{type:"array",items:{type:"object",properties:{name:{type:"string"},date:{type:"string"},note:{type:"string"}},required:["name","date","note"]}},
    previousPricing:{type:"string"}, previousVersion:{type:"string"}, changeSummary:{type:"string"}, currentUsdAmount:{type:["number","null"]}, previousUsdAmount:{type:["number","null"]}, priceEffectiveDate:{type:"string"}, priceSourceUrl:{type:"string"}
  },
  required:["name","provider","category","description","website","docs","version","releaseDate","status","context","pricing","freeTier","billingNotes","plans","features","useCases","integrations","versions","previousPricing","previousVersion","changeSummary","currentUsdAmount","previousUsdAmount","priceEffectiveDate","priceSourceUrl"]
};

const strings = (value:unknown) => Array.isArray(value) ? value.filter((item):item is string=>typeof item==="string"&&Boolean(item.trim())).map(item=>item.trim()).slice(0,8) : [];
const slug = (value:string) => value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");

export async function POST(request:Request){
  let query="";
  try { const body=await request.json() as {query?:unknown}; query=typeof body.query==="string"?body.query.trim():""; } catch { return Response.json({error:"Invalid request."},{status:400}); }
  if(query.length<2||query.length>100) return Response.json({error:"Enter a technology or service name (2–100 characters)."},{status:400});
  const runtime=env as unknown as Runtime;
  if(!runtime.GEMINI_API_KEY) return Response.json({error:"Live research is not configured. Add GEMINI_API_KEY to the server environment.",code:"GEMINI_NOT_CONFIGURED"},{status:503});
  const base=services.find(s=>s.name.toLowerCase()===query.toLowerCase()||s.id===slug(query));
  const today=new Date().toISOString().slice(0,10);
  const prompt=createSearchPrompt({query,today,existingService:base});
  const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(runtime.GEMINI_MODEL||"gemini-3.6-flash")}:generateContent`,{method:"POST",headers:{"content-type":"application/json","x-goog-api-key":runtime.GEMINI_API_KEY},body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],tools:[{googleSearch:{}},{urlContext:{}}],generationConfig:{responseFormat:{text:{mimeType:"APPLICATION_JSON",schema}}}})});
  if(!response.ok){await response.text();const error=response.status===429?"Live research is temporarily unavailable because the Gemini API quota is exhausted. Existing verified profiles are still available.":response.status===401||response.status===403?"Live research could not authenticate with Gemini. Check the server API key.":"Live research could not complete right now. Please try again shortly.";return Response.json({error,upstreamStatus:response.status},{status:502});}
  const result=await response.json() as {candidates?:Array<{content?:{parts?:Array<{text?:string}>};groundingMetadata?:{groundingChunks?:Array<{web?:{uri?:string}}>}}>} ;
  const candidate=result.candidates?.[0]; const text=candidate?.content?.parts?.map(part=>part.text||"").join("").trim();
  if(!text) return Response.json({error:"The research API returned no service profile."},{status:502});
  try{
    const value=JSON.parse(text) as Record<string,unknown>; const name=String(value.name||query); const id=slug(name);
    const plans=Array.isArray(value.plans)?value.plans.filter((p):p is Record<string,unknown>=>Boolean(p&&typeof p==="object")).slice(0,5).map(p=>({name:String(p.name||"Plan"),price:String(p.price||"Not listed"),description:String(p.description||""),usdAmount:typeof p.usdAmount==="number"?p.usdAmount:null,billingUnit:String(p.billingUnit||""),sourceUrl:String(p.sourceUrl||"")})):[];
    const versions=Array.isArray(value.versions)?value.versions.filter((v):v is Record<string,unknown>=>Boolean(v&&typeof v==="object")).slice(0,12).map(v=>({name:String(v.name||"Latest"),date:String(v.date||"Unknown"),note:String(v.note||"")})):[];
    const sources=candidate?.groundingMetadata?.groundingChunks?.map(chunk=>chunk.web?.uri).filter((url):url is string=>Boolean(url))||[];
    const currentUsdAmount=typeof value.currentUsdAmount==="number"?value.currentUsdAmount:null;const previousUsdAmount=typeof value.previousUsdAmount==="number"?value.previousUsdAmount:null;const pricePercent=currentUsdAmount!==null&&previousUsdAmount!==null&&previousUsdAmount!==0?Number((((currentUsdAmount-previousUsdAmount)/previousUsdAmount)*100).toFixed(2)):null;
    const data:Service={id,name,short:name.split(/\s+/).map(word=>word[0]).join("").slice(0,3).toUpperCase(),color:base?.color||"#356b5c",category:String(value.category||"Developer Tools"),version:String(value.version||"Latest"),description:String(value.description||"No verified description available."),provider:String(value.provider||name),updatedAt:new Date().toISOString(),releaseDate:String(value.releaseDate||"Unknown"),pricing:String(value.pricing||plans[0]?.price||"See provider pricing"),context:String(value.context||"Provider managed"),status:String(value.status||"Active"),features:strings(value.features),versions,docs:String(value.docs||value.website||""),website:String(value.website||""),dataSource:"gemini",sourceUrls:Array.from(new Set([...sources,String(value.priceSourceUrl||""),...plans.map(plan=>plan.sourceUrl)].filter(Boolean))).slice(0,10),pricingDetails:{freeTier:String(value.freeTier||"Not documented"),billingNotes:String(value.billingNotes||"Confirm final charges with the provider."),plans},useCases:strings(value.useCases),integrations:strings(value.integrations),change:{previousVersion:String(value.previousVersion||"Not tracked"),previousPricing:String(value.previousPricing||"Not tracked"),pricePercent,currentUsdAmount,previousUsdAmount,effectiveDate:String(value.priceEffectiveDate||""),sourceUrl:String(value.priceSourceUrl||""),summary:String(value.changeSummary||"No prior comparison available."),trackedAt:new Date().toISOString()}};
    return Response.json({data,sources:data.sourceUrls,refreshedAt:data.updatedAt});
  }catch{return Response.json({error:"The research API returned an unreadable profile."},{status:502});}
}
