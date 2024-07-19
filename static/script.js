/**
 * Displays the content of the selected tab.
 * Hides all other tab contents and shows the one with the specified `tabId`.
 *
 * @param {string} tabId - The ID of the tab to be displayed.
 * @returns {void}
 */
function showTab(tabId) {
  // Hide all tab contents
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => content.style.display = 'none');

  // Show the selected tab content
  const selectedTab = document.getElementById(tabId);
  selectedTab.style.display = 'block';
}

/**
 * Event listener for DOMContentLoaded.
 * Shows the first tab by default when the page loads.
 *
 * @event
 * @param {Event} event - The DOMContentLoaded event.
 * @returns {void}
 */
document.addEventListener('DOMContentLoaded', () => {
  showTab('tab1');
});

/**
 * Event listener for DOMContentLoaded.
 * Toggles the visibility of the navbar links when the toggle button is clicked.
 *
 * @event
 * @param {Event} event - The DOMContentLoaded event.
 * @returns {void}
 */
document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.querySelector('.toggle-button');
  const navbarLinks = document.querySelector('.navbar-links');

  toggleButton.addEventListener('click', () => {
    navbarLinks.classList.toggle('active');
  });
});
