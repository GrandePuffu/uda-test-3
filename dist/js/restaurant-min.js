window.addEventListener("load",function(){"serviceWorker"in navigator&&navigator.serviceWorker.register("newservice-min.js",{scope:"/dist/"}).then(function(e){},function(e){});var e=document.querySelector("iframe");e&&e.setAttribute("title","Google Maps")});class DBHelper{static host(){return"http://localhost:1337"}static endPoints(){return{RESTAURANTS:0,RESTAURANTS_BY_ID:1,REVIEWS:3,REVIEWS_BY_RESTAURANT:4,POST_REVIEWS:5,MARK_FAVOURATES:6,UNMARK_FAVOURATES:7}}static DATABASE_URL(e,t){let r;switch(e){case 0:r=`${DBHelper.host()}/restaurants`;break;case 1:r=`${DBHelper.host()}/restaurants/${t}`;break;case 4:r=`${DBHelper.host()}/reviews/?restaurant_id=${t}`;break;case 5:r=`${DBHelper.host()}/reviews/`;break;case 6:r=`${DBHelper.host()}/restaurants/${t}/?is_favorite=true`;break;case 7:r=`${DBHelper.host()}/restaurants/${t}/?is_favorite=false`;break;default:r=DBHelper.host()}return r}static fetchRestaurantById(e){return fetch(DBHelper.DATABASE_URL(DBHelper.endPoints().RESTAURANTS_BY_ID,e)).then(function(e){return e.ok?e.json():[{}]})}static markAsFavorite(e){var t="true"===e.is_favorite?this.endPoints().MARK_FAVOURATES:this.endPoints().UNMARK_FAVOURATES;return fetch(DBHelper.DATABASE_URL(t,e.id),{method:"PUT",body:e}).then(function(e){return e.ok?e.json():[{}]})}static postReviews(e){return fetch(DBHelper.DATABASE_URL(this.endPoints().POST_REVIEWS,null),{method:"post",body:e}).then(function(e){return e.ok?e.json():[{}]})}static fetchReviewsByRestaurant(e){return fetch(DBHelper.DATABASE_URL(DBHelper.endPoints().REVIEWS_BY_RESTAURANT,e)).then(function(e){return e.ok?e.json():[{}]})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return`/img/${e.photograph?e.photograph:"10"}.jpg`}static imageUrlsForSrcSet(e){var t=`${e||"10"}`;return`/img/${t}.jpg 400w, /img/${t+"-650.jpg"} 600w`}static mapMarkerForRestaurant(e,t){try{if(google){return new google.maps.Marker({position:e.latlng,title:e.name+" Restaurant",url:DBHelper.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}}catch(e){}}}function displayToast(e){var t="none";t="online"===e?"none":"block";var r=document.querySelector("#toast");r.innerHTML="<span>Cannot connect. Trying again...</span>",r.style.display=t}let restaurant,reviews;var map;let is_favorite;var modalOverlay;window.addEventListener("online",e=>{e.preventDefault(),displayToast(e.type)}),window.addEventListener("offline",e=>{e.preventDefault(),displayToast(e.type)});var modal,mapMobileInit=!1,mapDesktopInit=!1;let focusedElementBeforeModal=document.activeElement;const focusableElementsString="input:not([disabled]), textarea:not([disabled]), button:not([disabled])";function initHtml(){fetchRestaurantFromURL(),modalOverlay=document.querySelector(".modal-overlay"),modal=document.querySelector(".modal")}fillRestaurantHTML=((e=self.restaurant)=>{self.is_favorite=e.is_favorite;const t=document.getElementById("restaurant-name");t.innerHTML=e.name,"true"===e.is_favorite?t.innerHTML+='<button tabindex="0" aria-label="Remove favorite mark" onclick="markFavorite(this)" class="favorite"></button>':t.innerHTML+='<button tabindex="0" aria-label="Mark as favorite" onclick="markFavorite(this)" class="un_favorite"></button>',document.getElementById("restaurant-address").innerHTML=e.address;const r=document.getElementById("restaurant-img");r.className="restaurant-img",r.setAttribute("alt",e.name+" restaurant"),r.src=DBHelper.imageUrlForRestaurant(e),r.srcset=DBHelper.imageUrlsForSrcSet(e.photograph),r.sizes="(max-width: 430px) 25vw, (min-width: 650px) calc((100vw - 65px)/2)",document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&fillRestaurantHoursHTML(),fillReviewsHTML()});var markFavorite=e=>{"true"===self.is_favorite?(e.classList.remove("favorite"),e.classList.add("un_favorite"),self.restaurant.is_favorite="false",self.is_favorite="false",e.removeAttribute("aria-label"),e.setAttribute("aria-label","Mark as favorite")):(self.restaurant.is_favorite="true",self.is_favorite="true",e.removeAttribute("aria-label"),e.setAttribute("aria-label","Unfavorite restaurant"),e.classList.remove("un_favorite"),e.classList.add("favorite")),DBHelper.markAsFavorite(self.restaurant)};function fetchRestaurantFromURL(){if(self.restaurant)return Promise.resolve(self.restaurant);const e=getParameterByName("id");return e?DBHelper.fetchRestaurantById(e).then(function(e){return e?(self.restaurant=e,fillRestaurantHTML(),fillBreadcrumb(),Promise.resolve(self.restaurant)):Promise.reject("No restaurant data")}):Promise.reject("No restaurant id in URL")}fillRestaurantHoursHTML=((e=self.restaurant.operating_hours)=>{const t=document.getElementById("restaurant-hours");for(let r in e){const a=document.createElement("tr"),n=renderHtml("td",r);n.setAttribute("tabindex",0),a.appendChild(n);const s=renderHtml("td",e[r]);s.setAttribute("tabindex",0),a.appendChild(s),t.appendChild(a)}}),fillReviewsHTML=((e=self.reviews)=>{e||DBHelper.fetchReviewsByRestaurant(self.restaurant.id).then(function(e){self.reviews=e,fillReviewsHTML()});const t=document.getElementById("reviews-container");t.innerHTML="";const r=renderHtml("h3","Reviews"),a=renderHtml("button","Add Review");a.addEventListener("click",openReviewModal),a.style="float:right",r.appendChild(a),t.appendChild(r);const n=renderHtml("ul",null);if(n.id="reviews-list",!e){const e=renderHtml("p","No reviews yet!");return t.appendChild(e),void self.startMaps()}e.forEach(e=>{n.appendChild(createReviewHTML(e))}),t.appendChild(n),self.startMaps()}),createReviewHTML=(e=>{const t=document.createElement("li"),r=renderHtml("p",e.name);r.setAttribute("class","reviews-list-title"),t.appendChild(r);const a=renderHtml("p",new Date(e.createdAt).toGMTString().slice(0,16));a.setAttribute("class","reviews-list-date"),t.appendChild(a);const n=renderHtml("p",`Rating: ${e.rating}`);n.setAttribute("class","reviews-list-rating"),t.appendChild(n);const s=renderHtml("p",e.comments);return s.setAttribute("class","reviews-list-review"),t.appendChild(s),t}),openReviewModal=(()=>{focusedElementBeforeModal=document.activeElement,modal.innerHTML="",modalOverlay.addEventListener("click",closeModal);const e=renderHtml("form",null),t=renderHtml("h3","Add Review Form");t.id="review_header",modal.setAttribute("aria-labelledby","review_header");const r=renderForm("input","name","text"),a=renderHtml("label","Name:");a.setAttribute("for","name");const n=renderForm("input","rating","number");n.min="1",n.max="5";const s=renderHtml("label","Rating:");s.setAttribute("for","rating");const i=renderForm("textarea","comments"),l=renderHtml("label","Comment:");l.setAttribute("for","comments");const o=renderForm("button","Add_Comment","button");o.innerHTML="Add Review",o.addEventListener("click",addReview);const d=renderHtml("div","");d.id="message_container",addChildsToElement(e,[t,a,r,s,n,l,i,d,o]),modal.appendChild(e),modal.style.display="block",modalOverlay.style.display="block",modal.addEventListener("keydown",trapTabKey);var c=modal.querySelectorAll(focusableElementsString);(c=Array.prototype.slice.call(c))[0].focus()}),trapTabKey=(e=>{var t=modal.querySelectorAll(focusableElementsString),r=(t=Array.prototype.slice.call(t))[0],a=t[t.length-1];9===e.keyCode&&(e.shiftKey?document.activeElement===r&&(e.preventDefault(),a.focus()):document.activeElement===a&&(e.preventDefault(),r.focus())),27===e.keyCode&&closeModal()}),addChildsToElement=((e,t)=>{t.forEach(t=>{e.appendChild(t)})}),addReview=(e=>{var t=modal.querySelectorAll(focusableElementsString);const r={restaurant_id:self.restaurant.id,name:t[0].value,rating:t[1].value,comments:t[2].value,createdAt:Date.now()};checkEmptyFields(t)&&(DBHelper.postReviews(JSON.stringify(r)).then(function(e){self.reviews.push(e),fillReviewsHTML()}).catch(function(e){self.reviews.push(r),fillReviewsHTML()}),closeModal())}),checkEmptyFields=(e=>{let t=!0;const r=document.querySelector("#message_container");return r.innerHTML="",(""===e[0].value||e[1].value<1||e[1].value>5||""===e[1].value||""===e[2].value)&&(t=!1,r.innerHTML="The above field is empty",r.setAttribute("role","alert"),r.setAttribute("aria-live","assertive")),t}),closeModal=(()=>{modal.style.display="none",modalOverlay.style.display="none",focusedElementBeforeModal.focus()}),renderHtml=((e,t)=>{var r=document.createElement(e);return t&&(r.innerHTML=t),r}),renderForm=((e,t,r)=>{const a=document.createElement(e);return a.id=t,a.name=t,r&&(a.type=r),"input"!==e&&"textarea"!==e||a.setAttribute("required",""),a}),fillBreadcrumb=((e=self.restaurant)=>{if(e){const t=document.getElementById("breadcrumb");if(t.childNodes.length<2){const r=renderHtml("li",e.name);r.setAttribute("aria-current","page"),t.appendChild(r)}}}),getParameterByName=((e,t)=>{t||(t=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");const r=new RegExp(`[?&]${e}(=([^&#]*)|&|#|$)`).exec(t);return r?r[2]?decodeURIComponent(r[2].replace(/\+/g," ")):"":null}),window.addEventListener("resize",()=>{self.startMaps()}),window.startMaps=(()=>{window.innerWidth<817?self.InitMobileMap():self.initDesktopMap()}),window.InitMobileMap=(()=>{!0!==self.InitMobileMap&&fetchRestaurantFromURL().then(function(e){var t=document.querySelector(".static_map");t.style.display="block",t.setAttribute("src",`https://maps.googleapis.com/maps/api/staticmap?center=${e.latlng.lat},${e.latlng.lng}&markers=size:large|color:red|${e.latlng.lat},${e.latlng.lng}&zoom=16&size=400x400&maptype=roadmap&key=AIzaSyC880A8PxMSvGATKoCm6j4wFn_JE-FnjQM`),t.addEventListener("click",function(e){e.preventDefault(),t.style.display="none",self.initDesktopMap()})})}),window.initDesktopMap=(()=>{!0!==self.mapDesktopInit&&(fetchRestaurantFromURL().then(function(e){var t=document.getElementById("map");t.style.display="block",self.map=new google.maps.Map(t,{zoom:16,center:e.latlng,scrollwheel:!1}),DBHelper.mapMarkerForRestaurant(e,self.map)}),self.mapDesktopInit=!0)});