---
layout: default
pagination:
  data: collections.recipes
  size: 1
permalink: "{{ pagination.items[0].dir }}/index.html"
---

{% assign item = pagination.items[0] %}

# {{ item.name }}

{% for page in item.pages %}

- <a href="{{ page.url }}">{{ page.data.title }}</a>
  {% endfor %}
