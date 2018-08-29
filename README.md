protectedlib
========

## Environments

- node.js (>=8)
- all unix-like operating systems

## Usage

### Add your private packages to package.json
```json
"dependencies": {
  "myprotectedlib1": "git@github.com:r-berto811/myprotectedlib1.git#0.0.1"
}
```

### Create keys folder
Create a folder in the root of your project, that will contain all your ssh keys:
```console
  $ mkdir ssh
```

### Generate new ssh key
```console
  $ ssh-keygen -t rsa -b 4096 -C "email@example.com"
```

* Replace the email address with your real email address.
* When prompted with a location to save the generated keys, **don’t overwrite your existing SSH key!!!** Save your key to folder, created in prev step.
* It is best practice to call your generated key file as name of the package, for which it is generated
* Don’t add a passphrase to the key.

### GitHub/GitLab/Bitbucked
  
Set up your newly generated public key in your GitHub/GitLab/Bitbucked profile or in repository settings.

> It is recommended to grant **"read only"** rights, in order to protect your data

### Install library

```console
  $ npm install --save privalelib
```

### Set up your packages data

There are two ways to set you packages configuration data
1. Just create protected.json file in the root of your project:
```json
  {
    "keys_dir": "./ssh",
    "packages": {
      "myprotectedlib1": {
        "host": "github.com",
        "key_file": "myprotectedlib1"
      },
      "myprotectedlib2": {
        "host": "gitlab.com",
        "key_file": "myprotectedlib2"
      }
    }
  }
```
2. Set as options in init method:
```javascript
const protectedlib = require('protectedlib').init({
  keys_dir: './ssh',
  packages: {
    myprotectedlib1: {
      host: 'github.com',
      key_file: 'myprotectedlib1'
    },
    myprotectedlib2: {
      host: 'gitlab.com',
      key_file: 'myprotectedlib2'
    }
  }
})
```
```javascript
// or you can load from your custom file
const fs = require('fs')
const protectedlib = require('protectedlib').init(JSON.parse(fs.readFileSync('your/custom/file', 'utf-8')))
```
### Create preinstall and postinstall bin files
To make the keys automatically added and removed during installation, create preinstall and postinstall scripts

* `preinstall`
```javascript
  #!/usr/bin/env node

  // config will be loaded from protected.json
  const protectedlib = require('protectedlib').init()
  protectedlib.addKeys()
```

* `postinstall`
```javascript
  #!/usr/bin/env node

  // config will be loaded from protected.json
  const protectedlib = require('protectedlib').init()
  protectedlib.removeKeys()
```

### Add preinstall and postinstall commands to `package.json`

```json
  "scripts": {
    "preinstall": "node ./preinstal",
    "postinstall": "node ./postinstall"
  }
```

### Custom location of your system .ssh folder
By default you .ssh folder location is ` ~/.ssh`
If you want to add your custom location of .ssh folder, just create `.sshlocation` file in the root of your project with full path to your custom folder.
> Don't forget to add your `.sshlocation` to gitignore
