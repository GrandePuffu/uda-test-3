/*
This worker will manage the research from the two "select" buttons 
Credits for this tutorial: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
*/
fetchurl =(url)=> {return  fetch('http://localhost:1337/restaurants').then(res=> res.json());}

self.onmessage = function(e) {
    switch(e.data.method) {
		//What are you looking for?
		case 'Neighborhoods':
        neigh();
        break;
        case 'Cuisines':
        cuisi(e.data.data);
        break;
        case 'Both':
        both(e.data.param[0],e.data.param[1],e.data.data);
        break;
        default:
        this.console.log('Mmmmh... this should never happen');
      }
    }
  
  cuisi=(res)=>{
    // Get all cuisines from all restaurants
        let cuisines = res.map((v, i) => res[i].cuisine_type);
        // Remove duplicates from cuisines
        cuisines= cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        self.postMessage(`{"method":"Cuisines","data":${JSON.stringify(cuisines)}}`);
  }
  neigh=()=>{
    fetchurl(' ').then(function(res){
        let nhoods = res.map((v, i) => res[i].neighborhood);
        nhoods=  nhoods.filter((v, i) => nhoods.indexOf(v) == i);
       self.postMessage(`{"method":"Neighborhoods","data":${JSON.stringify(nhoods)},"N":${JSON.stringify(res)}}`);
      });
  }

both=(cuisine, neighborhood,res)=>  {
        let results = res;
        if (cuisine != 'all') {
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') {
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        self.postMessage(`{"method":"Both","data":${JSON.stringify(results)}}`);
  }
