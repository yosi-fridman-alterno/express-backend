var Service = require('node-windows').Service;
 
// Create a new service object
var svc = new Service({
  name: 'iroads-nodejs-server',
  description: 'iroads Node.js server',
  script: 'C:\\iroads-nodejs-server\\index.js'
});
 
// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall',function(){
  console.log('Uninstall complete.');
  console.log('The service exists: ',svc.exists);
});

// uninstall the service
svc.uninstall();

