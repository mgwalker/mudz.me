---
title: Recipes
layout: recipe
---

{% for page in collections.recipes %}
  {% assign count = page.pages.length %}
- [{{ page.name }}](/{{ page.dir }}) {% include "badge", value: count %}
{% endfor %}
