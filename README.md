# Describe

tough-cookie-kit is a toolkit for tough-cookie module. 

## installation

	$ npm install tough-cookie-kit

## Usage

You can use it to initialize a cookieJar.

	var cookiekit = require("tough-cookie-kit");
	var CookieJar = require("tough-cookie").CookieJar;

	var jar = new CookieJar(new cookiekit("./cookie.json"));

Now, it has another feature to check whether the cookies is expired

	var cookiekit = require("tough-cookie-kit");
	var cookiekitInstance = new cookiekit("./cookie.json")
	cookiekitInstance.isExpired()	// will return True if the cookies is expired

	

## License

 MIT
