import {mkdir,readdir,copyFile,cp,rm,writeFile} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist');
for(const file of await readdir('.'))if(/\.(html|css|js)$/.test(file)||['_redirects','_headers'].includes(file))await copyFile(file,'dist/'+file);
await cp('assets','dist/assets',{recursive:true});
const origin=(process.env.HAPPYISH_SITE_URL||process.env.URL||'').replace(/\/$/,'');
await writeFile('dist/robots.txt','User-agent: *\nAllow: /\n'+(origin?'Sitemap: '+origin+'/sitemap.xml\nSitemap: '+origin+'/insights-sitemap.xml\n':''));
if(origin){const pages=(await readdir('dist')).filter(f=>f.endsWith('.html'));await writeFile('dist/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.map(f=>'<url><loc>'+origin+'/'+f+'</loc></url>').join('')+'</urlset>')}
console.log('Built public site into dist; private files and server source excluded.');
