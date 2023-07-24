---
layout: default
pagination:
  data: collections.recipes
  size: 1
permalink: "{{ pagination.items[0].dir }}/index.html"
---

{% assign item = pagination.items[0] %}

# {{ item.name }}

<div class="recipe-list-table">
{% for page in item.pages %}
  <div class="recipe">
    <a href="{{ page.url }}">{{ page.data.title }}
    {% recipeImage page 200 %}</a>
  </div>
{% endfor %}
</div>
