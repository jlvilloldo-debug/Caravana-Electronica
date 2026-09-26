// CARAVANA DIGITAL IA · guarda la app y los modelos en el celular para que funcione sin señal.
const CACHE="cdia-v2.0.0";
const BASE=["./","index.html","manifest.webmanifest","icon.svg","icon-192.png","icon-512.png","lib/tf.min.js","lib/mobilenet.min.js","lib/blazeface.min.js","lib/jsqr.min.js","lib/qrcode.min.js","lib/xlsx.mini.min.js","modelos/blazeface/model.json","modelos/blazeface/group1-shard1of1"];
self.addEventListener("install",e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(BASE))) });
self.addEventListener("message",e=>{ if(e.data==="activar") self.skipWaiting() });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())) });
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  const u=new URL(r.url);
  const externo=u.hostname==="storage.googleapis.com"||u.hostname.endsWith("gstatic.com")||u.hostname==="fonts.googleapis.com"||u.hostname==="tfhub.dev"||u.hostname.endsWith("kaggle.com");
  if(externo){ // modelos y fuentes: primero lo guardado (no cambia)
    e.respondWith(caches.open(CACHE).then(async c=>{ const h=await c.match(r); if(h) return h; const res=await fetch(r); if(res.ok||res.type==="opaque") c.put(r,res.clone()); return res }));
    return;
  }
  if(u.origin===location.origin){ // la app: primero la red (para recibir actualizaciones); sin señal, lo guardado
    e.respondWith(fetch(r).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)) } return res }).catch(()=>caches.match(r,{ignoreSearch:true}).then(h=>h||caches.match("index.html"))));
  }
});
