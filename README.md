# oneone
[![Build
Status](https://secure.travis-ci.org/cainus/oneone.png?branch=master)](http://travis-ci.org/cainus/oneone)

oneone is an http server library for node.js that aims to more completely support http 1.1  

It has only a few simple goals:
* make basic RFC2616 features as easy as possible.
* don't alter core node classes where possible (esp. request and response
  objects)
* handle routing
* make extension possible and easy

It should be possible to use oneone as the basis of a framework.  

## Automated Tests:
npm test
