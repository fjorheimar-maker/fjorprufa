// Fjörlistinn Service Worker
const CACHE_NAME = 'fjorlistinn-v1';

const STATIC_ASSETS = [
  '/',
  '/starfsmadur/',
  '/deildarstjori/',
  '/admin/',
  '/nemandi/',
  '/minsida/',
  '/kiosk/',
  '/manifest.json',
  '/css/shared/base.css',
  '/css/shared/buttons.css',
  '/css/shared/forms.css',
  '/css/shared/cards.css',
  '/css/shared/loading.css',
  '/css/shared/modals.css',
  '/css/components/login.css',
  '/css/components/header.css',
  '/css/components/tabs.css',
  '/css/components/attendance.css',
  '/css/components/calendar.css',
  '/css/components/charts.css',
  '/css/components/student-popup.css',
  '/css/components/autocomplete.css',
  '/css/components/virkni.css',
  '/js/shared/config.js',
  '/js/shared/api.js',
  '/js/shared/utils.js',
  '/js/shared/state.js',
  '/js/shared/auth.js',
  '/js/components/tabs.js',
  '/js/components/calendar.js',
  '/js/components/student-popup.js'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Fjörlistinn: Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Fjörlistinn: Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {
  // Skip API requests
  if (event.request.url.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Don't cache non-success responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});
