var assert = require( 'assert' ),
	_      = require( 'lodash' ),
	spec   = require( 'stream-spec' ),
	stream = require( '../' );

describe( 'stream-utils', function () {
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
			var reducer = function ( accum, data, callback ) { callback(); };
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
} );
