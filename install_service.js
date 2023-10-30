var Service = require('node-windows').Service;
 
// Create a new service object
var svc = new Service({
  name: 'iroads-nodejs-server',
  description: 'iroads Node.js server',
  script: 'C:\\iroads-nodejs-server\\index.js'
});
 
// Listen for the 'install' event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

// install the service
svc.install();

