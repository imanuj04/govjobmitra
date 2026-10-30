function parseCookies(header){const out={};for(const part of (header||"").split(";")){const i=part.indexOf("=");if(i>0)out[part.slice(0,i).trim()]=part.slice(i+1).trim();}return out;}
function decode64url(value){value=value.replace(/-/g,"+").replace(/_/g,"/");while(value.length%4)value+="=";return Uint8Array.from(atob(value),c=>c.charCodeAt(0));}
function redirectLogin(){return new Response(null,{status:302,headers:{Location:"/admin/login/", "Cache-Control":"no-store","Set-Cookie":"gjm_admin_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"}});}
export async function onRequest(context){
 const url=new URL(context.request.url);
 if(!(url.pathname==="/admin"||url.pathname==="/admin/"||url.pathname==="/admin/index.html"))return context.next();
 const token=parseCookies(context.request.headers.get("Cookie")).gjm_admin_session;
 if(!token||!context.env.SESSION_SECRET)return redirectLogin();
 try{
  const parts=token.split(".");if(parts.length!==2)return redirectLogin();
  const [payload,signature]=parts;
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(context.env.SESSION_SECRET),{name:"HMAC",hash:"SHA-256"},false,["verify"]);
  const valid=await crypto.subtle.verify("HMAC",key,decode64url(signature),new TextEncoder().encode(payload));
  const data=JSON.parse(new TextDecoder().decode(decode64url(payload))),now=Math.floor(Date.now()/1000);
  if(!valid||data.email!=="dixit.anuj04@gmail.com"||!Number.isFinite(data.exp)||!Number.isFinite(data.lastActivity)||data.exp<=now||now-data.lastActivity>=20*60)return redirectLogin();
  return context.next();
 }catch{return redirectLogin();}
}