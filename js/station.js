OPPOSITES = {
    "left": "right",
    "right": "left",
    "up": "down",
    "down": "up",
    "leftup": "rightdown",
    "rightdown": "leftup",
    "leftdown": "rightup",
    "rightup": "leftdown"
};

var drawCircleStation = function(stationsContext, x, y) {
    stationsContext.beginPath();
    stationsContext.arc(x, y, LINE_WIDTH*1.4, 0, Math.PI*2);
    stationsContext.fillStyle = "white";
    stationsContext.fill();
    stationsContext.lineWidth = LINE_WIDTH*0.55;
    stationsContext.strokeStyle = "black";
    stationsContext.stroke();
    stationsContext.closePath();
};


function drawSimpleStation(stationsContext, x, y, orientation, color) {
    var outerPoint = function(x, y,  orientation) {
        var s = LINE_WIDTH;

        switch(orientation){
            case "down": return {x: x+s, y: y};
            case "up": return {x: x-s, y: y};

            case "left": return {x: x, y: y+s};
            case "right": return {x: x, y: y-s};

            case "leftdown":
                return {x: x-s, y: y-s};
            case "rightdown":
                return {x: x+s, y: y-s};

            case "leftup":
                return {x: x+s, y: y+s};
            case "rightup":
                return {x: x-s, y: y+s};
        }
    };

    var point = outerPoint(x, y, orientation);

    stationsContext.beginPath();
    stationsContext.moveTo(x, y);
    stationsContext.lineTo(point.x, point.y);
    stationsContext.lineWidth = LINE_WIDTH;
    stationsContext.strokeStyle = color;
    stationsContext.stroke();
}


var Station = function(x, y, name, type) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.type = type;
    this.line = null;
};

Station.prototype.drawOn = function(ctx) {
    var ori, distance;
    switch(this.type) {
        case "circle":
            drawCircleStation(ctx, this.x, this.y);
            break;
        case "end":
            distance = this.line.trackPath.getLengthAtPoint(this);
            ori = this.line.trackPath.getOrientationAtLength(distance);
            ori = OPPOSITES[ori];
            drawSimpleStation(ctx, this.x, this.y, ori, this.line.color);
            // Intentional fall-through!
        case "simple":
            distance = this.line.trackPath.getLengthAtPoint(this);
            ori = this.line.trackPath.getOrientationAtLength(distance);
            drawSimpleStation(ctx, this.x, this.y, ori, this.line.color);
            break;
    }
};
