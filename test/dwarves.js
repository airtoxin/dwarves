var assert = require( 'assert' ),
	_      = require( 'lodash' ),
	spec   = require( 'stream-spec' ),
	stream = require( '../' );

describe( 'dwarves', function () {
	describe( 'toStream', function () {
		it( 'is readable stream', function ( done ) {
			var arr = [ 'start', 1, 2, 3, 4, 5, 'end' ];
			spec( stream.toStream( arr ) )
				.readable()
				.pausable( { strict: true } )
				.validateOnExit();
			done();
		} );

		it( 'streams each data of array', function ( done ) {
			var arr = [ 'start', 1, 2, 3, 4, 5, 'end' ];
			var s = stream.toStream( arr );
			_.each( arr, function ( data ) {
				assert.equal( s.read(), data );
			} );
			done();
		} );

		it( 'end', function ( done ) {
			var arr = [ 'start', 1, 2, 3, 4, 5, 'end' ];
			var s = stream.toStream( arr );
			s.on( 'data', function(){} ).on( 'end', done );
		} )
	} );

	describe( 'mapStream', function () {
		it( 'is transform stream', function ( done ) {
			var mapper = function ( data, callback ) { callback(); };
			var m = stream.mapStream( mapper );
			assert.ok( _.has( m, '_transform' ) );
			spec( m )
				.duplex( { strict: true } )
				.validateOnExit();
			done();
		} );

		it( 'calls finish event on all data processed', function ( done ) {
			var arr = _.range(1000);
			var s = stream.toStream( arr );
			var mapper = function ( data, callback ) { return callback(); };
			var m = stream.mapStream( mapper );
			s.pipe( m ).on( 'finish', function () {
				done();
			} );
		} )

		it( 'processes data uning mapper callback', function ( done ) {
			var processed = [];
			var mapper = function ( data, callback ) {
				processed.push( data );
				callback();
			};
			var arr = _.range(1000);
			var s = stream.toStream( arr );

			var m = stream.mapStream( mapper );
			s.pipe( m ).on( 'finish', function () {
				assert.deepEqual( processed, arr );
				done();
			} );
		} );
	} );

	describe( 'reduceStream', function () {
		it( 'is transform stream', function ( done ) {
			var reducer = function ( data, callback ) { callback(); };
			var r = stream.reduceStream( null, reducer );
			assert.ok( _.has( r, '_transform' ) );
			spec( r )
				.duplex( { strict: true } )
				.validateOnExit();
			done();
		} );

		it( 'calls finish event on all data processed', function ( done ) {
			var arr = _.range(1000);
			var s = stream.toStream( arr );
			var reducer = function ( accum, data, callback ) { callback(); };
			var r = stream.reduceStream( null, reducer );
			s.pipe( r ).on( 'finish', function () {
				done();
			} );
		} );

		it( 'processes data uning reducer callback', function ( done ) {
			var processed = [];
			var reducer = function ( accum, data, callback ) {
				processed.push( data );
				callback();
			};
			var arr = _.range(1000);
			var s = stream.toStream( arr );

			var r = stream.reduceStream( null, reducer );
			s.pipe( r ).on( 'finish', function () {
				assert.deepEqual( processed, arr );
				done();
			} );
		} );

		it( 'initializer assign to accum first', function ( done ) {
			var initializer = 'this is initial';
			var reducer = function ( accum, data, callback ) {
				assert.equal( accum, initializer );
				done();
			};
			var arr = _.range(1000);
			var s = stream.toStream( arr );

			var r = stream.reduceStream( initializer, reducer );
			s.pipe( r );
		} );

		it( 'accum gets reduced data', function ( done ) {
			var initializer = 0;
			var reducer = function ( accum, data, callback ) {
				accum += data;
				callback( accum );
			};
			var arr = _.range(1000);
			var s = stream.toStream( arr );

			var r = stream.reduceStream( initializer, reducer );
			s.pipe( r ).on( 'data', function ( data ) {
				assert.equal( data, _.reduce( arr, function ( sum, num ) { return sum + num; } ) );
				done();
			} );
		} );
	} );

	describe( 'sampleStream', function () {
		it( 'is transform stream', function ( done ) {
			var s = stream.sampleStream();
			assert.ok( _.has( s, '_transform' ) );
			spec( s )
				.duplex( { strict: true } )
				.validateOnExit();
			done();
		} );

		it( 'calls finish event on all data processed', function ( done ) {
			var d = stream.toStream( _.range( 1000 ) );
			var s = stream.sampleStream();
			d.pipe( s ).on( 'finish', function () {
				done();
			} );
		} );

		it( 'samples data per batchSize', function ( done ) {
			var batchSize = 30;
			var dataSize = 1000;
			var sampleSize = Math.ceil( dataSize / batchSize );
			var d = stream.toStream( _.range( dataSize ) );
			var s = stream.sampleStream( batchSize );
			var processed = [];
			d.pipe( s ).on( 'data', function ( data ) {
				processed.push( data );
			} ).on( 'finish', function () {
				assert.equal( processed.length, sampleSize );
				done();
			} );
		} );

		it( 'default batchSize is 10', function ( done ) {
			var batchSize = 10;
			var dataSize = 1000;
			var sampleSize = Math.ceil( dataSize / batchSize );
			var d = stream.toStream( _.range( dataSize ) );
			var s = stream.sampleStream();
			var processed = [];
			d.pipe( s ).on( 'data', function ( data ) {
				processed.push( data );
			} ).on( 'finish', function () {
				assert.equal( processed.length, sampleSize );
				done();
			} );
		} );
	} );

	describe( 'groupByStream', function () {
		it( 'is transform stream', function ( done ) {
			var shuffler = function ( data, callback ) { callback( 'a' ); };
			var g = stream.groupByStream( null, null, shuffler );
			assert.ok( _.has( g, '_transform' ) );
			spec( g )
				.duplex( { strict: true } )
				.validateOnExit();
			done();
		} );

		it( 'calls finish event on all data processed', function ( done ) {
			var arr = _.range(1000);
			var s = stream.toStream( arr );
			var shuffler = function ( data, callback ) { callback( 'a' ); };
			var g = stream.groupByStream( null, null, shuffler );
			s.pipe( g ).on( 'finish', function () {
				done();
			} );
		} );

		it( 'processes data uning shuffler callback', function ( done ) {
			var arr = _.range(1000);
			var s = stream.toStream( arr );
			var shuffler = function ( data, callback ) { callback( 'a' ); };
			var g = stream.groupByStream( 'obj-key', 'obj-value', shuffler );

			s.pipe( g ).on( 'data', function ( data ) {
				assert.deepEqual( data, { 'obj-key': 'a', 'obj-value': arr } );
				done();
			} );
		} );

		it( 'default key is k', function ( done ) {
			var arr = _.range(1000);
			var s = stream.toStream( arr );
			var shuffler = function ( data, callback ) { callback( 'a' ); };
			var g = stream.groupByStream( null, 'obj-value', shuffler );

			s.pipe( g ).on( 'data', function ( data ) {
				assert.deepEqual( data, { 'k': 'a', 'obj-value': arr } );
				done();
			} );
		} );

		it( 'default value is v', function ( done ) {
			var arr = _.range(1000);
			var s = stream.toStream( arr );
			var shuffler = function ( data, callback ) { callback( 'a' ); };
			var g = stream.groupByStream( 'obj-key', null, shuffler );

			s.pipe( g ).on( 'data', function ( data ) {
				assert.deepEqual( data, { 'obj-key': 'a', 'v': arr } );
				done();
			} );
		} );
	} );
} );
