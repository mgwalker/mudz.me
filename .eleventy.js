const { configurePlugins } = require("./_config");
const esbuild = require("esbuild");
const fs = require("fs");

module.exports = (config) => {
  configurePlugins(config);

  config.addPassthroughCopy({ _assets: "assets" });

  config.addWatchTarget("./_js/");

  const collections = fs
    .readdirSync(".", { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map(({ name }) => name)
    .filter((dir) => /^[a-z]/.test(dir))
    .filter((dir) => dir !== "node_modules")
    .map((dir) => dir.replace(/_/g, " "))
    .map((dir) => dir.replace(/^(.)/, (_, f) => f.toUpperCase()))
    .map((name) => ({ name, dir: name.toLowerCase().replace(/ /g, "_") }))
    .sort(({ name: a }, { name: b }) => {
      if (a < b) {
        return -1;
      }
      if (b < a) {
        return 1;
      }
      return 0;
    });

  config.addCollection("recipes", (api) =>
    collections.map(({ name, dir }) => ({
      name,
      dir,
      pages: api
        .getAll()
        .filter(({ template: { inputPath } }) =>
          inputPath.startsWith(`./${dir}/`)
        )
        .sort(({ data: { title: a } }, { data: { title: b } }) => {
          if (a < b) {
            return -1;
          }
          if (b < a) {
            return 1;
          }
          return 0;
        }),
    }))
  );

  config.on("eleventy.before", async () => {
    await esbuild.build({
      entryPoints: ["_js/main.js"],
      bundle: true,
      outfile: "_site/js/main.js",
      sourcemap: false,
    });
  });

  return {
    dir: { input: ".", output: "_site" },
  };
};
