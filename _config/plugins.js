const fs = require("fs/promises");
const Image = require("@11ty/eleventy-img");
const path = require("path");
const purgeCssPlugin = require("eleventy-plugin-purgecss");
const sassPlugin = require("@grimlink/eleventy-plugin-sass");
const sass = require("sass");

const exists = async (path) => {
  try {
    await fs.access(path);
    return true;
  } catch (e) {
    return false;
  }
};

const wordsToRemoveFromIngredients = new Set([
  "cup",
  "ounce",
  "tablespoon",
  "teaspoon",
  "peel",
  "pound",
  "mince",
  "slice",
  "and",
  "or",
  "in",
  "the",
  "into",
  "cut",
]);

for (const remove of [...wordsToRemoveFromIngredients]) {
  wordsToRemoveFromIngredients.add(`${remove}s`);
  wordsToRemoveFromIngredients.add(`${remove}ed`);
  wordsToRemoveFromIngredients.add(`${remove}d`);
}

const imgUrlFromMarkdownPath = (() => {
  const urlMapping = new Map();
  const imgExt = ["jpeg", "jpg", "png"];

  return async (mdPath) => {
    if (urlMapping.has(mdPath)) {
      return urlMapping.get(mdPath);
    }

    const dir = path.dirname(mdPath);
    const base = path.basename(mdPath, ".md");

    for await (const ext of imgExt) {
      const imagePath = path.join(dir, `${base}.${ext}`);

      const e = await exists(imagePath);
      if (e) {
        const images = await new Image(imagePath, {
          formats: "png",
          outputDir: "./_site/assets/recipes/",
          widths: [800],
        });
        const imgUrl = images.png[0].outputPath.replace(
          /^_site/,
          "https://mudz.me"
        );
        urlMapping.set(mdPath, imgUrl);
        return imgUrl;
      }
    }

    urlMapping.set(mdPath, false);
    return false;
  };
})();

module.exports = (config) => {
  config.addPlugin(purgeCssPlugin);
  config.addPlugin(sassPlugin, { sass });

  config.addShortcode("recipeImage", async ({ inputPath }) => {
    const imgUrl = await imgUrlFromMarkdownPath(inputPath);
    if (imgUrl) {
      return `<img src="${imgUrl}" alt="" class="recipe-image" />`;
    }
    return "";
  });

  config.addShortcode("imageMeta", async ({ inputPath }) => {
    const imgUrl = await imgUrlFromMarkdownPath(inputPath);
    if (imgUrl) {
      return `<meta property="og:image" content="${imgUrl}" />`;
    }
    return "";
  });

  config.addFilter("encodeURI", encodeURI);

  config.addFilter("jsonify", async (a) => {
    const {
      title,
      page: { inputPath, url },
    } = a.data;

    const recipe = await fs
      .readFile(inputPath, {
        encoding: "utf-8",
      })
      .then((lines) => lines.split("\n").map((line) => line.trim()));

    const ingredientsStart = recipe.findIndex((line) =>
      /^##\s+Ingredients?/gi.test(line)
    );

    const ingredientsEnd = recipe.findIndex(
      (line, index) => index > ingredientsStart && /^##\s+/gi.test(line)
    );

    const ingredients = new Set(
      recipe
        .slice(ingredientsStart, ingredientsEnd)
        .filter((line) => /^[-*]\s+/.test(line))
        .map((line) =>
          line
            .replace(/^[-*]\s+/g, "")
            .replace(/\d+\/\d+"?/g, "")
            .replace(/\d+-\d+"?/g, "")
            .replace(/\d+-[^\s]+/g, "")
            .replace(/\d+"/g, "")
            .replace(/\d/g, "")
            .replace(/[.(),;"]/gi, "")
            .toLowerCase()
            .split(" ")
            .filter((v) => v.trim().length > 0)
            .filter((v) => !wordsToRemoveFromIngredients.has(v))
        )
        .flat()
    );

    return `["${title}", "${url}", ${JSON.stringify([...ingredients])}]`;
  });

  config.addFilter("getCrumbs", (path) => {
    return path
      .split("/")
      .slice(1, -2)
      .map((name, i, paths) => ({
        path: ["", ...paths.slice(0, i), name].join("/"),
        name: name
          .replace(/_/g, " ")
          .replace(/^(.)/, (_, f) => f.toUpperCase()),
      }));
  });
};
