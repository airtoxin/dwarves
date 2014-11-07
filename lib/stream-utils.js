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
				emit();
			};
			return r;
		}
	};
}() );

exports = module.exports = streamUtils;
