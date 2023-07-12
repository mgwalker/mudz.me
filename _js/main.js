const recipesPromise = fetch("/recipes.json").then((r) => r.json());

document.addEventListener("DOMContentLoaded", async () => {
  const recipes = await recipesPromise;

  const titleWords = new Map();
  const ingredients = new Map();

  for (const [name, path, myIngredients] of recipes) {
    const recipeReference = { name, url: path };

    const nameWords = name.toLowerCase().split(" ");
    for (const word of nameWords) {
      if (!titleWords.has(word)) {
        titleWords.set(word, []);
      }
      titleWords.get(word).push(recipeReference);
    }

    for (const word of myIngredients) {
      if (!ingredients.has(word)) {
        ingredients.set(word, []);
      }
      ingredients.get(word).push(recipeReference);
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

      const titleMatches = new Map();
      const ingredientMatches = new Map();

      for (const word of searchWords) {
        titleWords.forEach((recipes, key) => {
          if (key.includes(word)) {
            recipes.forEach(({ name, url }) => {
              titleMatches.set(name, url);
            });
          }
        });

        ingredients.forEach((recipes, key) => {
          if (key.includes(word)) {
            recipes.forEach(({ name, url }) => {
              if (ingredientMatches.has(name)) {
                ingredientMatches.get(name).words.add(key);
              } else {
                ingredientMatches.set(name, { url, words: new Set([key]) });
              }
            });
          }
        });
      }

      const lines = [];

      if (titleMatches.size > 0) {
        const results = [...titleMatches.keys()].sort();
        lines.push("<h3>By title</h3>");
        lines.push("<ul>");
        results.forEach((name) => {
          lines.push(
            `  <li><a href="${titleMatches.get(name)}">${name}</a></li>`
          );
        });
        lines.push("</ul>");
      }

      for (const [recipeName, { words }] of ingredientMatches) {
        const matchWords = [...words];

        const keep = searchWords.every((searchWord) =>
          matchWords.some((matchWord) => matchWord.includes(searchWord))
        );
        if (!keep) {
          ingredientMatches.delete(recipeName);
        }
      }
      if (ingredientMatches.size > 20) {
        ingredientMatches.clear();
      }

      if (ingredientMatches.size > 0) {
        const results = [...ingredientMatches.keys()].sort(
          (a, b) =>
            ingredientMatches.get(b).words.size -
            ingredientMatches.get(a).words.size
        );

        lines.push("<h3>By ingredients</h3>");
        lines.push("<ul>");
        results.forEach((name) => {
          const { url, words } = ingredientMatches.get(name);
          lines.push(
            `  <li><a href="${url}">${name}</a><div>${[...words]
              .map((word) => `<ld-badge>${word}</ld-badge>`)
              .join("")}</div></li>`
          );
        });
        lines.push("</ul>");
      }

      if (lines.length) {
        const searchResults = document.getElementById("search-results");
        searchResults.innerHTML = lines.join("\n");
      }

      const showResults = titleMatches.size > 0 || ingredientMatches.size > 0;

      document
        .querySelector("main")
        .setAttribute("data-search-active", `${showResults}`);
    });
});
