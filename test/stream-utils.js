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
		it( 'is duplex stream', function ( done ) {
			var mapper = function ( data, callback ) {
				callback();
			};
			spec( stream.mapStream( mapper ) )
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
} );
