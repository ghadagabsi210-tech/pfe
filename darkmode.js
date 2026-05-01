/**
 * ESIP Global Dark Mode System
 * Include this script in every page to enable persistent dark mode.
 */

(function() {
    // Support both old key ('theme') and new key ('esip_theme')
    const isDark = localStorage.getItem('esip_theme') === 'dark' ||
                   localStorage.getItem('theme') === 'dark';

    if (isDark) {
        // Migrate to unified key
        localStorage.setItem('esip_theme', 'dark');
        localStorage.setItem('theme', 'dark');

        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        // Apply to body when it's available
        if (document.body) {
            document.body.classList.add('dark');
        }
    }
})();

function toggleDark() {
    const isDark = document.documentElement.classList.toggle('dark');

    // Sync body for pages that style body.dark
    document.body.classList.toggle('dark', isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

    // Save to BOTH keys for full compatibility
    localStorage.setItem('esip_theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    // Update icon if present
    const icon = document.getElementById('darkToggleIcon');
    if (icon) {
        icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
}

// On DOM ready: restore state + sync body class + update icon
document.addEventListener('DOMContentLoaded', function() {
    const isDark = localStorage.getItem('esip_theme') === 'dark' ||
                   localStorage.getItem('theme') === 'dark';

    if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        localStorage.setItem('esip_theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }

    const icon = document.getElementById('darkToggleIcon');
    if (icon) {
        icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }

    // --- LANGUAGE SYSTEM ---
    const lang = localStorage.getItem('preferred_lang') || 'fr';
    const frBtn = document.getElementById('lang-fr');
    const enBtn = document.getElementById('lang-en');
    
    if (frBtn && enBtn) {
        frBtn.style.color = (lang === 'fr') ? '#2563eb' : '#64748b';
        enBtn.style.color = (lang === 'en') ? '#2563eb' : '#64748b';
    }
});

// Shared Language Switcher Function
function changeLang(lang) {
    localStorage.setItem('preferred_lang', lang);
    const domain = window.location.hostname;
    
    if (lang === 'en') {
        document.cookie = "googtrans=/fr/en; path=/";
        document.cookie = "googtrans=/fr/en; path=/; domain=" + domain;
    } else {
        document.cookie = "googtrans=/fr/fr; path=/";
        document.cookie = "googtrans=/fr/fr; path=/; domain=" + domain;
    }
    
    location.reload();
}
