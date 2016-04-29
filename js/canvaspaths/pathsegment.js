/**
 * A PathSegment is a part of a larger Path. It loosely matches up with the
 * options for adding segments to Path2D objects, e.g. "arc" and "lineTo".
 *
 * The "options" parameter should have two keys:
 * - 'type' => "arc" | "lineTo" | "moveTo"; the type of path segment this
 *                                          will be.
 * - 'args' => The arguments passed to the Path2D equivalent method.
 *
 * @param options Information about the path segment. (more above)
 * @private
 * @constructor
 */
var PathSegment = function(options) {
    this.length = 0;
    this.type = options.type;
    switch(this.type) {
        case "arc": this.initArc(options.args); break;
        case "lineTo": this.initLineTo(options.args); break;
        case "moveTo": this.initMoveTo(options.args); break;
    }
};


PathSegment.prototype = {
    /**
     * Initialise this path segment as one created with the 'arc' method
     * on Path2D objects.
     * @param args The arguments passed to the arc method.
     * @private
     */
    initArc: function(args) {
        this.x = args.x;
        this.y = args.y;
        this.radius = args.radius;
        this.startAngle = args.startAngle;
        this.endAngle = args.endAngle;
        this.angleDelta = this.endAngle - this.startAngle;
        this.anticlockwise = args.anticlockwise;
        this.length = Math.abs(this.angleDelta * this.radius);

        var thisArc = this;

        /**
         * Return the X, Y coordinate of the point at `length` along this path.
         * @param length The distance along the path to travel.
         * @param reverse Whether to start at the end of the path.
         * @private
         */
        this.getPointAtLength = function(length, reverse) {
            var angle = thisArc.getAngleAtLength(length, reverse);
            return {
                x: thisArc.x + thisArc.radius * Math.cos(angle),
                y: thisArc.y + thisArc.radius * Math.sin(angle)
            }
        };

        /**
         * Return the angle at the point at `length` along this path.
         * @param length The distance along the path to travel.
         * @param reverse Whether to start at the end of the path.
         * @private
         */
        this.getAngleAtLength = function(length, reverse) {
            var fractionComplete = length / thisArc.length;
            if (reverse) return thisArc.endAngle - thisArc.angleDelta * fractionComplete;
            else return thisArc.startAngle + thisArc.angleDelta * fractionComplete;
        };


        var start = this.getPointAtLength(0);
        var end = this.getPointAtLength(this.length);
        this.startX = start.x; this.startY = start.y; this.endX = end.x; this.endY = end.y;
    },

    /**
     * Initialise this path segment as one created with the 'lineTo' method
     * on Path2D objects.
     * @param args The arguments passed to the lineTo method.
     * @private
     */
    initLineTo: function(args) {
        this.startX = args.startX;
        this.startY = args.startY;
        this.endX = args.endX;
        this.endY = args.endY;
        var xDelta = this.endX - this.startX;
        var yDelta = this.endY - this.startY;
        this.length = Math.hypot(xDelta, yDelta);
        var thisLine = this;

        this.getPointAtLength = function(length, reverse) {
            if (!reverse) {
                return {
                    x: this.startX + xDelta * length / thisLine.length,
                    y: this.startY + yDelta * length / thisLine.length
                }
            } else {
                return {
                    x: this.endX - xDelta * length / thisLine.length,
                    y: this.endY - yDelta * length / thisLine.length
                }
            }
        };

        this.getAngleAtLength = function(length, reverse) {
            var lineType;
            lineType = getLineType([
                [this.startX, this.startY],
                [this.endX, this.endY]
            ]);

            if (reverse) lineType = getLineType([
                [this.endX, this.endY],
                [this.startX, this.startY]
            ]);

            var angleMap = {
                "down": 0,
                "leftdown": Math.PI / 4,
                "left": Math.PI / 2,
                "leftup": 3 * Math.PI / 4,
                "up": Math.PI,
                "rightup": 5 * Math.PI / 4,
                "right": - Math.PI / 2,
                "rightdown": - Math.PI / 4
            };
            return angleMap[lineType];
        };

    },

    /**
     * Initialise this path segment as one created with the 'moveTo' method
     * on Path2D objects.
     * @param args The arguments passed to the moveTo method.
     * @private
     */
    initMoveTo: function(args) {
        this.endX = args.x;
        this.endY = args.y;
    },

    /**
     * Returns the coordinates and orientation of a point given by its distance
     * along this path segment, and the direction of travel.
     * @param length The distance travelled along this path segment.
     * @param reverse Whether distance is measured from the start of this segment.
     * @private
     */
    getInfoAtLength: function(length, reverse) {
        if (reverse && this.startAngle) {
            0  // Break me!
        }

        var point = this.getPointAtLength(length, reverse);
        var angle = this.getAngleAtLength(length, reverse);
        return {
            x: point.x,
            y: point.y,
            angle: angle
        }
    },

    /**
     * Draw this path segment on the given context.
     * @param context A Canvas 2D context to draw this segment on.
     */
    draw: function(context) {
        this._path2d.draw(context);
    }
};
