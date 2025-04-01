const searchResult = (result) => `
<li>
  <div class="img" ${
    result.meta.image
      ? `style="background-image: url(${result.meta.image});"`
      : ""
  }>
  </div>
  <div class="info">
    <h3><a href="${result.url}">${result.meta.title}</a></h3>
    ${result.excerpt}...
  </div>
</li>
`;

import("./pagefind/pagefind.js").then((pagefind) => {
  pagefind.init();

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

  const searchResults = document.querySelector(".search-container .results");

  searchContainer
    .querySelector(".header input")
    .addEventListener("input", async ({ target: { value: search } }) => {
      if (search.length === 0) {
        searchResults.innerHTML = "";
        return;
      }

      const results = await pagefind.debouncedSearch(search);
      if (results && results.results.length > 0) {
        const data = await Promise.all(
          results.results.map((r) => r.data())
        ).then((data) => data.map(searchResult));

        searchResults.innerHTML = `<ul>${data.join("")}</ul>`;
      } else {
        searchResults.innerHTML = "";
      }
    });
});
