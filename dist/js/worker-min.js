fetchurl=(e=>fetch("http://localhost:1337/restaurants").then(e=>e.json())),self.onmessage=function(e){switch(e.data.method){case"Neighborhoods":neigh();break;case"Cuisines":cuisi(e.data.data);break;case"Both":both(e.data.param[0],e.data.param[1],e.data.data);break;default:this.console.log("Mmmmh... this should never happen")}},cuisi=(e=>{let t=e.map((t,a)=>e[a].cuisine_type);t=t.filter((e,a)=>t.indexOf(e)==a),self.postMessage(`{"method":"Cuisines","data":${JSON.stringify(t)}}`)}),neigh=(()=>{fetchurl(" ").then(function(e){let t=e.map((t,a)=>e[a].neighborhood);t=t.filter((e,a)=>t.indexOf(e)==a),self.postMessage(`{"method":"Neighborhoods","data":${JSON.stringify(t)},"N":${JSON.stringify(e)}}`)})}),both=((e,t,a)=>{let s=a;"all"!=e&&(s=s.filter(t=>t.cuisine_type==e)),"all"!=t&&(s=s.filter(e=>e.neighborhood==t)),self.postMessage(`{"method":"Both","data":${JSON.stringify(s)}}`)});