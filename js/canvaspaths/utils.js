/**
 * Miscellaneous utilities that should be available everywhere.
 */

Math.hypot = Math.hypot || function() {
        var y = 0;
        var length = arguments.length;

        for (var i = 0; i < length; i++) {
            if (arguments[i] === Infinity || arguments[i] === -Infinity) {
                return Infinity;
            }
            y += arguments[i] * arguments[i];
        }
        return Math.sqrt(y);
    };


getKeyByValue = function( value, object ) {
    for( var prop in object ) {
        if( object.hasOwnProperty( prop ) ) {
            if( object[ prop ] === value )
                return prop;
        }
    }
};