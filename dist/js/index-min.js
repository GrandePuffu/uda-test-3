window.addEventListener("load",function(){"serviceWorker"in navigator&&navigator.serviceWorker.register("newservice-min.js",{scope:"/dist/"}).then(function(e){},function(e){});var e=document.querySelector("iframe");e&&e.setAttribute("title","Google Maps")});class DBHelper{static host(){return"http://localhost:1337"}static endPoints(){return{RESTAURANTS:0,RESTAURANTS_BY_ID:1,REVIEWS:3,REVIEWS_BY_RESTAURANT:4,POST_REVIEWS:5,MARK_FAVOURATES:6,UNMARK_FAVOURATES:7}}static DATABASE_URL(e,t){let s;switch(e){case 0:s=`${DBHelper.host()}/restaurants`;break;case 1:s=`${DBHelper.host()}/restaurants/${t}`;break;case 4:s=`${DBHelper.host()}/reviews/?restaurant_id=${t}`;break;case 5:s=`${DBHelper.host()}/reviews/`;break;case 6:s=`${DBHelper.host()}/restaurants/${t}/?is_favorite=true`;break;case 7:s=`${DBHelper.host()}/restaurants/${t}/?is_favorite=false`;break;default:s=DBHelper.host()}return s}static fetchRestaurantById(e){return fetch(DBHelper.DATABASE_URL(DBHelper.endPoints().RESTAURANTS_BY_ID,e)).then(function(e){return e.ok?e.json():[{}]})}static markAsFavorite(e){var t="true"===e.is_favorite?this.endPoints().MARK_FAVOURATES:this.endPoints().UNMARK_FAVOURATES;return fetch(DBHelper.DATABASE_URL(t,e.id),{method:"PUT",body:e}).then(function(e){return e.ok?e.json():[{}]})}static postReviews(e){return fetch(DBHelper.DATABASE_URL(this.endPoints().POST_REVIEWS,null),{method:"post",body:e}).then(function(e){return e.ok?e.json():[{}]})}static fetchReviewsByRestaurant(e){return fetch(DBHelper.DATABASE_URL(DBHelper.endPoints().REVIEWS_BY_RESTAURANT,e)).then(function(e){return e.ok?e.json():[{}]})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return`/img/${e.photograph?e.photograph:"10"}.jpg`}static imageUrlsForSrcSet(e){var t=`${e||"10"}`;return`/img/${t}.jpg 400w, /img/${t+"-650.jpg"} 600w`}static mapMarkerForRestaurant(e,t){try{if(google){return new google.maps.Marker({position:e.latlng,title:e.name+" Restaurant",url:DBHelper.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}}catch(e){}}}function displayToast(e){var t="none";t="online"===e?"none":"block";var s=document.querySelector("#toast");s.innerHTML="<span>Cannot connect. Trying again...</span>",s.style.display=t}let restaurants,allRestaurants,neighborhoods,cuisines;window.addEventListener("online",e=>{e.preventDefault(),displayToast(e.type)}),window.addEventListener("offline",e=>{e.preventDefault(),displayToast(e.type)});let observer,isMobileMap=!1,isDesktopMap=!1;var selectWorker,map,markers=[];let ul,neighborhoods_select,cuisines_select;observeImages=(()=>{const e=document.querySelectorAll("#restaurants-list li img[data-src]");"IntersectionObserver"in window?(observer=new IntersectionObserver(onChange,{rootMargin:"50px 0px",threshold:.01}),e.forEach(e=>observer.observe(e))):e.forEach(e=>loadImage(e))});const loadImage=e=>{e.src=e.dataset.src};function onChange(e,t){e.forEach(e=>{e.intersectionRatio>0&&(loadImage(e.target),t.unobserve(e.target))})}function myInit(){neighborhoods_select=document.getElementById("neighborhoods-select"),cuisines_select=document.getElementById("cuisines-select"),ul=document.getElementById("restaurants-list"),window.Worker&&(self.selectWorker=new Worker("js/worker-min.js"),self.selectWorker.postMessage({method:"Neighborhoods"}),requestAnimationFrame(()=>{self.selectWorker.onmessage=function(e){var t=JSON.parse(e.data);switch(t.method){case"Neighborhoods":fetchNeighborhoods(t.data),self.selectWorker.postMessage({method:"Cuisines",data:t.N}),self.allRestaurants=t.N;break;case"Cuisines":fetchCuisines(t.data);break;case"Both":resetRestaurants(t.data),fillRestaurantsHTML()}}}))}fetchNeighborhoods=(e=>{self.neighborhoods=e,fillNeighborhoodsHTML()}),fillNeighborhoodsHTML=((e=self.neighborhoods)=>{e.forEach(e=>{neighborhoods_select.insertAdjacentHTML("beforeend",`<option value="${e}">${e}</option>`)})}),fetchCuisines=(e=>{self.cuisines=e,fillCuisinesHTML(),updateRestaurants(),self.startMaps()}),fillCuisinesHTML=((e=self.cuisines)=>{e.forEach(e=>{cuisines_select.insertAdjacentHTML("beforeend",`<option value="${e}">${e}</option>`)})}),updateRestaurants=(()=>{const e=cuisines_select.selectedIndex,t=neighborhoods_select.selectedIndex,s=cuisines_select[e].value,r=neighborhoods_select[t].value;self.selectWorker.postMessage({method:"Both",param:[s,r],data:self.allRestaurants})}),resetRestaurants=(e=>{self.restaurants=[],ul.innerHTML="",self.map&&self.markers.forEach(e=>e.setMap(null)),self.markers=[],self.restaurants=e}),fillRestaurantsHTML=((e=self.restaurants)=>{if(e){var t=renderHtml("ul",null);e.forEach(e=>{t.append(createRestaurantHTML(e))}),ul.innerHTML=t.innerHTML,window.innerWidth<464?addMarkersToMobileMap(!1):self.map&&addMarkersToMap(),observeImages()}else ul.innerHTML='<li style="width:100% !important"><p>No restaurants found!</p></li>'}),createRestaurantHTML=(e=>{const t=renderHtml("li",null),s=`<img class="restaurant-img" alt="${e.name} restaurant" data-src="img/${e.photograph||"10"}.jpg">`;t.innerHTML=s;var r=renderHtml("h2",e.name,t);"true"===e.is_favorite&&(r.innerHTML+=' <span class="favorite"></span>'),renderHtml("p",e.neighborhood,t),renderHtml("p",e.address,t);const a=renderHtml("a","View Details");return a.setAttribute("aria-label",`View Details for ${e.name} Restaurant in ${e.neighborhood}`),a.href=DBHelper.urlForRestaurant(e),t.append(a),t}),addMarkersToMobileMap=((e,t=self.restaurants)=>{if(t){let r="";if(t.forEach(e=>{r+=`${e.latlng.lat},${e.latlng.lng}|`}),!1===e){var s=document.querySelector(".static_map");s.style.display="block",s.src=`https://maps.googleapis.com/maps/api/staticmap?center=40.722216,-73.987501&markers=size:large|color:red|${r}&zoom=12&size=458x400&maptype=roadmap&key=AIzaSyC880A8PxMSvGATKoCm6j4wFn_JE-FnjQM`}return r}}),addMarkersToMap=((e=self.restaurants)=>{e&&e.forEach(e=>{const t=DBHelper.mapMarkerForRestaurant(e,self.map);google.maps.event.addListener(t,"click",()=>{window.location.href=t.url}),self.markers.push(t)})}),window.addEventListener("resize",()=>{self.startMaps()}),window.startMaps=(()=>{window.innerWidth<460?(document.getElementById("map").style.display="none",self.isDesktopMap=!1,self.startMMap()):(document.querySelector(".static_map").style.display="none",self.isMobileMap=!1,self.startDMap())}),window.startMMap=(()=>{var e=document.querySelector(".static_map");if(e.style.display="block",!0!==self.isMobileMap){self.isMobileMap=!0,self.isDesktopMap=!1;var t=addMarkersToMobileMap(!0);e.setAttribute("src",`https://maps.googleapis.com/maps/api/staticmap?center=40.722216,-73.987501&markers=size:large|color:red|${t}&zoom=12&size=458x400&maptype=roadmap&key=AIzaSyC880A8PxMSvGATKoCm6j4wFn_JE-FnjQM `),e.addEventListener("click",function(t){t.preventDefault(),e.style.display="none",self.startDMap()})}}),window.startDMap=(()=>{var e=document.getElementById("map");if(e.style.display="block",!0===self.isDesktopMap)return;self.map=new google.maps.Map(e,{zoom:12,center:{lat:40.722216,lng:-73.987501},scrollwheel:!1}),self.isDesktopMap=!0,addMarkersToMap()}),renderHtml=((e,t,s=null)=>{var r=document.createElement(e);return t&&(r.innerHTML=t),s&&s.append(r),r});