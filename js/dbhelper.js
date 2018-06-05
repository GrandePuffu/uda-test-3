/**
 * Register ServerWoker 
 */

  window.addEventListener('load', function () {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('newservice-min.js',{scope:'/dist/'}).then(function (reg) {
        // Registration wa
      }, function (err) {
        // registration failed :(
      });
    }
    //Add title attribute to the map iframe.
    var iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.setAttribute('title', 'Google Maps');
    }
	  });
/**
 * Common database helper functions.
 */
class DBHelper {

 static  host(){ return 'http://localhost:1337'};
 /*Storing endpoints for each action*/
 static   endPoints() { 
  return {
    RESTAURANTS:0,
    RESTAURANTS_BY_ID:1,
    REVIEWS:3,
    REVIEWS_BY_RESTAURANT:4,
    POST_REVIEWS:5,
    MARK_FAVOURATES:6,
    UNMARK_FAVOURATES:7
  };
}
  static DATABASE_URL(endPoint,parameter) {
    const port = 1337; // Change this to your server port
    let url;
    switch (endPoint) {
      case 0: url= `${DBHelper.host()}/restaurants`;
      break;
      case 1:
      url= `${DBHelper.host()}/restaurants/${parameter}`;
      break;
      case 4:
      url= `${DBHelper.host()}/reviews/?restaurant_id=${parameter}`;
      break;
      case 5:
      url= `${DBHelper.host()}/reviews/`;
      break;
      case 6:
      url= `${DBHelper.host()}/restaurants/${parameter}/?is_favorite=true`;
      break;
      case 7:
      url= `${DBHelper.host()}/restaurants/${parameter}/?is_favorite=false`;
      break;
      default:
      url= DBHelper.host();
    }
    return url;
    
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id) {
   return fetch(DBHelper.DATABASE_URL(DBHelper.endPoints().RESTAURANTS_BY_ID,id))
      .then(function (response) {
        if(response.ok) {
        return response.json();
        } else {
          return [{}];
        }
      });
}

/*Favorite*/
static markAsFavorite(restaurant) {
  var mark =(restaurant.is_favorite ==='true'?this.endPoints().MARK_FAVOURATES:this.endPoints().UNMARK_FAVOURATES);
  return fetch(DBHelper.DATABASE_URL(mark,restaurant.id),{method:'PUT',body:restaurant})
     .then(function (response) {
       if(response.ok) {
       return response.json();
       } else {
         return [{}];
       }
     });
    }

/*Post reviews*/	
static postReviews(review) {
  return fetch(DBHelper.DATABASE_URL(this.endPoints().POST_REVIEWS,null),{method:'post',body:review})
     .then(function (response) {
       if(response.ok) {
       return response.json();
       } else {
         return [{}];
       }
     });
    }

/*Reviews by Restaurant, id as parameter*/
    static fetchReviewsByRestaurant(id) {
     return fetch(DBHelper.DATABASE_URL(DBHelper.endPoints().REVIEWS_BY_RESTAURANT,id))
        .then(function (response) {
          if(response.ok) {
          return response.json();
          } else {
            return [{}];
          }
        });
  }
  
  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }
  /**
   * Restaurant image URL. Thanks to the community for the ":10", I've previously created an "Undefined.webp" generic placeholder
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph ? restaurant.photograph : '10'}.jpg`);
  }
  static imageUrlsForSrcSet(photograph) {
    var image = `${photograph ? photograph : '10'}`;
    const imageExtention = "jpg";
    return (`/img/${image}.${imageExtention} 400w, /img/${image + '-650.' + imageExtention} 600w`);
  }
  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    try {
      if (google) {
        const marker = new google.maps.Marker({
          position: restaurant.latlng,
          title: restaurant.name + ' Restaurant',
          url: DBHelper.urlForRestaurant(restaurant),
          map: map,
          animation: google.maps.Animation.DROP
        });
        return marker;
      }
    } catch (e) { }
  }
}




/*Simple toast for lack of connection */
window.addEventListener('online',(event)=>{
  event.preventDefault();
  displayToast(event.type);
});
window.addEventListener('offline',(event)=>{
  event.preventDefault();
  displayToast(event.type);
});   

function displayToast(type) {
  var message ='<span>Cannot connect. Trying again...</span>',isVisible ='none';
  if(type==='online') {
    isVisible ='none';
  } else {
    isVisible ='block';
  }
  var toast = document.querySelector('#toast');
  toast.innerHTML = message;
  toast.style.display =isVisible;
}

