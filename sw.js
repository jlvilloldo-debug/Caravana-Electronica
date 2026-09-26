// Guarda la app y el modelo en el celular para que funcione sin señal en el campo.
const CACHE="caravana-v1";
const BASE=["./","index.html","manifest.webmanifest","icon.svg","lib/tf.min.js","lib/mobilenet.min.js","lib/blazeface.min.js","modelos/blazeface/model.json","modelos/blazeface/group1-shard1of1"];
self.addEventListener("install",e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(BASE)).then(()=>self.skipWaiting())) });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())) });
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  const u=new URL(r.url);
  const modelo=u.hostname==="storage.googleapis.com"||u.hostname.endsWith("gstatic.com")||u.hostname==="fonts.googleapis.com";
  if(modelo){ // primero lo guardado (no cambia)
    e.respondWith(caches.open(CACHE).then(async c=>{ const h=await c.match(r); if(h) return h; const res=await fetch(r); if(res.ok||res.type==="opaque") c.put(r,res.clone()); return res }));
    return;
  }
  if(u.origin===location.origin){ // primero la red (para recibir actualizaciones), si no hay señal lo guardado
    e.respondWith(fetch(r).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)) } return res }).catch(()=>caches.match(r).then(h=>h||caches.match("index.html"))));
  }
});
