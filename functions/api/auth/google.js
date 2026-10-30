const CLIENT_ID = "362940858298-7reo9cqetso191k2om66ohsnp6kk60a4.apps.googleusercontent.com";
const REDIRECT_URI = "https://govjobmitra.pages.dev/api/auth/google/callback";
function b64url(bytes) { return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
function randomToken(n=32) { const a=new Uint8Array(n); crypto.getRandomValues(a); return b64url(a); }
function cookie(n,v) { return n+"="+v+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600"; }
export async function onRequestGet({env}) {
 if (!env.GOOGLE_CLIENT_SECRET) return new Response("OAuth secret is not configured.",{status:503});
 const state=randomToken(), nonce=randomToken(), verifier=randomToken(48);
 const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(verifier));
 const url=new URL("https://accounts.google.com/o/oauth2/v2/auth");
 for (const [k,v] of Object.entries({client_id:CLIENT_ID,redirect_uri:REDIRECT_URI,response_type:"code",scope:"openid email profile",state,nonce,code_challenge:b64url(digest),code_challenge_method:"S256",prompt:"select_account"})) url.searchParams.set(k,v);
 const h=new Headers({Location:url.toString(),"Cache-Control":"no-store"});
 h.append("Set-Cookie",cookie("gjm_oauth_state",state)); h.append("Set-Cookie",cookie("gjm_oauth_nonce",nonce)); h.append("Set-Cookie",cookie("gjm_oauth_verifier",verifier));
 return new Response(null,{status:302,headers:h});
}