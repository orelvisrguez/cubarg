// Global variables
let currentTheme = localStorage.getItem('theme') || 'light';
let searchData = [];
let isSearching = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Hide loading screen after a delay
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1500);

    // Initialize theme
    initializeTheme();
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize search
    initializeSearch();
    
    // Initialize table of contents
    initializeTableOfContents();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Initialize intersection observer for active sections
    initializeIntersectionObserver();
    
    // Add event listeners
    addEventListeners();
    
    // Animate content on load
    animateContent();
    
    // Initialize search data
    buildSearchIndex();
}

function initializeTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle.querySelector('i');
    
    if (currentTheme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
}

function initializeNavigation() {
    const navbar = document.getElementById('navbar');
    
    // Handle navbar scroll behavior
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.background = currentTheme === 'dark' ? 
                'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = currentTheme === 'dark' ? 
                'var(--card-bg)' : 'white';
            navbar.style.backdropFilter = 'none';
        }
    });
}

function initializeTableOfContents() {
    const tocSidebar = document.getElementById('toc-sidebar');
    const tocToggle = document.getElementById('toc-toggle');
    const mainContent = document.querySelector('.main-content');
    
    // Initially show TOC on desktop
    if (window.innerWidth > 768) {
        tocSidebar.classList.add('open');
        mainContent.classList.add('with-toc');
    }
    
    tocToggle.addEventListener('click', () => {
        tocSidebar.classList.toggle('open');
        mainContent.classList.toggle('with-toc');
        
        // Update toggle icon
        const icon = tocToggle.querySelector('i');
        if (tocSidebar.classList.contains('open')) {
            icon.className = 'fas fa-chevron-left';
        } else {
            icon.className = 'fas fa-chevron-right';
        }
    });
}

function initializeSearch() {
    const searchBtn = document.getElementById('search-btn');
    const searchModal = document.getElementById('search-modal');
    const closeSearch = document.getElementById('close-search');
    const searchInput = document.getElementById('search-input');
    
    searchBtn.addEventListener('click', () => {
        searchModal.classList.add('show');
        setTimeout(() => searchInput.focus(), 100);
    });
    
    closeSearch.addEventListener('click', () => {
        searchModal.classList.remove('show');
    });
    
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            searchModal.classList.remove('show');
        }
    });
    
    searchInput.addEventListener('input', debounce(performSearch, 300));
    
    // Close search with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchModal.classList.contains('show')) {
            searchModal.classList.remove('show');
        }
    });
}

function buildSearchIndex() {
    const contentSections = document.querySelectorAll('.content-section, section');
    searchData = [];
    
    contentSections.forEach(section => {
        const heading = section.querySelector('h1, h2, h3');
        const text = section.textContent;
        
        if (heading && text) {
            searchData.push({
                title: heading.textContent.trim(),
                content: text.trim(),
                element: section,
                id: section.id || heading.id
            });
        }
    });
}

function performSearch(query) {
    const searchResults = document.getElementById('search-results');
    
    if (!query.trim()) {
        searchResults.innerHTML = '';
        return;
    }
    
    const results = searchData.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.content.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10); // Limit to 10 results
    
    if (results.length === 0) {
        searchResults.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No se encontraron resultados</p>';
        return;
    }
    
    searchResults.innerHTML = results.map(result => {
        const excerpt = getExcerpt(result.content, query);
        return `
            <div class="search-result" onclick="navigateToResult('${result.id}')">
                <h4>${highlightQuery(result.title, query)}</h4>
                <p>${highlightQuery(excerpt, query)}</p>
            </div>
        `;
    }).join('');
}

function getExcerpt(content, query) {
    const index = content.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return content.substring(0, 150) + '...';
    
    const start = Math.max(0, index - 75);
    const end = Math.min(content.length, index + query.length + 75);
    
    let excerpt = content.substring(start, end);
    if (start > 0) excerpt = '...' + excerpt;
    if (end < content.length) excerpt = excerpt + '...';
    
    return excerpt;
}

function highlightQuery(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function navigateToResult(id) {
    const searchModal = document.getElementById('search-modal');
    searchModal.classList.remove('show');
    
    if (id) {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initializeIntersectionObserver() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link, .toc-link');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active class from all links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to current section links
                const currentLinks = document.querySelectorAll(`a[href="#${entry.target.id}"]`);
                currentLinks.forEach(link => link.classList.add('active'));
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-80px 0px -80px 0px'
    });
    
    sections.forEach(section => observer.observe(section));
}

function addEventListeners() {
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Download PDF button
    document.getElementById('download-pdf').addEventListener('click', () => {
        // This would typically generate or download a PDF
        showNotification('Funcionalidad de descarga PDF en desarrollo', 'info');
    });
    
    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show');
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('search-btn').click();
        }
        
        // Ctrl/Cmd + D for theme toggle
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            toggleTheme();
        }
    });
}

function animateContent() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1
    });
    
    const elements = document.querySelectorAll('.content-section, .highlight-box, .warning-box');
    elements.forEach(el => observer.observe(el));
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add notification styles if not already present
    if (!document.querySelector('.notification-styles')) {
        const styles = document.createElement('style');
        styles.className = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 90px;
                right: 20px;
                background: white;
                border-radius: 8px;
                padding: 15px 20px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 1001;
                animation: slideInRight 0.3s ease;
                max-width: 400px;
            }
            .notification-info { border-left: 4px solid #17a2b8; }
            .notification-success { border-left: 4px solid #28a745; }
            .notification-warning { border-left: 4px solid #ffc107; }
            .notification-error { border-left: 4px solid #dc3545; }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'warning': return 'exclamation-triangle';
        case 'error': return 'times-circle';
        default: return 'info-circle';
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize
window.addEventListener('resize', debounce(() => {
    const tocSidebar = document.getElementById('toc-sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (window.innerWidth <= 768) {
        tocSidebar.classList.remove('open');
        mainContent.classList.remove('with-toc');
    } else if (!tocSidebar.classList.contains('open')) {
        tocSidebar.classList.add('open');
        mainContent.classList.add('with-toc');
    }
}, 250));

// Smooth scrolling polyfill for older browsers
if (!('scrollBehavior' in document.documentElement.style)) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/iamdustan/smoothscroll@master/src/smoothscroll.js';
    document.head.appendChild(script);
}