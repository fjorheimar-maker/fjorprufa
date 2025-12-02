module.exports = function(eleventyConfig) {
  // Afrita static skrár (CSS, JS, myndir)
  // Nota object syntax til að tryggja réttar slóðir
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  
  // Afrita manifest og service worker fyrir PWA
  eleventyConfig.addPassthroughCopy({ "src/manifest.json": "manifest.json" });
  eleventyConfig.addPassthroughCopy({ "src/sw.js": "service-worker.js" });
  
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
