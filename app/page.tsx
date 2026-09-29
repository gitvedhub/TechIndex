import TechIndex from "./tech-index";
import { getCurrentUser } from "./neon-auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  return <TechIndex user={user} />;
}
