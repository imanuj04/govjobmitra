const IDLE_SECONDS=20*60;
function read(h){const o={};for(const x of (h||"").split(";")){const i=x.indexOf("=");if(i>0)o[x.slice(0,i).trim()]=x.slice(i+1).trim();}return o;}
function dec(s){s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";return Uint8Array.from(atob(s),c=>c.charCodeAt(0));}
function b64(a){return btoa(String.fromCharCode(...new Uint8Array(a))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");}
async function sign(data,secret){const raw=b64(new TextEncoder().encode(JSON.stringify(data)));const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);const sig=b64(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(raw)));return raw+"."+sig;}
function unauth(){return Response.json({authenticated:false},{status:401,headers:{"Cache-Control":"no-store","Set-Cookie":"gjm_admin_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"}});}
export async function onRequestGet({request,env}){
 const token=read(request.headers.get("Cookie")).gjm_admin_session;
 if(!token||!env.SESSION_SECRET)return unauth();
 try{
  const parts=token.split(".");if(parts.length!==2)throw Error("invalid");
  const [data,sig]=parts;
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(env.SESSION_SECRET),{name:"HMAC",hash:"SHA-256"},false,["verify"]);
  const valid=await crypto.subtle.verify("HMAC",key,dec(sig),new TextEncoder().encode(data));
  const c=JSON.parse(new TextDecoder().decode(dec(data))),now=Math.floor(Date.now()/1000);
  if(!valid||c.email!=="dixit.anuj04@gmail.com"||!Number.isFinite(c.exp)||!Number.isFinite(c.lastActivity)||c.exp<now||now-c.lastActivity>=IDLE_SECONDS)throw Error("expired");
  const refreshed={...c,lastActivity:now};
  const updated=await sign(refreshed,env.SESSION_SECRET);
  const maxAge=Math.max(0,Math.min(c.exp-now,IDLE_SECONDS));
  return Response.json({authenticated:true,email:c.email,name:c.name,idleTimeoutSeconds:IDLE_SECONDS},{headers:{"Cache-Control":"no-store","Set-Cookie":"gjm_admin_session="+updated+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age="+maxAge}});
 }catch{return unauth();}
}