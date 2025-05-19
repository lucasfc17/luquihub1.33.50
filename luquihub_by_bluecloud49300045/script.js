const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
// const luckyButton = document.getElementById('lucky-button'); // If uncommented

function performSearch() {
    const query = searchInput.value.trim();
    if (query) {
        // Redirect to Google search results page
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
}

searchButton.addEventListener('click', performSearch);

searchInput.addEventListener('keypress', function(event) {
    // Check if the key pressed was Enter
    if (event.key === 'Enter') {
        performSearch();
    }
});

// Optional: Add event listener for "I'm Feeling Lucky" if uncommented
/*
luckyButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        // Redirect to Google's "I'm Feeling Lucky" (usually first result)
        // Note: This might be blocked by browsers sometimes due to redirect policies
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}&btnI`;
    }
});
*/

