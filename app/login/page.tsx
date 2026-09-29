import Link from "next/link";
import { getCurrentUser } from "../neon-auth";
import EmailAuthForm from "./email-auth-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();

  return <main className="auth-shell">
    <Link className="auth-brand" href="/"><span>TL</span><strong>TechLedger</strong></Link>
    <section className="auth-card">
      <div className="auth-copy">
        <p>YOUR PRIVATE TECHNOLOGY WORKSPACE</p>
        <h1>{user ? `Welcome back, ${user.displayName}.` : "Your research, always connected."}</h1>
        <span>{user ? "Your Neon Auth session is active. Continue to your account to review saved services and live research." : "Create an account with your email and password to sync starred services, complete profiles, comparisons, and research history."}</span>
        <div className="auth-benefits">
          <article><b>01</b><div><strong>Persistent shortlist</strong><small>Every starred service and its full profile are stored in Neon.</small></div></article>
          <article><b>02</b><div><strong>Private research library</strong><small>API-researched services remain attached to your account.</small></div></article>
          <article><b>03</b><div><strong>Secure sessions</strong><small>Passwords and sessions are handled by Neon Auth, not application code.</small></div></article>
        </div>
      </div>
      <aside className="auth-action email-auth-action">
        {user ? <div className="signed-in-auth"><span className="auth-status"><i/>SIGNED IN WITH NEON AUTH</span><div className="auth-mark">{user.displayName.slice(0,2).toUpperCase()}</div><h2>You are signed in</h2><p>{user.email}</p><Link className="auth-primary" href="/account">Open my account<b>→</b></Link><Link className="auth-secondary" href="/">Return to catalog</Link></div> : <EmailAuthForm/>}
      </aside>
    </section>
  </main>;
}
