var MAX_SPEED = 1.5;
var TOLERANCE = 0.5;
var ACCELERATION = 0.01;
var MIN_SPEED = 0.3;


var Car = function() {
    this.speed = 0;
};

var approxEqual = function(a, b) {
    return Math.abs(a-b) < TOLERANCE;
};


Car.prototype.update = function() {
    if (!this.station || !this.line) return;

    this.draw();

    if (!this.job) {
        this.getJob();
    }

    else if (this.jobComplete)
        if (this.waitTime == 0) this.getJob();
        else {
            this.waitTime--;
            return;
        }

    else if (approxEqual(this.distanceTravelledOnJob, this.jobDistance)) {
        this.jobComplete = true;
        this.waitTime = WAITING_TIME;
        this.x = this.job.x;
        this.y = this.job.y;
        return;
    }



    var speed = this.getSpeed();
    this.distanceTravelledOnJob += this.speed;

    var info = this.line.trackPath.getInfoAtLength(this.distanceTravelledOnJob + this.initialDistance, this.reverse);
    this.x = info.x;
    this.y = info.y;
    this.angle = info.angle;
    //this.angle = 3 * Math.PI / 4;
};

Car.prototype.getJob = function() {
    if (!this.line || !this.station) console.error("Requested job without a line or station!");

    // Moving from this.station to the new job.
    if (this.job) this.station = this.job;
    var job = this.line.getJob(this);
    this.job = job;
    var reverse = this.line.trackPath.getLengthAtPoint(this.station) > this.line.trackPath.getLengthAtPoint(job);

    this.initialDistance = this.line.trackPath.getLengthAtPoint(this.station, reverse);
    var info = this.line.trackPath.getInfoAtLength(this.initialDistance, reverse);

    this.x = info.x; this.y = info.y; this.angle = info.angle;

    this.jobDistance = this.line.trackPath.getDistanceBetweenPoints(this.station, this.job);
    this.jobDistance = Math.abs(this.jobDistance);
    this.jobComplete = false;
    this.distanceTravelledOnJob = 0;
    this.reverse = reverse;
};

Car.prototype.getSpeed = function() {
    var accDistance = this.speed * this.speed / (2 * ACCELERATION)
    if (this.distanceTravelledOnJob < this.jobDistance-accDistance) {
        this.speed = Math.min(MAX_SPEED, this.speed + ACCELERATION);
    } else {
        this.speed = Math.max(MIN_SPEED, this.speed - ACCELERATION);
    }
    return this.speed;
};


Car.prototype.draw = function() {
    var ctx = this.line.carsContext;
    ctx.save();
    ctx.clearRect(0, 0, this.line.carsCanvas.width, this.line.carsCanvas.height);
    drawPoint(this.x, this.y, this.line.carsContext, "red");

    ctx.beginPath();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.rect(-10, -20,  20, 40);
    ctx.fillStyle = this.line.color;
    ctx.fill();
    ctx.restore();
};
