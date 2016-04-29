/**
 * A Path here is a restricted version of a Path2D with only methods for
 * lines and arcs available. This is because I don't know how to generate
 * points on quadratic or cubic bezier curves, ellipses etc.
 * @constructor
 */
var Path = function() {
    this.segments = [];
    this._path2d = new Path2D();
    this.length = 0;
};


Path.prototype = {
    arc: function (x, y, radius, startAngle, endAngle, anticlockwise) {
        if (anticlockwise) {
            startAngle += Math.PI;
            endAngle += Math.PI;
        }

        this.segments.push(new PathSegment({
            type: "arc",
            args: {x: x, y: y, radius: radius, startAngle: startAngle, endAngle: endAngle, anticlockwise: anticlockwise}
        }));
        this._path2d.arc(x, y, radius, startAngle, endAngle, anticlockwise);
        this.updateLength();
    },

    lineTo: function (x, y) {
        var lastSeg = this.segments[this.segments.length - 1];
        this.segments.push(new PathSegment({
            type: "lineTo",
            args: {startX: lastSeg.endX, startY: lastSeg.endY, endX: x, endY: y}
        }));
        this._path2d.lineTo(x, y);
        this.updateLength();
    },

    moveTo: function (x, y) {
        this.segments.push(new PathSegment({
            type: "moveTo",
            args: {x: x, y: y}
        }));
        this._path2d.moveTo(x, y);
        this.updateLength();
    },

    /**
     * Delegate to the relevant segment in our path to find info like angle and
     * X, Y coords at a given point.
     * @param length The length along the path our point should be.
     * @param reverse Whether we're traversing this path in reverse.
     * @returns {*} x, y, angle: coords and the angle of the point at the given distance.
     */
    getInfoAtLength: function (length, reverse) {
        length = Math.max(length, 0);
        var lengthSoFar = 0;

        if (reverse) {
            0
        }

        // If we're traversing the path in reverse, the segments should be in
        // reverse order accordingly.
        var segments = Array.from(this.segments);
        if (reverse)
            segments.reverse();

        for (var i = 0; i < segments.length; i++) {
            var segment = segments[i];
            if (segment.length + lengthSoFar > length) break;
            else {
                lengthSoFar += segment.length;
            }
        }

        return segment.getInfoAtLength(length - lengthSoFar, reverse);
    },

    /**
     * Draw this path on the given context. We just do this by drawing each
     * component segment of this path.
     * @param context A Canvas 2D context to draw our path on.
     */
    draw: function (context) {
        context.stroke(this._path2d);
    },

    /**
     * Returns this path's total length by summing its component segments.
     */
    updateLength: function () {
        this.length = 0;
        for (var i = 0; i < this.segments.length; i++) {
            this.length += this.segments[i].length;
        }
    },

    /**
     * Does the work of finding the angle etc, but just returns the point: no angle.
     * @param length The distance along the path to travel.
     * @param reverse Whether we're travelling along the path in reverse.
     */
    getPointAtLength: function (length, reverse) {
        var info = this.getInfoAtLength(length, reverse);
        return {x: info.x, y: info.y};
    },

    /**
     * How far is a point along this path?
     * @param point
     * @param reverse
     */
    getLengthAtPoint: function (point, reverse) {
        var distanceTravelled = 0;
        var increment = 1;
        while (distance(point, this.getPointAtLength(distanceTravelled, reverse)) > increment) {
            distanceTravelled += increment;
        }
        return distanceTravelled;
    },

    /**
     * Returns the distance along the path between two points.
     * @param pointA
     * @param pointB
     * @returns {number}
     */
    getDistanceBetweenPoints: function (pointA, pointB) {
        return this.getLengthAtPoint(pointB) - this.getLengthAtPoint(pointA);
    },

    getAngleAtLength: function (distance) {
        return this.getInfoAtLength(distance).angle;
    },

    getOrientationAtLength: function (distance) {
        var angle = this.getAngleAtLength(distance);
        var angleMap = {
            "down": 0,
            "leftdown": Math.PI / 4,
            "left": Math.PI / 2,
            "leftup": 3 / Math.PI * 4,
            "up": Math.PI,
            "rightup": 5 * Math.PI / 4,
            "right": - Math.PI / 2,
            "rightdown": - Math.PI / 4
        };
        return getKeyByValue(angle, angleMap);
    }
};

getKeyByValue = function( value, object ) {
    for( var prop in object ) {
        if( object.hasOwnProperty( prop ) ) {
            if( object[ prop ] === value )
                return prop;
        }
    }
};