const fs = require('fs').promises;
const path = require('path');

const process = async (dir, out, root = '.') => {
  const files = await fs.readdir(`${root}/${dir}`);
  const subdirectories = [];

  await Promise.all(files.map(async (file, i) => {
    const srcPath = `${root}/${dir}/${file}`;

    const stat = await fs.lstat(srcPath);
    if(stat.isDirectory()) {
      try {
        await fs.stat(srcPath);
      } catch(e) {
        await fs.mkdir(srcPath)
      }

      subdirectories.push(file);
    } else {
      // if(i > 0) {
      //   return;
      // }

      let raw = await fs.readFile(srcPath, { encoding: 'utf-8' });
      raw = raw.replace(/---\n.*\n.*\n---/, `---\nlayout: recipe\ntitle: ${path.basename(file, '.md')}\n---`);
      raw = raw.replace(/\[\*\*([^*]+)\*\*\].*/g, "## $1");
      raw = raw.replace(/\[\]{\.s1\}\\/g, '')
      raw = raw.replace(/^\\\n/mg, '')
      raw = raw.replace(/\n\n\n\n/mg, '\n\n')
      raw = raw.replace(/\n\n\n/mg, '\n\n')

      const start = raw.indexOf('## Ingredients');
      let end = raw.indexOf('##', start + 1) || raw.length
      end = end < 0 ? raw.length: end;
      const list = raw.substr(start + 15, end-start-15).replace(/\n\n/g, '\n').replace(/\n(.)/g, '\n* $1');
      raw = raw.substr(0, start + 15) + list + "\n" + raw.substr(end)

      raw = raw.replace(/\* \[([^\]]+)\]\{\.s1\}/g, '\n### $1\n')

      fs.writeFile(`${out}/${file}`, raw, {encoding:'utf-8'})
    }
  }));

  await Promise.all(subdirectories.map(s => {
    return process(s, `${root}/${out}/${s}`, `${root}/${dir}`)}));
};

process('md', '_recipes');