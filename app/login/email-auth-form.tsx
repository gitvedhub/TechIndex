"use client";

import { FormEvent, useState } from "react";
import { authClient } from "../auth-client";

type Mode = "sign-in" | "sign-up";

export default function EmailAuthForm() {
  const [mode,setMode]=useState<Mode>("sign-in");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [showPassword,setShowPassword]=useState(false);
  const [submitting,setSubmitting]=useState(false);
  const [error,setError]=useState("");

  const submit=async(event:FormEvent)=>{
    event.preventDefault();
    setError("");
    if(mode==="sign-up"&&name.trim().length<2){setError("Enter your full name.");return;}
    if(password.length<8){setError("Password must contain at least 8 characters.");return;}
    setSubmitting(true);
    try{
      const result=mode==="sign-up"
        ?await authClient.signUp.email({name:name.trim(),email:email.trim().toLowerCase(),password})
        :await authClient.signIn.email({email:email.trim().toLowerCase(),password});
      if(result.error)throw new Error(result.error.message||"Authentication failed.");
      window.location.assign("/account");
    }catch(reason){setError(reason instanceof Error?reason.message:"Authentication failed. Check your details and try again.");setSubmitting(false);}
  };

  return <div className="email-auth-form">
    <span className="auth-status"><i/>SECURED BY NEON AUTH</span>
    <h2>{mode==="sign-in"?"Welcome back":"Create your account"}</h2>
    <p>{mode==="sign-in"?"Enter your email and password to restore your workspace.":"Start a private, synchronized technology workspace."}</p>
    <div className="auth-mode" role="tablist" aria-label="Authentication mode"><button type="button" role="tab" aria-selected={mode==="sign-in"} className={mode==="sign-in"?"active":""} onClick={()=>{setMode("sign-in");setError("");}}>Log in</button><button type="button" role="tab" aria-selected={mode==="sign-up"} className={mode==="sign-up"?"active":""} onClick={()=>{setMode("sign-up");setError("");}}>Sign up</button></div>
    <form onSubmit={submit}>
      {mode==="sign-up"?<label><span>FULL NAME</span><input autoComplete="name" value={name} onChange={event=>setName(event.target.value)} placeholder="Your name" required/></label>:null}
      <label><span>EMAIL ADDRESS</span><input type="email" autoComplete="email" value={email} onChange={event=>setEmail(event.target.value)} placeholder="you@company.com" required/></label>
      <label><span>PASSWORD</span><div className="password-field"><input type={showPassword?"text":"password"} autoComplete={mode==="sign-in"?"current-password":"new-password"} value={password} onChange={event=>setPassword(event.target.value)} placeholder="At least 8 characters" minLength={8} required/><button type="button" onClick={()=>setShowPassword(current=>!current)}>{showPassword?"Hide":"Show"}</button></div></label>
      {error?<div className="auth-form-error" role="alert">{error}</div>:null}
      <button className="auth-submit" disabled={submitting}>{submitting?(mode==="sign-in"?"Logging in...":"Creating account..."):(mode==="sign-in"?"Log in":"Create account")}<b>→</b></button>
    </form>
    <small>{mode==="sign-in"?"New to TechLedger? Choose Sign up above.":"By creating an account, your workspace will be stored securely in Neon."}</small>
  </div>;
}
