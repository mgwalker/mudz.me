const fs = require("fs/promises");

const main = async () => {
  const collections = await fs
    .readdir(".", { withFileTypes: true })
    .then((dirents) =>
      dirents
        .filter((dirent) => dirent.isDirectory())
        .map(({ name }) => name)
        .filter((dir) => /^[a-z]/.test(dir))
        .filter((dir) => dir !== "node_modules")
        .map((dir) => dir.replace(/_/g, " "))
        .map((dir) => dir.replace(/^(.)/, (_, f) => f.toUpperCase()))
        .map((name) => ({ name, dir: name.toLowerCase().replace(/ /g, "_") }))
    );
  console.log(dirs);
};

main();
