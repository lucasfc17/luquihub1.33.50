document.addEventListener('DOMContentLoaded', () => {
    const tabsContainer = document.getElementById('tabs-container');
    const addTabButton = document.getElementById('add-tab-button');
    const tabContentArea = document.getElementById('tab-content-area');

    // Settings Elements
    const settingsButton = document.getElementById('settings-button');
    const settingsModal = document.getElementById('settings-modal');
    const closeModalButton = settingsModal.querySelector('.close-modal-button');
    const themeSelect = document.getElementById('theme-select');
    const saveSettingsButton = document.getElementById('save-settings-button');

    let tabs = [];
    let activeTabId = null;
    let nextTabId = 1;

    let currentSettings = {
        theme: 'light' // Default theme
    };

    function createSearchInterfaceHTML() {
        // The logo path is absolute, so it doesn't depend on current URL
        return `
            <div class="container">
                <img src="/luquihub-logo.png" alt="Luquihub Logo" class="logo">
                <div class="search-bar">
                    <input type="text" class="search-input" placeholder="Search Luquihub or type a URL">
                    <button class="search-button">Search</button>
                </div>
            </div>
        `;
    }

    function performSearch(currentTabContent) {
        const searchInput = currentTabContent.querySelector('.search-input');
        if (!searchInput) return; 

        const query = searchInput.value.trim();
        if (query) {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
        }
    }

    function initializeSearchEventListeners(tabContentElement) {
        const searchInput = tabContentElement.querySelector('.search-input');
        const searchButton = tabContentElement.querySelector('.search-button');

        if (searchButton) {
            const newSearchButton = searchButton.cloneNode(true); 
            searchButton.parentNode.replaceChild(newSearchButton, searchButton);
            newSearchButton.addEventListener('click', () => performSearch(tabContentElement));
        }
        if (searchInput) {
            const newSearchInput = searchInput.cloneNode(true);
            searchInput.parentNode.replaceChild(newSearchInput, searchInput);
            newSearchInput.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    performSearch(tabContentElement);
                }
            });
            setTimeout(() => newSearchInput.focus(), 0);
        }
    }

    function renderTabs() {
        tabsContainer.innerHTML = ''; 
        tabs.forEach(tab => {
            const tabElement = document.createElement('div');
            tabElement.classList.add('tab');
            tabElement.dataset.tabId = String(tab.id);
            
            const titleSpan = document.createElement('span');
            titleSpan.textContent = tab.title;
            titleSpan.style.overflow = 'hidden';
            titleSpan.style.textOverflow = 'ellipsis';
            titleSpan.style.whiteSpace = 'nowrap';


            if (tab.id === activeTabId) {
                tabElement.classList.add('active');
            }

            const closeButton = document.createElement('span');
            closeButton.classList.add('close-tab');
            closeButton.innerHTML = '&times;';
            closeButton.title = 'Close tab';
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation(); 
                closeTab(tab.id);
            });
            
            tabElement.appendChild(titleSpan);
            tabElement.appendChild(closeButton);
            tabElement.addEventListener('click', () => switchTab(tab.id));
            tabsContainer.appendChild(tabElement);
        });
    }

    function renderActiveTabContent() {
        tabContentArea.innerHTML = ''; 
        const activeTab = tabs.find(tab => tab.id === activeTabId);
        if (activeTab) {
            if (!activeTab.contentElement) { 
                const contentWrapper = document.createElement('div');
                contentWrapper.innerHTML = activeTab.contentHTML;
                activeTab.contentElement = contentWrapper.children[0]; 
            }
            tabContentArea.appendChild(activeTab.contentElement);
            initializeSearchEventListeners(activeTab.contentElement);
        } else {
             tabContentArea.innerHTML = '<p>No tabs open. Click "+" to add a new tab.</p>';
        }
    }
    
    function getNextTabTitle() {
        let num = 1;
        while (tabs.some(tab => tab.title === `Tab ${num}`)) {
            num++;
        }
        return `Tab ${num}`;
    }

    function addNewTab(makeActive = true) {
        const tabId = nextTabId++;
        const newTab = {
            id: tabId,
            title: getNextTabTitle(),
            contentHTML: createSearchInterfaceHTML(),
            contentElement: null 
        };
        tabs.push(newTab);
        if (makeActive || !activeTabId) {
            activeTabId = tabId;
        }
        renderTabs();
        if (activeTabId === tabId) { 
            renderActiveTabContent();
        }
    }

    function switchTab(tabId) {
        if (activeTabId === tabId) return; 
        activeTabId = tabId;
        renderTabs();
        renderActiveTabContent();
    }

    function closeTab(tabIdToClose) {
        const tabIndex = tabs.findIndex(tab => tab.id === tabIdToClose);
        if (tabIndex === -1) return;

        tabs.splice(tabIndex, 1);

        if (activeTabId === tabIdToClose) {
            if (tabs.length > 0) {
                const nextActiveTab = tabs[Math.min(tabIndex, tabs.length - 1)] || tabs[0];
                activeTabId = nextActiveTab ? nextActiveTab.id : null;
            } else {
                activeTabId = null; 
            }
        }
        
        renderTabs();
        renderActiveTabContent(); 
    }

    // Settings Logic
    function applyTheme(theme) {
        document.body.classList.remove('light-mode', 'dark-mode');
        if (theme) { // Ensure theme is not undefined or null
            document.body.classList.add(theme + '-mode');
        } else {
            document.body.classList.add('light-mode'); // Fallback to light if theme is invalid
        }
    }

    function loadSettings() {
        const savedSettings = localStorage.getItem('luquihubSettings');
        if (savedSettings) {
            try {
                currentSettings = JSON.parse(savedSettings);
                if (!currentSettings.theme) { // Basic validation
                    currentSettings.theme = 'light';
                }
            } catch (e) {
                console.error("Error parsing settings from localStorage:", e);
                currentSettings.theme = 'light'; // Reset to default if parsing fails
            }
        }
        applyTheme(currentSettings.theme);
        themeSelect.value = currentSettings.theme;
    }

    function saveAndApplySettings() {
        currentSettings.theme = themeSelect.value;
        try {
            localStorage.setItem('luquihubSettings', JSON.stringify(currentSettings));
        } catch (e) {
            console.error("Error saving settings to localStorage:", e);
            // Potentially notify user if storage is full or unavailable
        }
        applyTheme(currentSettings.theme);
        settingsModal.style.display = 'none'; 
    }

    // Event Listeners for Settings Modal
    settingsButton.addEventListener('click', () => {
        themeSelect.value = currentSettings.theme; 
        settingsModal.style.display = 'block';
    });

    closeModalButton.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    saveSettingsButton.addEventListener('click', saveAndApplySettings);
    
    // Initialize
    loadSettings(); // Load settings on startup
    addTabButton.addEventListener('click', () => addNewTab(true));
    if (tabs.length === 0) { // Only add initial tab if none exist (e.g. after settings load)
      addNewTab(true); // Create the first tab and make it active
    } else { // If tabs were somehow persisted (not in this version), render them
      renderTabs();
      renderActiveTabContent();
    }
});