'use strict';

const {test} = require('tap');
const findAllBetween = require('.');

test('unist-util-find-all-between', test => {
	test.throws(() => {
		findAllBetween();
	}, 'Should fail without parent node');

	test.throws(() => {
		findAllBetween({type: 'foo'});
	}, 'Should fail without parent node');

	test.doesNotThrow(() => {
		test.throws(() => {
			findAllBetween({type: 'foo', children: []});
		}, 'Expected positive finite index or child node');

		test.throws(() => {
			findAllBetween({type: 'foo', children: []}, -1);
		}, 'Expected positive finite index or child node');

		test.throws(() => {
			findAllBetween({type: 'foo', children: []}, {type: 'bar'});
		}, 'Expected positive finite index or child node');

		test.throws(() => {
			findAllBetween({type: 'foo', children: []}, 1, {type: 'bar'});
		}, 'Expected positive finite index or child node');
	}, 'Should fail without index');

	test.doesNotThrow(() => {
		test.deepEqual(
			findAllBetween({
				type: 'foo',
				children: [{
					type: 'foo'
				}, {
					type: 'bar'
				}]
			}, 0, 1, false),
			[]
		);
	}, 'Should not throw with `unist-util-is` >= 4.0.0');

	test.doesNotThrow(() => {
		test.deepEqual(
			findAllBetween({
				type: 'foo',
				children: [{
					type: 'foo'
				}, {
					type: 'bar'
				}, {
					type: 'baz'
				}]
			}, 0, 2),
			[{type: 'bar'}]
		);

		test.deepEqual(
			findAllBetween({
				type: 'foo',
				children: [{
					type: 'bar'
				}, {
					type: 'baz'
				}]
			}, 0, 2),
			[]
		);
	}, 'Should support no test');

	test.doesNotThrow(() => {
		test.deepEqual(
			findAllBetween({
				type: 'foo',
				children: [{
					type: 'foo'
				}, {
					type: 'bar'
				}, {
					type: 'baz'
				}]
			}, 0, 2, 'bar'),
			[{type: 'bar'}]
		);

		test.deepEqual(
			findAllBetween({
				type: 'foo',
				children: [{
					type: 'foo'
				}, {
					type: 'bar'
				}, {
					type: 'baz'
				}]
			}, 0, 2, 'baz'),
			[]
		);
	}, 'Should support `string` test');

	test.doesNotThrow(() => {
		test.deepEqual(
			findAllBetween({
				type: 'foo',
				children: [{
					type: 'foo'
				}, {
					type: 'bar'
				}, {
					type: 'baz'
				}]
			}, 0, 2, node => {
				return node.type === 'bar';
			}),
			[{type: 'bar'}]
		);

		test.deepEqual(
			findAllBetween({
				type: 'foo',
				children: [{
					type: 'foo'
				}, {
					type: 'bar'
				}, {
					type: 'baz'
				}]
			}, 0, 2, node => {
				return node.type === 'baz';
			}),
			[]
		);
	}, 'Should support `function` test');

	test.doesNotThrow(() => {
		test.deepEqual(
			findAllBetween({
				type: 'foo',
				children: [{
					type: 'foo'
				}, {
					type: 'bar'
				}, {
					type: 'baz'
				}]
			}, 0, 2, {type: 'bar'}),
			[{type: 'bar'}]
		);

		test.deepEqual(
			findAllBetween({
				type: 'foo',
				children: [{
					type: 'foo'
				}, {
					type: 'bar'
				}, {
					type: 'baz'
				}]
			}, 0, 2, {type: 'baz'}),
			[]
		);
	}, 'Should support `object` test');

	test.doesNotThrow(() => {
		test.deepEqual(
			findAllBetween({
				type: 'foo',
				children: [{
					type: 'foo'
				}, {
					type: 'bar'
				}, {
					type: 'baz'
				}]
			}, {type: 'foo'}, 2, 'bar'),
			[{type: 'bar'}]
		);

		test.deepEqual(
			findAllBetween({
				type: 'foo',
				children: [{
					type: 'foo'
				}, {
					type: 'bar'
				}, {
					type: 'baz'
				}]
			}, 0, {type: 'baz'}, 'bar'),
			[{type: 'bar'}]
		);

		test.deepEqual(
			findAllBetween({
				type: 'foo',
				children: [{
					type: 'foo'
				}, {
					type: 'bar'
				}, {
					type: 'baz'
				}]
			}, {type: 'foo'}, 2, {type: 'bar', value: 'baz'}),
			[]
		);
	}, 'Should support `node` as `start` and/or `end`.');

	test.end();
});
