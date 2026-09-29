import { requireUser } from "../neon-auth";
import AccountWorkspace from "./workspace";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser("/account");
  return <AccountWorkspace initialUser={user}/>;
}
