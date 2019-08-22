# ccurl - 'couchdb curl'

If you use CouchDB, then you can access everything using curl. The trouble is that it if you are using an authenticated, hosted service such as Cloudant's, then your credentials appear on your command-line history and there is a lot of typing. e.g.

```sh
  curl 'https://mypassword:MyPAssw0rd@myhost.cloudant.com/database/12345678'
```

With *ccurl*, this becomes:

```sh
  ccurl /database/12345678
```

Or adding a document with curl:

```sh
  curl -X POST -H 'Content-type:application/json' -d'{"a":1,"b":2}' 'https://mypassword:MyPAssw0rd@myhost.cloudant.com/database' 
```

With *ccurl*, this becomes:

```sh
  ccurl -X POST -d'{"a":1,"b":2}' /database 
```

## Installing

*ccurl* requires Node.js (and npm). Simply type:

```sh
  npm install -g ccurl
```

## Storing your credentials

Your CouchDB credentials are taken from an environment variable "COUCH_URL". This can be set in your console with

```sh
  export COUCH_URL="https://mypassword:MyPAssw0rd@myhost.cloudant.com"
```

or this line can be added to your "~/.bashrc" or "~/.bash_profile" file.

If you don't want credentials stored in your command-line history, you can set an environment variable by extracting the credentials from a file e.g.

```sh
export COUCH_URL=`cat ~/.ibm/cloudant.json | jq -r .url`
```

where `~/.ibm/cloudant.json` is a JSON file that is readable only by my user containing the Cloudant service credentials.

## Using IBM IAM Authentication

If you prefer to use IBM's IAM authentication for a Cloudant service set up two environment variables:

- `COUCH_URL` - the URL of your Cloudant service e.g. `https://myurl.cloudant.com` (note the absence of authentication credentials).
- `IAM_API_KEY` - the IBM IAM API key that identifies you.

`ccurl` exchanges your API key for a "bearer token" which is automatically inserted into the request. `ccurl` keeps a cache of the bearer token for subsequent requests. It's stored in `~/.ccurl`. 

## Using ccurl

* all command-line switches are passed through to curl
* instead of passing through a full url, pass through a relative url
* if the url is omitted, then a relative url of "/" is assumed
* the content-type of 'application-json' is added for you if you don't already provide a content type

## Examples

### Add a database

```sh
  > ccurl -X PUT /newdatabase
  {"ok":true}
```  

### Add a document

```sh
  > ccurl -X POST -d'{"a":1,"b":2}' /newdatabase 
  {"ok":true,"id":"005fa466b4f690ccad7b4d194f071bbe","rev":"1-25f9b97d75a648d1fcd23f0a73d2776e"}
```

### Get a document

```sh
  > ccurl /newdatabase/005fa466b4f690ccad7b4d194f071bbe
  {"_id":"005fa466b4f690ccad7b4d194f071bbe","_rev":"1-25f9b97d75a648d1fcd23f0a73d2776e","a":1,"b":2}
```

### Get ten documents

```sh
  > ccurl '/newdatabase/_all_docs?limit=10&include_docs=true' 
  {"total_rows":1,"offset":0,"rows":[{"id":"005fa466b4f690ccad7b4d194f071bbe","key":"005fa466b4f690ccad7b4d194f071bbe","value":{"rev":"1-25f9b97d75a648d1fcd23f0a73d2776e"},"doc":{"_id":"005fa466b4f690ccad7b4d194f071bbe","_rev":"1-25f9b97d75a648d1fcd23f0a73d2776e","a":1,"b":2}}]}
```

### Remove a database

```sh
  > ccurl -X DELETE /newdatabase
  {"ok":true}
```  

### Other curl command-line parameters work too

```sh
  ccurl -h
  ccurl -v
  etc. 
```

## Using ccurl with jq

[jq](http://stedolan.github.io/jq/) is a command-line json utility, and as ccurl returns JSON, it can be piped in-line to colour the JSON:

```sh
 ccurl '/newdatabase/_all_docs?limit=10&include_docs=true' | jq '.total_rows'
```

or to process or select the data:

```sh
 ccurl '/newdatabase/_all_docs?limit=10&include_docs=true' | jq '.'
```


