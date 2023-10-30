import { Service } from 'node-windows';

// Create a new service object
var svc = new Service({
  name: 'express-nodejs-server',
  description: 'iroads Node.js server',
  script: 'C:\\Users\\YOSI\\workspace\\express-backend\\index.js'
});
 
// Listen for the 'install' event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

// install the service
svc.install();

