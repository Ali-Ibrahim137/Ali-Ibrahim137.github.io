document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const postsContainer = document.getElementById('posts-container');
    const paginationContainer = document.getElementById('pagination-container');
    const allPostsContainer = document.getElementById('all-posts-container');

    let allPosts = [];
    let filteredPosts = [];
    let currentPage = 1;
    const postsPerPage = Number(postsContainer.dataset.postsPerPage) || 5;

    // Initialize posts from the hidden container
    function initializePosts() {
        const postElements = allPostsContainer.querySelectorAll('.post-homepage-preview');
        allPosts = Array.from(postElements);
        filteredPosts = [...allPosts];
        renderPosts();
        renderPagination();
    }

    // Render posts for current page
    function renderPosts() {
        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;
        const postsToShow = filteredPosts.slice(startIndex, endIndex);

        postsContainer.innerHTML = '';
        postsToShow.forEach(post => {
            postsContainer.appendChild(post.cloneNode(true));
        });
    }

    // Render pagination
    function renderPagination() {
        const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // First page link
        if (currentPage > 1) {
            paginationHTML += `<a href="#" onclick="changePage(1)">« First</a>`;
        }

        // Previous page link
        if (currentPage > 1) {
            paginationHTML += `<a href="#" onclick="changePage(${currentPage - 1})">‹ Previous</a>`;
        }

        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            if (i === currentPage) {
                paginationHTML += `<span class="page-number current">${i}</span>`;
            } else {
                paginationHTML += `<a href="#" onclick="changePage(${i})">${i}</a>`;
            }
        }

        // Next page link
        if (currentPage < totalPages) {
            paginationHTML += `<a href="#" onclick="changePage(${currentPage + 1})">Next ›</a>`;
        }

        // Last page link
        if (currentPage < totalPages) {
            paginationHTML += `<a href="#" onclick="changePage(${totalPages})">Last »</a>`;
        }

        paginationContainer.innerHTML = paginationHTML;
    }

    // Change page
    window.changePage = function(page) {
        currentPage = page;
        renderPosts();
        renderPagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();

        if (searchTerm === '') {
            filteredPosts = [...allPosts];
        } else {
            filteredPosts = allPosts.filter(post => {
                const title = post.querySelector('.post-homepage-title').textContent.toLowerCase();
                return title.includes(searchTerm);
            });
        }

        currentPage = 1;
        renderPosts();
        renderPagination();
    });

    // Initialize on page load
    initializePosts();
});
