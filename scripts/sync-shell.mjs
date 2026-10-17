import {readFile, readdir, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {siteShell} from '../lib/shell.mjs';

export async function syncShell() {
  const pages = (await readdir('.')).filter(name => name.endsWith('.html'));
  for (const page of pages) {
    const before = await readFile(page, 'utf8');
    const {header, footer} = await siteShell(page);
    const after = before.replace(/<a class="skip"[^]*?<\/header>/, header)
      .replace(/<footer>[^]*?<\/footer>/, footer);
    if (after !== before) await writeFile(page, after);
  }
  return pages.length;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  console.log(`Synced navigation and footer on ${await syncShell()} pages.`);
}
