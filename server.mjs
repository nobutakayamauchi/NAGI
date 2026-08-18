import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url));
const types = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webmanifest':'application/manifest+json' };
http.createServer(async (req,res)=>{
  try {
    const pathname = new URL(req.url,'http://x').pathname;
    const rel = pathname === '/' ? 'index.html' : pathname.slice(1);
    const safe = normalize(rel).replace(/^\.\.(\/|\\|$)/,'');
    const path = join(root, safe);
    const data = await readFile(path);
    res.writeHead(200, {'Content-Type': types[extname(path)] || 'application/octet-stream','Cache-Control':'no-cache'}); res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(process.env.PORT || 4173, ()=>console.log(`NAGI v0 http://localhost:${process.env.PORT || 4173}`));
