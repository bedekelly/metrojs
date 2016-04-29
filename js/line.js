var WIDTH = 1080;
var HEIGHT = 720;
var CORNER_RADIUS = 13;
var LINE_WIDTH = 13;

var Line = function(boundingPoints, stations, color, name) {
    this.color = color;
    this.cars = [];
    this.jobMap = {};
    this.tracksCanvas = createCanvas(name+"Tracks", WIDTH, HEIGHT);
    this.carsCanvas = createCanvas(name+"Cars", WIDTH, HEIGHT);
    this.stationsCanvas = createCanvas(name+"Stations", WIDTH, HEIGHT);

    this.tracksContext = this.tracksCanvas.getContext("2d");
    this.carsContext = this.carsCanvas.getContext("2d");
    this.stationsContext = this.stationsCanvas.getContext("2d");

    this.trackPath = this.createPath(boundingPoints);

    this.stations = stations;
    for (var i=0; i<stations.length; i++) {
        stations[i].line = this;
    }
};


Line.prototype.addCar = function(car, station) {
    this.cars.push(car);
    car.station = station;
    car.line = this;
};


Line.prototype.addPairJob = function(stationA, stationB) {
    this.jobType = "pair";
    this.jobMap[stationA.name] = stationB;
    this.jobMap[stationB.name] = stationA;
};


Line.prototype.addRoute = function(route) {
    this.jobType = "route";
    this.route = route;
};


Line.prototype.getJob = function(car) {
    if (this.jobType == "pair")
        return this.jobMap[car.station.name];
    else if (this.jobType == "route") {
        var next = 1;
        var reverse = ((car.station.name == this.route[this.route.length-1].name)
                       || (car.reverse && car.station.name != this.route[0].name));

        if (reverse) next *= -1;
        for (var i=0; i<this.route.length; i++) {
            var station = this.route[i];
            if (station.name == car.station.name) break;
        }
        return this.route[i+next];
    }

};


function compare(a, b) {
    if (a > b) return 1;
    else if (a < b) return -1;
    else return 0;
}


function cross2d(ax, ay, bx, by, cx, cy) {
    return (bx-ax)*(cy-ay)-(by-ay)*(cx-ax);
}


function angle(line) {
    var lineType = getOtherLineType(line);
    var angleMap = {
        "down": 0,
        "leftdown": Math.PI/4,
        "left": Math.PI/2,
        "leftup": 3/Math.PI*4,
        "up": Math.PI,
        "rightup": 5 * Math.PI/4,
        "right": - Math.PI / 2,
        "rightdown": - Math.PI / 4
    };

    return angleMap[lineType];
}


function circleCenterTTI(px, py, rx, ry, qx, qy) {
    // Generate perpendicular lines to PQ and QR.
    var PQgradient = (qy-py) / (qx-px);
    var QRgradient = (ry-qy) / (rx-qx);
    var PQiGradient = 1 / -PQgradient;
    var QRiGradient = 1 / -QRgradient;
    var PQyIntercept = py - PQiGradient*px;
    var QRyIntercept = ry - QRiGradient*rx;

    if (PQiGradient == 0 && !isFinite(QRiGradient)) {
        return {x: rx, y: py};
    } else if (!isFinite(PQiGradient) && QRiGradient == 0) {
        return {x: px, y: ry};
    }

    var X, Y;

    if (!isFinite(PQiGradient)) {
        X = px;
        Y = ry - QRiGradient * (rx-px);
        return {x: X, y: Y}
    } else if (PQiGradient == 0) {
        Y = py;
        X = (Y - QRyIntercept) / QRiGradient;
    } else if (!isFinite(QRiGradient)) {
        X = rx;
        Y = py + PQiGradient * (rx-px);
    } else if (QRiGradient == 0) {
        Y = ry;
        X = (Y - PQyIntercept) / PQiGradient;
    }
    else {
        X = (PQyIntercept - QRyIntercept) / (QRiGradient - PQiGradient);
    }

    return {x: X, y: Y};
}

function getOtherLineType(line) {
    return getLineType([
        [line.startx, line.starty],
        [line.endx, line.endy]
    ]);
}

