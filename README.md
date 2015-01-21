[![Express Logo](https://i.cloudup.com/zfY6lL7eFa-3000x3000.png)](http://expressjs.com/)

  [Express'](https://github.com/strongloop/express) application generator.

  [![NPM Version](https://img.shields.io/npm/v/express-generator.svg?style=flat)](https://www.npmjs.org/package/express-generator)
  [![NPM Downloads](https://img.shields.io/npm/dm/express-generator.svg?style=flat)](https://www.npmjs.org/package/express-generator)
  [![Build Status](https://img.shields.io/travis/expressjs/generator.svg?style=flat)](https://travis-ci.org/expressjs/generator)
  [![Gittip](https://img.shields.io/gittip/dougwilson.svg?style=flat)](https://www.gittip.com/dougwilson/)

## Quick Start

  The quickest way to get started with express is to utilize the executable `express(1)` to generate an application as shown below:

  Create the app:

```bash
$ npm install -g express-generator
$ express /tmp/foo && cd /tmp/foo
```

  Install dependencies:

```bash
$ npm install
```

  Rock and Roll

```bash
$ npm start
```

## Command Line Options 
This generator can also be further configured with the following command line flags.

    -h, --help          output usage information
    -V, --version       output the version number
    -e, --ejs           add ejs engine support (defaults to jade)
        --hbs           add handlebars engine support
    -H, --hogan         add hogan.js engine support
    -c, --css <engine>  add stylesheet <engine> support (less|stylus|compass) (defaults to plain css)
        --git           add .gitignore
    -f, --force         force on non-empty directory


### [License (MIT)](LICENSE)
