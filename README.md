# bonjour-over-http
Http server to find / announce bonjour services.

It provides an API and a binary to install.

# API

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
