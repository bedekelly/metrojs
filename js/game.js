var FPS = 60;
var WAITING_TIME = 0.5 * FPS;  // 1 second.

var cars = [];
var circleLineStations = [];

// Define the circle line by its "straight" lines. We apply curves later.
var circleLinePoints = [
    [100, 100], [100, 300], [300, 500], [600, 500], [600, 600]
];

// Create some circleLineStations.
var stationA = new Station(100, 100, "Aville", "end"); circleLineStations.push(stationA);
var stationB = new Station(100, 200, "Beeton", "circle"); circleLineStations.push(stationB);
var stationC = new Station(150, 350, "Ceecrest", "simple"); circleLineStations.push(stationC);
var stationD = new Station(250, 450, "Deebridge", "circle"); circleLineStations.push(stationD);
var stationE = new Station(450, 500, "Ealing", "simple"); circleLineStations.push(stationE);
var stationF = new Station(600, 600, "Efmal", "end"); circleLineStations.push(stationF);

// Create a car to drive between the circleLineStations.
var carA = new Car(); cars.push(carA);

// Define the circle line by its points and circleLineStations.
var circleLine = new Line(circleLinePoints, circleLineStations, "#FFD300", "circle");

// Add the car to the line at Aville and tell it to go between Aville and Efmal.
circleLine.addCar(carA, stationA);
circleLine.addRoute(circleLineStations);


var victoriaLinePoints = [
    [100, 500+LINE_WIDTH], [800, 500+LINE_WIDTH]
];

var vicLineStations = [];

var stationG = new Station(100, 500+LINE_WIDTH, "Geecliff", "end"); vicLineStations.push(stationG);
var stationH = new Station(450, 500+LINE_WIDTH, "Aitchmart", "simple"); vicLineStations.push(stationH);
var stationI = new Station(800, 500+LINE_WIDTH, "Eyecroft", "end"); vicLineStations.push(stationI);

var carB = new Car(); cars.push(carB);

var victoriaLine = new Line(victoriaLinePoints, vicLineStations, "#0098D4", "victoria");
victoriaLine.addCar(carB, stationG);
victoriaLine.addRoute(vicLineStations);


var centralLinePoints = [
    [50, 200], [250, 200], [250, 600]
];

var stationJ = new Station(50, 200, "Jayston", "end");
var stationK = new Station(250, 600, "Kayville", "end");
var centralLineStations = [stationJ, stationB, stationD, stationK];

var centralLine = new Line(centralLinePoints, centralLineStations, "#E32017", "central");
var carC = new Car(); cars.push(carC);
centralLine.addCar(carC, stationJ);
centralLine.addRoute(centralLineStations);


function update() {
    cars.forEach(function(car){car.update()});
    setTimeout(function() {
        requestAnimationFrame(update);
    }, 1000 / FPS
    )
}


centralLine.draw();
circleLine.draw();
victoriaLine.draw();

update();

