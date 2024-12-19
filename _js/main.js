const recipesPromise = fetch("/recipes.json").then((r) => r.json());

const badge = (content) => {
  const div = document.createElement("div");
  div.classList.add("badge");
  div.innerHTML = `<div>${content}</div>`;
  return div.outerHTML;
};

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

  const searchContainer = document.querySelector(".search-container");

  const escapeHandler = ({ key }) => {
    if (key === "Escape") {
      document.querySelector("button.search-button").click();
    }
  };

  document
    .querySelector("button.search-button")
    .addEventListener("click", () => {
      searchContainer.classList.toggle("closed");
      if (searchContainer.classList.contains("closed")) {
        document.removeEventListener("keydown", escapeHandler);
      } else {
        document.addEventListener("keydown", escapeHandler);
      }
    });

  searchContainer
    .querySelector(".header input")
    .addEventListener("input", ({ target: { value: search } }) => {
      const searchResults = document.querySelector(
        ".search-container .results"
      );

      if (search.length === 0) {
        searchResults.innerHTML = "";
        return;
      }

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
            `  <li><a href="${url}">${name}</a><div> ${[...words]
              .map((word) => badge(word))
              .join("")}</div></li>`
          );
        });
        lines.push("</ul>");
      }

      if (lines.length) {
        searchResults.innerHTML = lines.join("\n");
      }

      const showResults = titleMatches.size > 0 || ingredientMatches.size > 0;

      document
        .querySelector("main")
        .setAttribute("data-search-active", `${showResults}`);
    });
});
