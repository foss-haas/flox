'use strict';
require('core-js');
import expect from 'expect.js';
import rewire from 'rewire';
import sinon from 'sinon';
import {describe, it, after} from 'mocha';
var createAsyncActions = rewire('../src/create-async-actions');

describe('createAsyncActions', function () {
  after(function () {
    createAsyncActions.__set__('aaxn', require('axn').async);
  });
  it('is a function', function () {
    expect(createAsyncActions).to.be.a('function');
  });
  it('returns an object', function () {
    expect(createAsyncActions([])).to.be.an('object');
    expect(createAsyncActions({})).to.be.an('object');
  });
  describe('when called with an array of strings', function () {
    it('returns an action for each string', function () {
      var returnValue = 'hi';
      var spy = sinon.stub().returns(returnValue);
      var names = ['hello', 'world', 'sup'];
      createAsyncActions.__set__('aaxn', spy);

      var actions = createAsyncActions(names);
      expect(Object.keys(actions)).to.eql(names);
      expect(spy.callCount).to.equal(3);
      names.forEach(function (name) {
        expect(actions[name]).to.equal(returnValue);
      });
    });
  });
  describe('when called with an object', function () {
    it('returns an action for each key', function () {
      var returnValue = 'hi';
      var spy = sinon.stub().returns(returnValue);
      var inputs = {a: 'x', b: 'y', c: 'z'};
      createAsyncActions.__set__('aaxn', spy);
      var actions = createAsyncActions(inputs);
      expect(Object.keys(actions).sort()).to.eql(Object.keys(inputs).sort());
      expect(spy.callCount).to.equal(3);
      Object.keys(inputs).forEach(function (name) {
        expect(actions[name]).to.equal(returnValue);
      });
    });
    it('passes each value as the action spec', function () {
      var spy = sinon.stub();
      spy.withArgs('x').returns('foo');
      spy.withArgs('y').returns('bar');
      spy.withArgs('z').returns('qux');
      var inputs = {a: 'x', b: 'y', c: 'z'};
      createAsyncActions.__set__('aaxn', spy);
      var actions = createAsyncActions(inputs);
      expect(actions).to.eql({a: 'foo', b: 'bar', c: 'qux'});
    });
  });
});
