/**
 * Test code for the PathFollower class.
 */

FPS = 60;
var canvas = document.getElementById("pathFollowerCanvas");
var ctx = canvas.getContext("2d");

var drawPoint = function(point) {
    var x = point.x, y = point.y;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI*2, false);
    ctx.fillStyle = "red";
    ctx.fill();
};


var drawRect = function(info) {
    ctx.save();
    ctx.translate(info.x, info.y);
    ctx.rotate(info.angle);
    ctx.strokeRect(-10, -20, 20, 40);
    ctx.restore();
};


// Create a Path object of our own.
var path = new Path();

// Draw a line on the path.
path.moveTo(50, 50);
path.lineTo(100, 50);

// Draw an arc on the path.
path.arc(100, 100, 50, -Math.PI/2, 0, false);

// Draw another line on the path.
path.lineTo(150, 200);

// Draw the path on a canvas context.
ctx.stroke(path._path2d);

// Draw equidistant points along the path.
for (var i=0; i<path.length; i+=10) {
    drawPoint(path.getPointAtLength(i));
}

// Test anticlockwise turns.
var path2 = new Path();
path2.moveTo(200, 200);
path2.lineTo(250, 200);
path2.arc(250, 150, 50, Math.PI/2, 0, true);
path2.lineTo(300, 100);

ctx.stroke(path2._path2d);

for (i=0; i<path2.length; i+=10) {
    drawPoint(path2.getPointAtLength(i));
}


// Test rotation correctness. (Set a breakpoint here!)
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.stroke(path._path2d);
ctx.stroke(path2._path2d);

drawPoint({x: 100, y: 100});
drawRect({x: 100, y: 100, angle: 0});

for (i=0; i<path.length; i+=10) {
    drawRect(path.getInfoAtLength(i));
}

for (i=0; i<path2.length; i+=10) {
    drawRect(path2.getInfoAtLength(i));
}


// Test animation, i.e. smaller increments. (Set a breakpoint here!)
var follower = new PathFollower(path);

var update = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.stroke(path._path2d);
    follower.advance(1);
    drawRect(follower.getInfo());
    setTimeout(
        function() {requestAnimationFrame(update)},
        1000 / FPS
    );
};

update();