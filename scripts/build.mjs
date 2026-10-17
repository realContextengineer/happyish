import {mkdir,readdir,copyFile,cp,rm,writeFile} from 'node:fs/promises';
import {syncShell} from './sync-shell.mjs';
await syncShell();
await rm('dist',{recursive:true,force:true});await mkdir('dist');
for(const file of await readdir('.'))if(/\.(html|css|js)$/.test(file)||['_redirects','_headers'].includes(file))await copyFile(file,'dist/'+file);
await cp('assets','dist/assets',{recursive:true});
const origin=(process.env.HAPPYISH_SITE_URL||process.env.URL||'https://happyish.org.uk').replace(/\/$/,'');
await writeFile('dist/robots.txt','User-agent: *\nAllow: /\n'+(origin?'Sitemap: '+origin+'/sitemap.xml\nSitemap: '+origin+'/insights-sitemap.xml\n':''));
if(origin){const pages=(await readdir('dist')).filter(f=>f.endsWith('.html'));const urls=[...pages.map(f=>origin+(f==='index.html'?'/':'/'+f)),origin+'/insights/archive/'];await writeFile('dist/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(url=>'<url><loc>'+url+'</loc></url>').join('')+'</urlset>')}
console.log('Built public site into dist; private files and server source excluded.');
