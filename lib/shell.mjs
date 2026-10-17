import {readFile} from 'node:fs/promises';

export async function siteShell(activePage = '') {
  const source = await readFile(new URL('./shell.json', import.meta.url))
    .catch(() => readFile(process.cwd() + '/lib/shell.json'));
  const {header, footer} = JSON.parse(source);
  const cleanHeader = header.replace(/ aria-current="page"/g, '');
  const activeHref = '/' + activePage.replace(/^\//, '');
  return {
    header: activePage ? cleanHeader.replace(
      `<a href="${activeHref}">`, `<a href="${activeHref}" aria-current="page">`
    ) : cleanHeader,
    footer
  };
}
