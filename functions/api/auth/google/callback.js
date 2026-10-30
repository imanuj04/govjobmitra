const CLIENT_ID="362940858298-7reo9cqetso191k2om66ohsnp6kk60a4.apps.googleusercontent.com";
const REDIRECT_URI="https://govjobmitra.pages.dev/api/auth/google/callback";
const ADMIN="dixit.anuj04@gmail.com";
function cookies(h){const o={};for(const x of (h||"").split(";")){const i=x.indexOf("=");if(i>0)o[x.slice(0,i).trim()]=x.slice(i+1).trim();}return o;}
function dec(s){s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";return Uint8Array.from(atob(s),c=>c.charCodeAt(0));}
function json(s){return JSON.parse(new TextDecoder().decode(dec(s)));}
function b64(a){return btoa(String.fromCharCode(...new Uint8Array(a))).replace(/\\+/g,"-").replace(/\\//g,"_").replace(/=+$/,"");}
async function makeSession(data,secret){const raw=b64(new TextEncoder().encode(JSON.stringify(data)));const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);const sig=b64(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(raw)));return raw+"."+sig;}
async function verifyId(token,nonce){
 const p=token.split(".");if(p.length!==3)throw Error("id_token_format");
 const h=json(p[0]),c=json(p[1]);
 if(h.alg!=="RS256")throw Error("id_token_algorithm");
 const response=await fetch("https://www.googleapis.com/oauth2/v3/certs");
 if(!response.ok)throw Error("google_jwks_http_"+response.status);
 const jwks=await response.json(),jwk=jwks.keys.find(k=>k.kid===h.kid);
 if(!jwk)throw Error("google_signing_key_not_found");
 const key=await crypto.subtle.importKey("jwk",jwk,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["verify"]);
 const ok=await crypto.subtle.verify("RSASSA-PKCS1-v1_5",key,dec(p[2]),new TextEncoder().encode(p[0]+"."+p[1]));
 const now=Math.floor(Date.now()/1000);
 if(!ok)throw Error("id_token_signature_invalid");
 if(!["accounts.google.com","https://accounts.google.com"].includes(c.iss))throw Error("id_token_issuer_invalid");
 if(c.aud!==CLIENT_ID)throw Error("id_token_audience_mismatch");
 if(c.exp<now||c.iat>now+60)throw Error("id_token_expired_or_future");
 if(c.nonce!==nonce)throw Error("id_token_nonce_mismatch");
 if(c.email_verified!==true&&c.email_verified!=="true")throw Error("google_email_not_verified");
 return c;
}
export async function onRequestGet({request,env}){
 const q=new URL(request.url),ck=cookies(request.headers.get("Cookie"));
 const clear=["gjm_oauth_state","gjm_oauth_nonce","gjm_oauth_verifier"].map(n=>n+"=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
 const fail=(msg,status=400)=>new Response(msg,{status,headers:{"Cache-Control":"no-store","Set-Cookie":clear.join(", "),"Content-Type":"text/plain; charset=utf-8"}});
 if(!env.GOOGLE_CLIENT_SECRET||!env.SESSION_SECRET)return fail("Authentication secrets are not configured in the Production environment.",503);
 if(q.searchParams.has("error"))return Response.redirect("https://govjobmitra.pages.dev/admin/login/?error=cancelled",302);
 const code=q.searchParams.get("code"),state=q.searchParams.get("state");
 if(!code||!state||state!==ck.gjm_oauth_state||!ck.gjm_oauth_nonce||!ck.gjm_oauth_verifier)return fail("OAuth state/cookie check failed. Enable cookies and restart sign-in.");
 let stage="token_exchange";
 try{
  const body=new URLSearchParams({code,client_id:CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,redirect_uri:REDIRECT_URI,grant_type:"authorization_code",code_verifier:ck.gjm_oauth_verifier});
  const tr=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body});
  const t=await tr.json();
  if(!tr.ok||!t.id_token){const reason=String(t.error||"token_exchange_failed").replace(/[^a-zA-Z0-9_]/g,"").slice(0,48);console.error("[admin-oauth] token exchange failed",tr.status,reason);return fail("Google token exchange failed: "+reason,502);}
  stage="identity_verification";
  const user=await verifyId(t.id_token,ck.gjm_oauth_nonce);
  if((user.email||"").toLowerCase()!==ADMIN)return fail("This Google account is not authorized for administration.",403);
  stage="session_creation";
  const now=Math.floor(Date.now()/1000),session=await makeSession({email:ADMIN,name:user.name||"Administrator",sub:user.sub,iat:now,exp:now+28800},env.SESSION_SECRET);
  const h=new Headers({Location:"https://govjobmitra.pages.dev/admin/","Cache-Control":"no-store"});
  h.append("Set-Cookie","gjm_admin_session="+session+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800");
  for(const x of clear)h.append("Set-Cookie",x);
  return new Response(null,{status:302,headers:h});
 }catch(e){
  const reason=String(e&&e.message||"unknown_error").replace(/[^a-zA-Z0-9_]/g,"").slice(0,64);
  console.error("[admin-oauth] failure",stage,reason);
  return fail("Google sign-in failed at "+stage+": "+reason,502);
 }
}