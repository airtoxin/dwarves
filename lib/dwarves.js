var stream = require( 'stream' ),
	_      = require( 'lodash' );

var Dwarves = ( function () {
	return {
		toStream: function ( array ) {
			var r = new stream.Readable( { objectMode: true } );
			r._read = function () {
				var emit = _.bind( this.push, this );
				_.each( array, function ( data ) {
					emit( data );
				} );
				emit( null );
			};
			return r;
		},

		mapStream: function ( mapper ) {
			var t = new stream.Transform( { objectMode: true } );
			t._transform = function ( data, encoding, done ) {
				var emit = _.bind( this.push, this );
				mapper( data, function ( processed ) {
					emit( processed );
					done();
				} );
			};
			return t;
		},

		reduceStream: function ( initializer, reducer ) {
			var accum = initializer;
			var t = new stream.Transform( { objectMode: true } );
			t._transform = function ( data, encoding, done ) {
				reducer( accum, data, function ( reduced ) {
					accum = reduced;
					done();
				} );
			};
			t._flush = function ( done ) {
				this.push( accum );
				done();
			};
			return t;
		},

		sampleStream: function ( batchSize ) {
			// default batchSize is 10
			if ( !_.isNumber( batchSize ) || batchSize <= 0 ) batchSize = 10;
			var pool = [];
			var t = new stream.Transform( { objectMode: true } );
			t._transform = function ( data, encoding, done ) {
				var emit = _.bind( this.push, this );
				pool.push( data );
				if ( pool.length < batchSize ) return done();
				emit( _.sample( pool ) );
				pool = [];
				done();
			};
			t._flush = function ( done ) {
				var emit = _.bind( this.push, this );
				emit( _.sample( pool ) );
				done();
			};
			return t;
		},

		shuffleStream: function ( batchSize ) {
			// default batchSize is 10
			if ( !_.isNumber( batchSize ) || batchSize <= 0 ) batchSize = 10;
			var pool = [];
			var t = new stream.Transform( { objectMode: true } );
			t._transform = function ( data, encoding, done ) {
				var emit = _.bind( this.push, this );
				pool.push( data );
				if ( pool.length < batchSize ) return done();
				_.each( _.shuffle( pool ), function ( d ) {
					emit( d );
				} );
				pool = [];
				done();
			};
			t._flush = function ( done ) {
				var emit = _.bind( this.push, this );
				_.each( _.shuffle( pool ), function ( d ) {
					emit( d );
				} );
				done();
			};
			return t;
		},

		groupByStream: function ( keyString, valueString, shuffler ) {
			if ( !_.isString( keyString ) )   keyString   = 'k';
			if ( !_.isString( valueString ) ) valueString = 'v';
			var hash = {};
			var t = new stream.Transform( { objectMode: true } );
			t._transform = function ( data, encoding, done ) {

				shuffler( data, function ( key ) {
					if ( _.has( hash, key ) ) {
						hash[ key ].push( data )
					} else {
						hash[ key ] = [ data ];
					}
					done();
				} );
			};
			t._flush = function ( done ) {
				var emit = _.bind( this.push, this );
				_.each( hash, function ( value, key ) {
					var o = {};
					o[ keyString ] = key;
					o[ valueString ] = value;
					emit( o );
				} );
				done();
			};
			return t;
		}
	};
}() );

exports = module.exports = Dwarves;
