/*jshint node: true */
/*global describe, it, afterEach */
'use strict';
var expect = require('expect.js');
var immutable = require('immutable');
var createStore = require('../').createStore;
var invoke = function (fn) {return fn();};

expect.Assertion.prototype.value = function (obj) {
  var i = expect.stringify;
  this.assert(
    immutable.is(this.obj, obj),
    function () {return 'expected ' + i(this.obj) + ' to have value ' + i(obj);},
    function () {return 'expected ' + i(this.obj) + ' not to have value ' + i(obj);}
  );
};

describe('createStore', function () {
  it('is a function', function () {
    expect(createStore).to.be.a('function');
  });
  it('returns a function', function () {
    expect(createStore()).to.be.a('function');
  });
  it('stores the emptyValue', function () {
    var emptyValue = immutable.Map({o: 'hi'});
    expect(emptyValue.get('o')).to.equal('hi');
    var store = createStore(emptyValue);
    expect(store()).to.have.value(emptyValue);
  });
  describe('when written to', function () {
    var listeners = [];
    function listen(listenable, listener) {
      var cb = listenable.listen(listener);
      listeners.push(cb);
      return cb;
    }
    afterEach(function () {
      listeners.splice(0).forEach(invoke);
    });
    it('applies the prepare function', function () {
      var value1 = {hello: 'world'};
      var value2 = {foo: 'bar'};
      function prepare(input) {
        expect(input).to.equal(value1);
        prepare.called = true;
        return value2;
      }
      var store = createStore(immutable.Map.empty(), prepare);
      store(value1);
      expect(prepare.called).to.equal(true);
      expect(store()).to.have.value(immutable.Map(value2));
    });
    it('notifies listeners', function (done) {
      var store = createStore(immutable.Map.empty());
      listen(store, function () {
        done();
      });
      store({});
    });
    it('does not notify listeners removed by unlisten', function () {
      var store = createStore(immutable.Map.empty());
      var fn = function () {
        expect().fail();
      };
      store.listen(fn);
      store.unlisten(fn);
      store({});
    });
    it('does not notify listeners removed by callback', function () {
      var store = createStore(immutable.Map.empty());
      var cb = store.listen(function () {
        expect().fail();
      });
      cb();
      store({});
    });
    it('invokes listeners in the correct order', function (done) {
      var called = false;
      var store = createStore(immutable.Map.empty());
      listen(store, function () {
        called = true;
      });
      listen(store, function () {
        expect(called).to.equal(true);
        done();
      });
      store({});
    });
    it('passes the new value to its listeners', function (done) {
      var value = {hello: 'world'};
      var store = createStore(immutable.Map.empty());
      listen(store, function (input) {
        expect(input).to.have.value(immutable.Map(value));
        done();
      });
      store(value);
    });
  });
  describe('isEmpty', function () {
    it('returns true if the store is empty', function () {
      var emptyValue = immutable.Map({hello: 'world'});
      var store = createStore(emptyValue);
      expect(store.isEmpty()).to.be(true);
    });
    it('returns true if the store contains the emptyValue', function () {
      var emptyValue = immutable.Map({hello: 'world'});
      var store = createStore(emptyValue);
      store({});
      store(emptyValue);
      expect(store.isEmpty()).to.be(true);
    });
    it('returns false if the store contains any other value', function () {
      var emptyValue = immutable.Map({hello: 'world'});
      var store = createStore(emptyValue);
      store({});
      expect(store.isEmpty()).to.be(false);
    });
  });
});