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

module.exports = (config) => {
  config.addPlugin(purgeCssPlugin);
  config.addPlugin(sassPlugin, { sass });

  const imgExt = ["jpeg", "jpg", "png"];
  config.addShortcode("imageMeta", async ({ inputPath }) => {
    for await (const ext of imgExt) {
      const imagePath = path.join(
        path.dirname(inputPath),
        `${path.basename(inputPath, ".md")}.${ext}`
      );

      const e = await exists(imagePath);
      if (e) {
        const images = await new Image(imagePath, {
          formats: "png",
          outputDir: "./_site/assets/recipes/",
          widths: [800],
        });
        const imgUrl = images.png[0].outputPath.replace(/^_site/, "");
        return `<meta property="og:image" content="${imgUrl}" />`;
      }
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
};
