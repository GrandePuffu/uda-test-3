importScripts("idb-min.js");const dataHost="localhost:1337",pathNames=["restaurants","reviews","pending_reviews"];var CACHE_NAME="mws-restaurant-cache-v1",urlsToCache=["/","/index.html","/img/favicon.ico","/restaurant.html","/css/styles.css","/css/restaurant.css","/js/worker-min.js","/js/index-min.js","/js/restaurant-min.js"];self.addEventListener("install",function(e){e.waitUntil(caches.open(CACHE_NAME).then(function(e){e.addAll(urlsToCache.map(function(e){return new Request(e,{mode:"no-cors"})}))}))});var lastdate=new Date(new Date(Date.now()).getTime()+6e4);function getRestaurantData(e,t,n){if(1===t.indexOf(pathNames[0])){if(e&&e.length>2){return fetchRestaurantsFromIDBPerId(e[2]).then(function(e){return new Response(JSON.stringify(e),{headers:{"Content-Type":"application/json"}})})}return fetchRestaurantsFromIDB().then(function(e){return new Response(JSON.stringify(e),{headers:{"Content-Type":"application/json"}})})}if(1===t.indexOf(pathNames[1])){var r=n.split("=");if(r)return fetchReviewsFromIDB(r[1]).then(function(e){return new Response(JSON.stringify(e),{headers:{"Content-Type":"application/json"}})})}}function openDatabase(){return navigator.serviceWorker||idb?idb.open("restaurant",1):Promise.resolve()}function CacheRestaurants(e,t){WriteToIDB(e,t),lastdate=new Date(new Date(Date.now()).getTime()+6e4)}function createDB(){idb.open("restaurant",1,function(e){var t=e.createObjectStore("restaurants",{keyPath:"id"}),n=e.createObjectStore("reviews",{keyPath:"id"});e.createObjectStore("pending_reviews",{keyPath:"id",autoIncrement:!0});t.createIndex("id","id"),n.createIndex("restaurant_id","restaurant_id")})}function WriteToIDB(e,t){e.then(function(e){const n=self.openDatabase();n&&n.then(n=>{const r=n.transaction(t,"readwrite");try{e&&e.length>0?e.forEach(e=>{r.objectStore(t).put(e)}):r.objectStore(t).put(e)}catch(e){}return r.complete})})}function fetchRestaurantsFromIDB(){const e=self.openDatabase();if(e)return e.then(e=>e.transaction("restaurants").objectStore("restaurants").getAll()).then(function(e){return e})}function fetchRestaurantsFromIDBPerId(e){const t=self.openDatabase();if(t)return t.then(t=>t.transaction("restaurants").objectStore("restaurants").get(parseInt(e))).then(function(e){return e})}function submitPendingReviews(e){navigator.onLine&&e.length>0&&e.forEach(function(e){fetch(`http://${dataHost}/reviews/`,{method:"POST",body:JSON.stringify(e)}).then(clearPendingReviews())})}function clearPendingReviews(){const e=self.openDatabase();if(e)return e.then(e=>e.transaction(pathNames[2],"readwrite").objectStore(pathNames[2]).clear())}function processPendingReviews(){if(navigator.onLine){const e=self.openDatabase();if(!e)return;return e.then(e=>e.transaction(pathNames[2]).objectStore(pathNames[2]).getAll()).then(function(e){submitPendingReviews(e)})}}function fetchReviewsFromIDB(e){const t=self.openDatabase();if(t)return t.then(e=>e.transaction("reviews").objectStore("reviews").getAll()).then(function(t){return t.filter(t=>t.restaurant_id==parseInt(e))}).catch(e=>console.log(e))}self.addEventListener("fetch",function(e){const t=new URL(e.request.url),n=t.pathname.split("/");if(t.host===dataHost){processPendingReviews();const r=e.request.clone();return e.respondWith(fetch(r).then(function(e){if(e){var n=e.clone();return 1===t.pathname.indexOf(pathNames[0])?CacheRestaurants(n.json(),pathNames[0]):1===t.pathname.indexOf(pathNames[1])&&CacheRestaurants(n.json(),pathNames[1]),e}}).catch(function(r){return"POST"===e.request.method&&e.request.clone().text().then(e=>{CacheRestaurants(Promise.resolve(JSON.parse(e)),pathNames[2])}),getRestaurantData(n,t.pathname,t.search)}))}if(t.origin===location.origin)return e.respondWith(caches.match(e.request,{ignoreSearch:!0}).then(function(n){if(n)return n;var r=e.request.clone();return fetch(r).then(function(t){if(!t||200!==t.status||"basic"!==t.type)return t;var n=t.clone();return caches.open(CACHE_NAME).then(function(t){t.put(e.request,n)}),t}).catch(function(e){return console.log(`error : ${t}`),new Response("error")})}).catch(function(e){return console.log(`error : ${t}`),new Response("error")}))}),self.addEventListener("activate",function(e){createDB(),e.waitUntil(caches.keys().then(function(e){return Promise.all(e.map(function(t){if(-1===e.indexOf(CACHE_NAME))return caches.delete(t)}))}))});