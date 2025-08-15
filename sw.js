// 定义缓存名称，每次更新文件后，建议修改版本号来触发更新
const CACHE_NAME = 'task-tunnel-cache-v3'; 
// 定义需要缓存的文件列表，使用相对路径
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  // 注意：您需要将所有用到的CSS和JS库的CDN链接也加到这里
  'https://unpkg.com/vue@3/dist/vue.global.js',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap',
  // 同样使用相对路径
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// 安装 Service Worker
self.addEventListener('install', event => {
  // 执行安装步骤
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // 使用 no-cache 模式确保获取的是最新文件
        const requests = urlsToCache.map(url => new Request(url, { cache: 'no-cache' }));
        return cache.addAll(requests);
      })
  );
});

// 监听消息，用于处理更新
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// 激活 Service Worker，并清理旧缓存
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截网络请求，优先从缓存中获取
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 缓存中有匹配的资源，则直接返回
        if (response) {
          return response;
        }
        // 否则，发起网络请求
        return fetch(event.request);
      }
    )
  );
});
