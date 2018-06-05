let restaurants,allRestaurants,neighborhoods,cuisines;
let isMobileMap=false;
let isDesktopMap=false;
let observer;
var selectWorker;  
var map;
var markers = [];
let ul,neighborhoods_select,cuisines_select;



//OPTIMIZATIONS

/* Intersection observer for lazy loading
Reference: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
Thanks mentor Mofid for suggestion */

observeImages =()=>{
const images = document.querySelectorAll('#restaurants-list li img[data-src]');
const config = {
  rootMargin: '50px 0px',
  threshold: 0.01
};
if ('IntersectionObserver' in window) {
  observer = new IntersectionObserver(onChange, config);
  images.forEach(img => observer.observe(img));
} else {
  images.forEach(image => loadImage(image));
}
}

const loadImage = image => {
  image.src = image.dataset.src;
}

function onChange(changes, observer) {
  changes.forEach(change => {
    if (change.intersectionRatio > 0) {
      // Stop watching and load the image
      loadImage(change.target);
      observer.unobserve(change.target);
    }
  });
}


//Classic Fetch
fetchNeighborhoods = (res) => {
    self.neighborhoods= res;
    fillNeighborhoodsHTML();
}
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  neighborhoods.forEach(neighborhood => {
    neighborhoods_select.insertAdjacentHTML('beforeend',`<option value="${neighborhood}">${neighborhood}</option>`);
  });
}
fetchCuisines = (cuisines) => {
  self.cuisines = cuisines;
  fillCuisinesHTML();
  updateRestaurants();
  self.startMaps();
}
fillCuisinesHTML = (cuisines = self.cuisines) => {
  cuisines.forEach(cuisine => {
    cuisines_select.insertAdjacentHTML('beforeend',`<option value="${cuisine}">${cuisine}</option>`);
  });
}

updateRestaurants = () => {
  const cIndex = cuisines_select.selectedIndex;
  const nIndex = neighborhoods_select.selectedIndex;

  const cuisine = cuisines_select[cIndex].value;
  const neighborhood = neighborhoods_select[nIndex].value;
  self.selectWorker.postMessage({method:'Both',param:[cuisine,neighborhood],data:self.allRestaurants});
}
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  ul.innerHTML = '';
  // Remove all map markers
  if(self.map)
    self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  if (!restaurants) {
    ul.innerHTML = `<li style="width:100% !important"><p>No restaurants found!</p></li>`;
    return;
  }
  var ul_temp = renderHtml('ul',null);
  restaurants.forEach(restaurant => {ul_temp.append(createRestaurantHTML(restaurant));});
  ul.innerHTML=ul_temp.innerHTML;
  if(window.innerWidth < 464) {
    
      addMarkersToMobileMap(false);
  }
    else {
   if(self.map) {addMarkersToMap();}
  
  }
   observeImages();
 
}
createRestaurantHTML = (restaurant) => {
  const li = renderHtml('li', null);
  const image =`<img class="restaurant-img" alt="${restaurant.name} restaurant" data-src="img/${restaurant.photograph||'10'}.jpg">`; 
  li.innerHTML=image;
  var title =renderHtml('h2', restaurant.name,li);
  if(restaurant.is_favorite==='true')
	  /* I saw that you can't use external libraries in these assignments, so I used the classic hearth - that I don't like - but in a "real" project I'd have used thishttp://astronautweb.co/snippet/font-awesome/ \f004
	*/
      title.innerHTML+=' <span class="favorite"></span>';
  renderHtml('p', restaurant.neighborhood,li);
  renderHtml('p', restaurant.address,li);
  const more = renderHtml('a', 'View Details');
  more.setAttribute('aria-label', `View Details for ${restaurant.name} Restaurant in ${restaurant.neighborhood}`);
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  return li;
}


//FETCH OPTIMIZATION THROUGH WORKER (SEE WORKER.JS IN NON-DIST)
function myInit() {
  neighborhoods_select = document.getElementById('neighborhoods-select');
  cuisines_select = document.getElementById('cuisines-select');
  ul = document.getElementById('restaurants-list');
  if (window.Worker) {
    self.selectWorker = new Worker("js/worker-min.js");
    self.selectWorker.postMessage({method:'Neighborhoods'});
 requestAnimationFrame(()=>{self.selectWorker.onmessage = function(e) {
      var res = JSON.parse(e.data);
      switch(res.method) {
        case 'Neighborhoods': 
        fetchNeighborhoods(res.data);
        self.selectWorker.postMessage({method:'Cuisines',data:res.N});
        self.allRestaurants =res.N;
        break;
        case 'Cuisines':
        fetchCuisines(res.data);
        break;
        case 'Both':
        resetRestaurants(res.data);
        fillRestaurantsHTML();
    break;
      }
    }
  });
  }
}

//Google Maps Functions from previous assignment
addMarkersToMobileMap = (firstRun,restaurants = self.restaurants) => {
  if(restaurants) {
    let MobileMarkers ='';
  restaurants.forEach(restaurant => {
    // Add marker to the map
    MobileMarkers += `${restaurant.latlng.lat},${restaurant.latlng.lng}|`;
    });
   if(firstRun===false) {
    var mapImage = document.querySelector('.static_map');
    mapImage.style.display ='block'; 
    mapImage.src=`https://maps.googleapis.com/maps/api/staticmap?center=40.722216,-73.987501&markers=size:large|color:red|${MobileMarkers}&zoom=12&size=458x400&maptype=roadmap&key=AIzaSyC880A8PxMSvGATKoCm6j4wFn_JE-FnjQM`;
   } 
  return MobileMarkers;
}
}

addMarkersToMap = (restaurants = self.restaurants) => {
  if(restaurants) {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}
}

//New map loading functions based on window size 
//Show a static map until clicked (save loading time and resources)
//Thanks to Nanodegree Slack Community for coding suggestions and thanks to https://developers.google.com/maps/documentation/maps-static/intro
window.addEventListener('resize',()=>{
  self.startMaps();
});
window.startMaps=()=>{
  //Check for screen size
  if(window.innerWidth < 460) {
    var mapdiv =document.getElementById('map');
	mapdiv.style.display ='none';
	self.isDesktopMap =false;  
	self.startMMap();
    } else {  
      var mapImage = document.querySelector('.static_map');
      mapImage.style.display ='none';
      self.isMobileMap =false;
      self.startDMap();
    }
}

//Mobile map
window.startMMap=() => {
  var mapImage = document.querySelector('.static_map');
  mapImage.style.display ='block'; 
  if(self.isMobileMap===true) {
    return;
  }
  self.isMobileMap =true;
  self.isDesktopMap =false;
  var maplocations =addMarkersToMobileMap(true);
  mapImage.setAttribute('src',`https://maps.googleapis.com/maps/api/staticmap?center=40.722216,-73.987501&markers=size:large|color:red|${maplocations}&zoom=12&size=458x400&maptype=roadmap&key=AIzaSyC880A8PxMSvGATKoCm6j4wFn_JE-FnjQM `);
  mapImage.addEventListener('click',function(e){
    e.preventDefault(); 
    mapImage.style.display ='none'; 
    self.startDMap(); 
  });

}

//Desktop map
window.startDMap = () => {
  var mapdiv =document.getElementById('map');
  mapdiv.style.display ='block';
  if(self.isDesktopMap===true) {
    return;
  }
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(mapdiv, {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
   self.isDesktopMap=true;
  addMarkersToMap();
}


renderHtml = (name, value,parent=null) => {
  var element = document.createElement(name);
  if (value) {
    element.innerHTML = value;
  }
  if(parent) {
  parent.append(element);
  }
  return element;
}
