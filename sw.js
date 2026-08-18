const CACHE='nagi-v0-1';
const ASSETS=['/','/index.html','/styles.css','/src/app.js','/src/core/model.js','/src/core/planner.js','/src/core/engine.js','/src/core/store.js','/src/adapters/local-advisor.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)))});
