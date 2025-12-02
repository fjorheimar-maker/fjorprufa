module.exports = function(eleventyConfig) {
  // Afrita static skrár (CSS, JS, myndir)
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/images");
  
  // Afrita manifest og service worker fyrir PWA
  eleventyConfig.addPassthroughCopy("src/manifest.json");
  eleventyConfig.addPassthroughCopy("src/sw.js");
  
  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "public"
    },
    // Nota Nunjucks fyrir HTML og njk skrár
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
