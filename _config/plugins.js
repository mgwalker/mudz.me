const purgeCssPlugin = require("eleventy-plugin-purgecss");
const sassPlugin = require("@grimlink/eleventy-plugin-sass");
const sass = require("sass");

module.exports = (config) => {
  config.addPlugin(purgeCssPlugin);
  config.addPlugin(sassPlugin, { sass });
};
