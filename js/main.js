/**
 * Zaheb International - Main JavaScript
 * Author: Claude AI
 * Version: 1.2
 * 
 * This file serves as the main entry point for all JavaScript functionality.
 * It loads and initializes all the separate JavaScript modules.
 */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    console.log('Zaheb International website initializing...');

    // Initialize language module (must be first)
    if (window.LanguageModule) {
        window.LanguageModule.init();
    }

    // Initialize navigation module
    if (window.NavigationModule) {
        window.NavigationModule.init();
    }

    // Initialize animations module
    if (window.AnimationsModule) {
        window.AnimationsModule.init();
    }

    // Initialize WhatsApp module
    if (window.WhatsAppModule) {
        window.WhatsAppModule.init();
    }

    // Initialize contact form module if on contact page
    if (document.body.classList.contains('contact-page') && window.ContactModule) {
        window.ContactModule.init();
    }

    // Initialize Prismic hero data fetching if on index page
    if (document.body.classList.contains('index-page') && typeof fetchHeroData === 'function') {
        fetchHeroData();
    }

    console.log('Zaheb International website initialized successfully');
});