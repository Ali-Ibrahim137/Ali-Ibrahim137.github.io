---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: page
title: AtCoder unofficial Editorials
permalink: /AtCoder
---

<h2 class="post-list-heading">{{ page.list_title}}</h2>
<ul class="post-list">
  {%- for post in site.posts -%}
    {% if post.categories contains "atCoder" %}
      <li>
        {%- assign date_format = site.minima.date_format | default: "%b %-d, %Y" -%}
        <span class="post-meta">{{ post.date | date: date_format }}</span>
        <h3>
          <a class="post-link" href="{{ post.url | relative_url }}">
            {{ post.title | escape }}
          </a>
        </h3>
        {%- if site.show_excerpts -%}
          {{ post.excerpt }}
        {%- endif -%}
      </li>
    {%- endif -%}
  {%- endfor -%}
</ul>
