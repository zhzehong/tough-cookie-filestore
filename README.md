# Describe

tough-cookie-kit is a toolkit for tough-cookie module. Now only the store feature can be used.

## installation

	$ npm install tough-cookie-kit

## Usage

	var FileCookieStore = require("tough-cookie-kit");
	var CookieJar = require("tough-cookie").CookieJar;

	var jar = new CookieJar(new FileCookieStore("./cookie.json"));

## License

 MIT