function getLineType(line) {
    var startx = line[0][0], starty = line[0][1], endx = line[1][0], endy = line[1][1];

    switch(compare(endx, startx)) {
        case 1: switch(compare(endy, starty)) {
            case 1: return "rightdown";
            case 0: return "right";
            case -1: return "rightup";
        } break;
        case -1: switch(compare(endy, starty)) {
            case 1: return "leftdown";
            case 0: return "left";
            case -1: return "leftup";
        } break;
        case 0: switch(compare(endy, starty)) {
            case 1: return "down";
            case -1: return "up";
        }

    }
}


function trim(line, first, last) {
    // Expand "line" into startx, starty, endx, and endy values. Store these in "trimmed".
    // Keep a copy of them in "trimmed.o".
    var trimmed = {o: {}};
    if (!line.startx)
        var startx = line[0][0], starty = line[0][1], endx = line[1][0], endy = line[1][1];
    else
        var startx=line.startx, starty=line.starty, endx=line.endx, endy=line.endy;
    trimmed.startx=startx; trimmed.starty=starty; trimmed.endy=endy; trimmed.endx=endx;
    trimmed.o.startx=startx; trimmed.o.starty=starty; trimmed.o.endy=endy; trimmed.o.endx=endx;

    // Use the line's type to determine the padding that should be applied to its values.
    var type = getLineType(line);
    var c = CORNER_RADIUS, c2 = CORNER_RADIUS / Math.sqrt(2);

    var paddingMap = {
        "up": [0, -c, 0, c],
        "down": [0, c, 0, -c],
        "left": [-c, 0, c, 0],
        "right": [c, 0, -c, 0],
        "leftup": [-c2, c2, -c2, -c2],
        "rightup": [c2, -c2, -c2, c2],
        "leftdown": [-c2, c2, c2, -c2],
        "rightdown": [c2, c2, -c2, -c2]
    };

    // Don't pad the start of the first line, or the end of the last.

    var paddings = paddingMap[type];
    if (!first) {
        // Apply startX and startY padding.
        trimmed.startx = startx + paddings[0];
        trimmed.starty = starty + paddings[1];
    }

    if (!last) {
        // Apply endX and endY padding.
        trimmed.endx = endx + paddings[2];
        trimmed.endy = endy + paddings[3];
    }

    return trimmed;
}




Line.prototype.draw = function() {
    var ctx = this.tracksContext;
    ctx.lineWidth = LINE_WIDTH;
    ctx.strokeStyle = this.color;
    ctx.stroke(this.trackPath._path2d);

    for (var i=0; i<this.stations.length; i++) {
        var station = this.stations[i];
        station.drawOn(this.stationsContext);
    }

};


Line.prototype.createPath = function(boundingPoints) {
    // Generate consecutive pairs of points, i.e. straight lines.
    var lines = [];
    for (var i=0; i<boundingPoints.length-1; i++) {
        lines.push([boundingPoints[i], boundingPoints[i+1]]);
    }

    // Trim each line to allow for curves.
    if (lines.length == 1)
        lines = [trim(lines[0], true, true)]
    else {
        lines[0] = trim(lines[0], true, false);
        for (i=1; i<lines.length-1; i++) {
            lines[i] = trim(lines[i]);
        }

        lines[lines.length-1] = trim(lines[lines.length-1], false, true);
    }


    // For each line, draw a line from
    var path = new Path();

    path.moveTo(lines[0].startx, lines[0].starty);
    for (i=0; i<lines.length-1; i++) {
        path.moveTo(lines[i].startx, lines[i].starty);
        path.lineTo(lines[i].endx, lines[i].endy);
        var linea = lines[i], lineb = lines[i+1];
        var ax = linea.startx, ay = linea.starty;
        var bx = linea.endx, by  = linea.endy;
        var cx = lineb.endx, cy = lineb.endy;
        var anticlockwise = cross2d(ax, ay, bx, by, cx, cy) < 0;
        var c = circleCenterTTI(
            linea.endx, linea.endy,
            lineb.startx, lineb.starty,
            linea.o.endx, linea.o.endy
        );

        var a1 = angle(linea), a2 = angle(lineb);
        var r = (a1 - a2) % (Math.PI/2) == 0 ? CORNER_RADIUS : CORNER_RADIUS * 2.42;
        path.arc(c.x, c.y, r, a1, a2, anticlockwise)
    }
    var lastLine = lines[lines.length-1];
    path.moveTo(lastLine.startx, lastLine.starty);
    path.lineTo(lastLine.endx, lastLine.endy);

    return path;
};