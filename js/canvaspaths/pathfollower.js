/**
 * Wrap the Path object and store some state about how far we've already
 * travelled along the path. This is in effect a single-use iterable
 * to traverse a path (optionally in reverse).
 * @param path The path to traverse.
 * @param reverse Whether to move along the path back-to-front.
 * @constructor
 */
var PathFollower = function(path, reverse) {
    this._path = path;
    this._reverse = reverse;
    this._distanceTravelled = 0;
    this._totalDistance = path.length;
    this._done = false;
    this.updateInfo();
};


PathFollower.prototype = {
    /**
     * Retrieve information about the path follower's current position and
     * orientation.
     * @returns {{x: (*|Number), y: (*|Number), angle: (*|Number)}}
     */
    getInfo: function() {
        return {x: this._x, y: this._y, angle: this._angle};
    },

    /**
     * Increase the distance travelled along this PathFollower.
     * @param delta The distance to move along the path.
     */
    advance: function(delta) {
        if (this._distanceTravelled+delta <= this._totalDistance) {
            this._distanceTravelled += delta;
            this.updateInfo();
        }
        else return "complete";
    },

    /**
     * Retrieve and store coordinates and orientation for our current PathFollower.
     * @private
     */
    updateInfo: function() {
        var info = this._path.getInfoAtLength(this._distanceTravelled, this._reverse);
        this._x = info.x;
        this._y = info.y;
        this._angle = info.angle;
    }
};