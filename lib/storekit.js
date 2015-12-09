'use strict';
var tough = require('tough-cookie');
var Store = tough.MemoryCookieStore;
var util = require('util');
var fs = require('fs');

function StoreKit(filePath) {
    Store.call(this);
    this.idx = {}; // idx is memory cache
    this.filePath = filePath;
    var self = this;
    loadFromFile(this.filePath, function(dataJson) {
        if (dataJson)
            self.idx = dataJson;
    })
}
util.inherits(StoreKit, Store);
exports.StoreKit = StoreKit;

StoreKit.prototype.idx = null;
StoreKit.prototype.synchronous = true;

// force a default depth:
StoreKit.prototype.inspect = function() {
    return "{ idx: " + util.inspect(this.idx, false, 2) + ' }';
};

StoreKit.prototype.putCookie = function(cookie, cb) {
    if (!this.idx[cookie.domain]) {
        this.idx[cookie.domain] = {};
    }
    if (!this.idx[cookie.domain][cookie.path]) {
        this.idx[cookie.domain][cookie.path] = {};
    }
    this.idx[cookie.domain][cookie.path][cookie.key] = cookie;
    saveToFile(this.filePath, this.idx, function() {
        cb(null);
    });
};

StoreKit.prototype.updateCookie = function(oldCookie, newCookie, cb) {
    // updateCookie() may avoid updating cookies that are identical.  For example,
    // lastAccessed may not be important to some stores and an equality
    // comparison could exclude that field.
    this.putCookie(newCookie, cb);
};

StoreKit.prototype.removeCookie = function(domain, path, key, cb) {
    if (this.idx[domain] && this.idx[domain][path] && this.idx[domain][path][key]) {
        delete this.idx[domain][path][key];
    }
    saveToFile(this.filePath, this.idx, function() {
        cb(null);
    });
};

StoreKit.prototype.removeCookies = function(domain, path, cb) {
    if (this.idx[domain]) {
        if (path) {
            delete this.idx[domain][path];
        } else {
            delete this.idx[domain];
        }
    }
    saveToFile(this.filePath, this.idx, function() {
        return cb(null);
    });
};

StoreKit.prototype.checkExpired = function(domain, path, key) {
    var domains = []
    if (domain) domains = [domain]
    else domains = Object.keys(this.idx)
    var isExpired = false
    var that = this
    domains.forEach(function(d) {
        var paths = []
        if (path) paths = [path]
        else paths = Object.keys(that.idx[d])
        paths.forEach(function(p) {
            var keys = []
            if (key) keys = [key]
            else keys = Object.keys(that.idx[d][p])
            keys.forEach(function(k) {
                var expiresDate = that.idx[d][p][k].expires
                var now = new Date()
                if (isFinite(expiresDate)) {
                    if (expiresDate - now < 30 * 60)
                        isExpired = true
                }
            })
        })
    })
    return isExpired
}

StoreKit.prototype.isExpired = function() {
    return this.checkExpired(null, null, null)
}

function saveToFile(filePath, data, cb) {
    var dataJson = JSON.stringify(data);
    fs.writeFileSync(filePath, dataJson)
    cb();
}

function loadFromFile(filePath, cb) {
    var data = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
    var dataJson = data ? JSON.parse(data) : null;
    for (var domainName in dataJson) {
        for (var pathName in dataJson[domainName]) {
            for (var cookieName in dataJson[domainName][pathName]) {
                dataJson[domainName][pathName][cookieName] = tough.fromJSON(JSON.stringify(dataJson[domainName][pathName][cookieName]));
            }
        }
    }
    cb(dataJson);
}
