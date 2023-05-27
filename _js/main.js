const recipesPromise = fetch("/recipes.json").then((r) => r.json());

document.addEventListener("DOMContentLoaded", async () => {
  const recipes = await recipesPromise;

  const words = new Map();
  for (const [name, path] of recipes) {
    const nameWords = name.toLowerCase().split(" ");
    for (const word of nameWords) {
      if (!words.has(word)) {
        words.set(word, []);
      }
      words.get(word).push([name, path]);
    }
  }

  document
    .querySelector("ld-sidenav ld-input")
    .addEventListener("ldinput", ({ detail: search }) => {
      const searchWords = search
        .toLowerCase()
        .replace(/[^a-z ]/g, "")
        .split(" ")
        .filter((l) => l.length > 0);

      const matches = new Map();

      for (const word of searchWords) {
        words.forEach((recipes, key) => {
          if (key.includes(word)) {
            recipes.forEach(([name, url]) => {
              matches.set(name, url);
            });
          }
        });
      }

      if (matches.size > 0) {
        document
          .querySelector("main")
          .setAttribute("data-search-active", "true");
        const searchResults = document.getElementById("search-results");

        const results = [...matches.keys()].sort();
        const lines = ["<ul>"];
        results.forEach((name) => {
          lines.push(`  <li><a href="${matches.get(name)}">${name}</a></li>`);
        });

        searchResults.innerHTML = lines.join("\n");
      } else {
        document
          .querySelector("main")
          .setAttribute("data-search-active", "false");
      }
    });
});
