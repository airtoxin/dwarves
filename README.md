dwarves
============

util streams for Node.js
Supports node v0.10

[![Build Status](https://travis-ci.org/airtoxin/dwarves.svg?branch=master)](https://travis-ci.org/airtoxin/dwarves)
[![Coverage Status](https://img.shields.io/coveralls/airtoxin/dwarves.svg)](https://coveralls.io/r/airtoxin/dwarves?branch=master)
[![Dependency Status](https://gemnasium.com/airtoxin/dwarves.svg)](https://gemnasium.com/airtoxin/dwarves)
[![Code Climate](https://codeclimate.com/github/airtoxin/dwarves/badges/gpa.svg)](https://codeclimate.com/github/airtoxin/dwarves)

##Streams

###dwarves.toStream( array )
Creates readable data stream from array.

####Arguments
1. array(Array): The array to stream

####Example

```javascript
dwarves.toStream( [ 'a', 'b', 'c' ] )
	.on( 'data', function ( d ) { console.log( d ); } );
// -> a
// -> b
// -> c
```

###dwarves.mapStream( mapper )
Creates transform stream which applies mapper function to data.

####Arguments
1. mapper(Function): The function called per streaming data to transform and emit processed data.

#####mapper( data, callback ) arguments
1. data(*): A streaming data.
2. callback(Function): The function called with emitting data to the next streams.

####Example

```javascript
var mapper = function ( data, callback ) {
	callback( data * data );
};
dwarves.toStream( [ 1, 2, 3 ] )
	.pipe( dwarves.mapStream( mapper ) )
	.on( 'data', function ( d ) { console.log( d ); } );
// -> 1
// -> 4
// -> 9
```

###dwarves.reduceStream( initializer, reducer )
Creates transform stream which applies reducer function to aggregate if all data of previous stream have been gotten.

####Arguments
1. initializer(*): Initial value of accum.
2. reducer(Function): The function called to reduce data.

#####reducer( accum, data, callback ) arguments
1. accum(*): An accumlator used to memoize data.
2. data(*): A streaming data.
3. callback(Function): The function called with emitting data to the next streams.

####Example

```javascript
var reducer = function ( accum, data, callback ) {
	callback( accum + data );
};
dwarves.toStream( [ 1, 2, 3, 4, 5 ] )
	.pipe( dwarves.reduceStream( 0, reducer ) )
	.on( 'data', function ( d ) { console.log( d ); } );
// -> 15
```

###dwarves.sampleStream( batchSize )
Creates transform stream which retrieves a random data from stream per batchSize.

####Arguments
1. batchSize(Integer): The number of data pool size.

####Example

```javascript
dwarves.toStream( [ 1, 2, 3, 4, 5 ] )
	.pipe( dwarves.sampleStream( 3 ) )
	.on( 'data', function ( d ) { console.log( d ); } );
// -> 3
// -> 4
```

###dwarves.shuffleStream( batchSize )
Creates transform stream which changes order of streaming data per batchSize.

####Arguments
1. batchSize(Integer): The number of data pool size.

####Example

```javascript
dwarves.toStream( [ 1, 2, 3, 4, 5 ] )
	.pipe( dwarves.shuffleStream( 3 ) )
	.on( 'data', function ( d ) { console.log( d ); } );
// -> 1
// -> 3
// -> 2
// -> 5
// -> 4
```

###dwarves.groupByStream( keyName, valueName, shuffler )
Creates transform object stream which composed of keys generated from the shuffler callback.

####Arguments
1. keyName(String): The key name of grouping key of transformed object stream.
2. valueName(String): The key name of grouped values of transformed object stream.
3. shuffler(Function): The function called to resolving grouping key name.

#####shuffler( data, callback ) arguments
1. data(*): A streaming data
2. callback(Function): The function called with key name of this data.

####Example

```javascript
var shuffler = function ( data, callback ) {
	callback( data[ 0 ] );
};
dwarves.toStream( [ 'a', 'ab', 'bb', 'bc' ] )
	.pipe( dwarves.groupByStream( 'k', 'v', shuffler ) )
	.on( 'data', function ( d ) { console.log( d ); } );
// -> { k: 'a', v: [ 'a', 'ab' ] }
// -> { k: 'b', v: [ 'bb', 'bc' ] }
```
