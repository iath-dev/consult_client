const express = require('express');
const os = require('os');
const Consul = require('consul');

const [ _, __, PORT, HOST ] = process.argv;

const SERVICE_NAME = 'express_service'
const SERVICE_ID = `m${PORT}`;
const SCHEME = 'http'

const PID = process.pid

console.log('====================================');
console.log(HOST, PORT, SERVICE_NAME, SERVICE_ID, SCHEME, PID);
console.log('====================================');

const getIPV4 = () => {
  const networkInterfaces = os.networkInterfaces();

  for (const interfaceName in networkInterfaces) {

    if (interfaceName === 'eth1') {
      const interfaces = networkInterfaces[interfaceName];
  
      for (const netInterface of interfaces) {
        if (netInterface.family === 'IPv4' && !netInterface.internal) {
          console.log(`Interface: ${interfaceName}`);
          console.log(`IP Address: ${netInterface.address}`);
  
          return netInterface.address;
        }
      }
    }
  }
}

const ipv4 = getIPV4();

console.log('====================================');
console.log(ipv4);
console.log('====================================');

// Server Init
const app = express();
const consul = new Consul();

app.get('/health', (req, res) => {
  console.log('Health Check!');;
  res.end('Ok.');
})

app.get('/', (req, res) => {
  console.log('GET /', Date.now());
  res.json({
    data: Math.floor(Math.random() * 89999999 + 10000000),
    data_pid: PID,
    data_service: SERVICE_ID,
    data_host: HOST
  })
})

app.listen(PORT, () => console.log(`Servicio iniciado en ${SCHEME}://${HOST}:${PORT}!`))


/* Registro del servicio */
var check = {
  id: SERVICE_ID,
  name: SERVICE_NAME,
  address: HOST,
  port: PORT, 
  check: {
    http: SCHEME+'://'+HOST+':'+PORT+'/health',
    ttl: '5s',
    interval: '5s',
    timeout: '5s',
    deregistercriticalserviceafter: '1m'
  }
};
 
console.log('====================================');
console.log({ check });
console.log('====================================');

consul.agent.service.register(check, function(err) {
  if (err) throw err;
});
