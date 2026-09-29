"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AppUser } from "../neon-auth";
import { authClient } from "../auth-client";
import type { Service } from "../data";

type AccountResponse = {
  user: AppUser & { lastLoginAt: string };
  workspace: {
    savedServices: string[];
    comparisonSelections: string[];
    researchedServices: Service[];
  };
  savedServiceDetails: Service[];
};

const initials = (value: string) => value.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

export default function AccountWorkspace({ initialUser }: { initialUser: AppUser }) {
  const [account,setAccount]=useState<AccountResponse|null>(null);
  const [error,setError]=useState("");

  useEffect(()=>{let active=true;fetch("/api/account",{cache:"no-store"}).then(async(response)=>{const payload=await response.json() as AccountResponse&{error?:string};if(!response.ok)throw new Error(payload.error||"Unable to load your account.");if(active)setAccount(payload);}).catch((reason)=>{if(active)setError(reason instanceof Error?reason.message:"Unable to load your account.");});return()=>{active=false;};},[]);

  const user=account?.user??{...initialUser,lastLoginAt:""};
  const saved=account?.savedServiceDetails??[];
  const researched=account?.workspace.researchedServices??[];
  const comparisons=account?.workspace.comparisonSelections.filter(Boolean).length??0;

  return <main className="account-shell">
    <header className="account-nav"><Link href="/" className="auth-brand"><span>TL</span><strong>TechLedger</strong></Link><div><Link href="/">Open catalog</Link><button className="account-signout" onClick={async()=>{await authClient.signOut();window.location.assign("/login");}}>Sign out</button></div></header>
    <section className="account-hero">
      <div className="account-identity"><b>{initials(user.displayName)}</b><div><p>YOUR TECHLEDGER ACCOUNT</p><h1>{user.displayName}</h1><span>{user.email}</span></div></div>
      <div className="account-health"><i/><span><b>Neon sync active</b><small>Your profile and workspace are connected.</small></span></div>
    </section>
    {error?<div className="account-error">{error}</div>:null}
    <section className="account-metrics"><article><span>STARRED SERVICES</span><strong>{account?saved.length:"—"}</strong><small>full snapshots stored</small></article><article><span>API RESEARCH</span><strong>{account?researched.length:"—"}</strong><small>live profiles retained</small></article><article><span>COMPARISONS</span><strong>{account?comparisons:"—"}</strong><small>services selected</small></article><article><span>LAST SIGN IN</span><strong>{user.lastLoginAt?new Date(user.lastLoginAt).toLocaleDateString(undefined,{month:"short",day:"numeric"}):"Now"}</strong><small>identity verified</small></article></section>
    <div className="account-grid">
      <section className="account-panel"><header><div><span>YOUR SHORTLIST</span><h2>Starred services</h2></div><Link href="/?view=saved">Manage in catalog →</Link></header>{account?saved.length?<div className="account-service-list">{saved.map((service)=><Link href={`/?service=${encodeURIComponent(service.id)}`} key={service.id}><b style={{"--account-accent":service.color} as React.CSSProperties}>{service.short}</b><span><strong>{service.name}</strong><small>{service.provider} · {service.category}</small></span><em>{service.version}</em><i>{service.pricing}</i></Link>)}</div>:<div className="account-empty"><h3>No starred services yet</h3><p>Star a service in the catalog and its complete profile will be stored here.</p><Link href="/">Explore services</Link></div>:<AccountLoading/>}</section>
      <aside className="account-panel research-account-panel"><header><div><span>LIVE API HISTORY</span><h2>Recent research</h2></div></header>{account?researched.length?<div>{researched.slice(0,6).map((service)=><Link href={`/?service=${encodeURIComponent(service.id)}`} key={service.id}><b>{service.short}</b><span><strong>{service.name}</strong><small>{service.sourceUrls?.length||0} verified sources</small></span><em>Open →</em></Link>)}</div>:<div className="account-empty compact"><p>API-researched profiles will appear here automatically.</p><Link href="/">Research a service</Link></div>:<AccountLoading/>}</aside>
    </div>
    <section className="account-data-note"><span>DATABASE CONNECTION</span><div><strong>What is stored for your account</strong><p>Your verified identity, full starred-service profiles, research history, comparison selections, alert preferences, and layout settings are stored in Neon PostgreSQL. Authentication credentials are never stored by TechLedger.</p></div></section>
  </main>;
}

function AccountLoading(){return <div className="account-loading"><i/><i/><i/></div>}
