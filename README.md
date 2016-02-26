# bonjour-over-http
Http server to find / announce bonjour services.

It provides an API and a binary to install.

# API

## Publish services
### POST /publish

Description : Publish a service over bonjour.

Format : `multipart/form-data`

Data:
```
  if ('name' in req.body)       options.name = req.body.name
  if ('port' in req.body)       options.port = req.body.port
  if ('type' in req.body)       options.type = req.body.type
  if ('host' in req.body)       options.host = req.body.host
  if ('subtypes' in req.body)   options.subtypes = req.body.subtypes
  if ('protocol' in req.body)   options.protocol = req.body.protocol
  if ('txt' in req.body)        options.txt = req.body.txt
```

Response:
```
res[id] = {
  id:         publishedServices[id].id,
  name:       publishedServices[id].name,
  protocol:   publishedServices[id].protocol,
  type:       publishedServices[id].type,
  host:       publishedServices[id].host,
  port:       publishedServices[id].port,
  fqdn:       publishedServices[id].fqdn,
  subtypes:   publishedServices[id].subtypes,
  txt:        publishedServices[id].txt,
  published:  publishedServices[id].published,
}
```

### GET /published

Description : List published services from this server.

Format : `-`

Data: `none`

Response:
```
res[id] = {
  id:         publishedServices[id].id,
  name:       publishedServices[id].name,
  protocol:   publishedServices[id].protocol,
  type:       publishedServices[id].type,
  host:       publishedServices[id].host,
  port:       publishedServices[id].port,
  fqdn:       publishedServices[id].fqdn,
  subtypes:   publishedServices[id].subtypes,
  txt:        publishedServices[id].txt,
  published:  publishedServices[id].published,
}
```

### POST /unpublish

Description : unpublish previously published service.

Format : `multipart/form-data`

Data: `req.body.id`

Response: `-`

### POST /unpublishall

Description : unpublish all previously published services.

Format : `multipart/form-data`

Data: `-`

Response: `-`

## Browse services

### POST /findone

Description : Find a service through bonjour.

Format : `multipart/form-data`

Data:
```
  if( 'type' in req.body)     opt.type = req.body.type
  if( 'subtypes' in req.body) opt.type = req.body.subtypes
  if( 'protocol' in req.body) opt.type = req.body.protocol
```
Response:
```
{
  addresses: [],
   name: 'whateverelse',
   fqdn: 'whateverelse._someother._tcp.local',
   host: 'linux.local',
   port: 8091,
   type: 'someother',
   protocol: 'tcp',
   subtypes: [],
   rawTxt: { type: 'Buffer', data: [0] },
   txt: {}
}
```

# Binary

## Usage

```
bonjour-over-http 1.0.0
  Http server to find / announce bonjour services

Usage
  bonjour-over-http --config=/path/to/config.json

Options
  --config  | -c   Path to the JSON configuration file
  --verbose | -v   Enable verbosity pass in the module list to debug.

Config
  The configuration is a plain json object describing several options to
  apply to your instance of bonjour-over-http.

  {
    "ssl": {
      "port": "a number, or null for a random port",
      "host": "a host value to listen for https requests",
      "key": "a path to an SSL key",
      "ca": "a path to the SSL CA file",
      "cert": "a path to the SSL cert file",
    },
    "clear": {
      "port": "a number, or null for a random port",
      "host": "a host value to listen for http requests",
    }
  }
```

# Read more

- https://github.com/watson/bonjour
- http://expressjs.com/en/api.html
