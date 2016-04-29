function createCanvas (id, width, height) {
    var canvas = document.createElement('canvas');
    canvas.id = id;
    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);
    return document.getElementById(id);
}

function distance(pointA, pointB) {
    return Math.hypot(pointB.x-pointA.x, pointB.y-pointA.y);
}

function drawPoint(x, y, ctx, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.arc(x, y, 3, 0, Math.PI*2, false);
    ctx.stroke();
}

