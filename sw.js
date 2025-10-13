const CACHE_NAME = 'pwa-version-1';

const assets = [
  '/manifest.json',
  '/video_2025-10-11_18-12-40.mp4'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    self.skipWaiting().then(() => {
      return caches.open(CACHE_NAME)
        .then((cache) => {
          return cache.addAll(assets)
            .catch(err => {
              console.log('Failed to cache assets:', err)
            })
        })
    })
  );
});
