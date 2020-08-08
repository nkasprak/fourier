var application;

module.exports = function(_app) {
    application = _app;
    application.setup_draw_wave = setup_draw_wave();
}

function setup_draw_wave() {
    register_events();
}

var state = {
    clicked: false
};

var the_wave = [];


function register_events() {

    var canvas = document.getElementById("draw-wave");

    var wave;
    var midpoint = canvas.getAttribute("height")/2;

    the_wave[Math.floor(canvas.getAttribute("width")/4)] = midpoint;
    the_wave[Math.floor(canvas.getAttribute("width")/2)] = midpoint;
    the_wave[0] = midpoint;
    the_wave[canvas.getAttribute("width")-1] = midpoint;

    function newPoint(x, y) {
        var width = canvas.offsetWidth;
        var height = canvas.offsetHeight;
        var cx = Math.floor(x/width * canvas.getAttribute("width"));
        var cy = Math.floor(y/height * canvas.getAttribute("height"));
        wave[cx] = cy;
    }

    function tempDrawPoint(x, y) {
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#000000";
        ctx.fillRect(x, y, 1, 1);
    }

    function redrawCanvas() {
        var ctx = canvas.getContext("2d");
        var width = canvas.getAttribute("width");
        var height = canvas.getAttribute("height");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#000000";
        the_wave.forEach((y, x)=> {
            ctx.fillRect(x, y, 1, 1);
        });
    }

    function finishDraw() {
        state.clicked = false;
        merge_wave(the_wave, wave);
        modifyWave(the_wave);
        repeatWave(the_wave);
        redrawCanvas();
    }

    canvas.addEventListener("mousedown", function(e) {
        wave = [];
        state.clicked = true;
        var x = e.offsetX;
        var y = e.offsetY;
        newPoint(x, y);
        redrawCanvas();
    });

    canvas.addEventListener("mouseup", function() {
        finishDraw();
    });

    canvas.addEventListener("mouseout", function() {
        if (!state.clicked) {
            return;
        }
        finishDraw();
    });

    canvas.addEventListener("mousemove", function(e) {
        if (state.clicked) {
            var x = e.offsetX;
            var y = e.offsetY;
            newPoint(x, y);
            tempDrawPoint(x, y);
        }
    });
}

function repeatWave(wave) {
    var repeat = Math.floor(wave.length/4);
    console.log(wave);
    var n = Math.floor(wave.length / repeat);
    console.log(repeat);
    for (i = 0; i < repeat; i++) {
        for (p = 0; p < n; p++) {
            var x = p*repeat + i;
            if (x < repeat || x >= 2*repeat) {
                wave[x] = wave[i + repeat];
            }
        }
    }
}

function merge_wave(base_wave, new_wave) {
    var limits = Object.keys(new_wave);
    for (var x = limits[0]*1, xx = limits[limits.length-1]*1; x<xx; x++) {
        delete(base_wave[x]);
    }
    new_wave.forEach((y, x) => {
        base_wave[x] = y;
    });
}

function modifyWave(wave) {
    var x1 = 0, x2;
    for (var i = 0, ii = wave.length; i<ii; i++) {
        if (typeof(wave[i])!=="undefined") {
            if (typeof(x1)==="undefined") {
                x1 = i;
            } else if (typeof(x2)==="undefined") {
                x2 = i;
                interpolate(x1, x2);
                x1 = x2;
                x2 = undefined;
            }
        }
    }

    function interpolate(x1, x2) {
        var y1 = wave[x1];
        var y2 = wave[x2];
        var m = (y2 - y1)/(x2 - x1);
        for (var x = x1; x<x2;x++) {
            wave[x] = m*(x - x1) + y1;
        }
    }
}