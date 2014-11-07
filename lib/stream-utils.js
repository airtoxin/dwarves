var stream = require( 'stream' ),
	_      = require( 'lodash' );

var streamUtils = ( function () {
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
		}
	};
}() );

exports = module.exports = streamUtils;
