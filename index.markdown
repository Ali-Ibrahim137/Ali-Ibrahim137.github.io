---
layout: page
---

<div class="page-container">
  <div class="content-wrapper">
    <main class="homepage-main">
      <ul class="post-list">
        {%- for post in site.posts -%}
          <li class="post-homepage-preview">
            {%- assign date_format = site.minima.date_format | default: "%b %-d, %Y" -%}
            <div class="post-homepage-date">{{ post.date | date: date_format }}</div>

            <h3 class="post-homepage-title">
              <a class="post-homepage-link" href="{{ post.url | relative_url }}">
                {{ post.title | escape }}
              </a>
            </h3>

            <div class="post-homepage-content">
              <div class="post-homepage-image">
                <img src="{{ site.url }}{{ post.previewImage }}" alt="Preview" />
              </div>
              <div class="post-homepage-excerpt">
                {{ post.excerpt }}
                <a class="post-homepage-link" href="{{ post.url | relative_url }}">Read more →</a>
              </div>
            </div>

            <hr class="post-homepage-divider">
          </li>
        {%- endfor -%}
      </ul>
    </main>

    <aside class="homepage-sidebar">
      {% include archive-tree.html %}
    </aside>
  </div>
</div>
