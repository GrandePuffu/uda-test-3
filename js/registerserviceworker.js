//Register a service worker in build/service.js

if(navigator.serviceWorker){
    navigator.serviceWorker.register('/build/service.js', {scope: './'})
    .then(() => {
        console.log("Service worker has been successfully registered.");
    }).catch((err) => {
        console.log("error " , err);
    });
}
