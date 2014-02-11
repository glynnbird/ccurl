# ccurl

If you use CouchDB, then you can access everything using curl. The trouble is, that it if you are using an authenticated, hosted service such as Cloudant's, then your credentials appear on your command-line history and there is a lot of typing. e.g.

```
  curl 'https://mypassword:MyPAssw0rd@myhost.cloudant.com/datbase/12345678'
```

With ccurl, this becomes:

```
  ccurl '/datbase/12345678'
```


## Installing

ccurl required Node.js (and npm). Simply type:

```
  npm install -g ccurl
```

You may need to prepend 'sudo' to this.

## Storing your credentials

Your CouchDB credentials are taken from an environment variable "COUCH_URL". This can be set in your console with

```
  export COUCH_URL="https://mypassword:MyPAssw0rd@myhost.cloudant.com"
```

or this line can be added to your "~/.bashrc" or "~/.bash_profile" file.

## Using ccurl

* all command-line switches are passed through to curl
* instead of passing through a full url, pass through a relative url
* if the url is omitted, then a relative url of "/" is assumed

## Examples

### Add a database

```
  > ccurl -X PUT /newdatabase
  {"ok":true}
```  

### Add a document

```
  > ccurl -X POST /newdatabase -d'{"a":1,"b":2}'
  {"ok":true,"id":"005fa466b4f690ccad7b4d194f071bbe","rev":"1-25f9b97d75a648d1fcd23f0a73d2776e"}
```

### Get a document

```
  > ccurl /newdatabase/005fa466b4f690ccad7b4d194f071bbe
  {"_id":"005fa466b4f690ccad7b4d194f071bbe","_rev":"1-25f9b97d75a648d1fcd23f0a73d2776e","a":1,"b":2}
```

### Get ten documents

```
  > ccurl '/newdatabase/_all_docs?limit=10&include_docs=true' {"total_rows":1,"offset":0,"rows":[{"id":"005fa466b4f690ccad7b4d194f071bbe","key":"005fa466b4f690ccad7b4d194f071bbe","value":{"rev":"1-25f9b97d75a648d1fcd23f0a73d2776e"},"doc":{"_id":"005fa466b4f690ccad7b4d194f071bbe","_rev":"1-25f9b97d75a648d1fcd23f0a73d2776e","a":1,"b":2}}]}
```

### Remove a database

```
  ccurl -X DELETE /newdatabase
  {"ok":true}
```  

