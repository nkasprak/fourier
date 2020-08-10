"use strict";

var application, 
    canvas, 
    wave, 
    state,
    width,
    height,
    midpoint,
    ctx;

const wave_color = "#0c61a4";
const shadow_color = "#cccccc";
const wave_width = 2;
const shadow_width = 3;
const shadow_offset = 2;

function setup_draw_wave() {
    register_events();
}

state = {
    clicked: false
};

function register_events() {

    canvas = document.getElementById("draw-wave");
    width = canvas.getAttribute("width")*1;
    height = canvas.getAttribute("height")*1;
    ctx = canvas.getContext("2d");
    midpoint = height/2;

    wave = emptyWave();

    var mousedownListen = function(e) {
        wave = emptyWave();
        clearCanvas();
        state.clicked = true;
        var x = e.offsetX;
        var y = e.offsetY;
        if (e.touches) {
            if (e.touches.length) {
                var offsetX = canvas.offsetLeft;
                var offsetY = canvas.offsetTop;
                x = e.touches[0].pageX - offsetX;
                y = e.touches[0].pageY - offsetY;
            }
        }
        var stdPoint = std(x, y);
        newPoint(stdPoint.x, stdPoint.y);
        tempDrawPoint(stdPoint.x, stdPoint.y);
    }
    canvas.addEventListener("mousedown", mousedownListen);
    canvas.addEventListener("touchstart", mousedownListen);

    var mouseUpListen = function(e) {
        if (!state.clicked) {
            return;
        }
        finishDraw();
    }
    canvas.addEventListener("mouseup", mouseUpListen);
    canvas.addEventListener("touchend", mouseUpListen);
    canvas.addEventListener("mouseout", mouseUpListen);
    canvas.addEventListener("touchleave", mouseUpListen);

    var mouseMoveListen = function(e) {
        if (state.clicked) {
            var x = e.offsetX;
            var y = e.offsetY;
            if (e.touches) {
                if (e.touches.length) {
                    var offsetX = canvas.offsetLeft;
                    var offsetY = canvas.offsetTop;
                    x = e.touches[0].pageX - offsetX;
                    y = e.touches[0].pageY - offsetY;
                }
            }
            var stdPoint = std(x, y);
            newPoint(stdPoint.x, stdPoint.y);
            tempDrawPoint(stdPoint.x, stdPoint.y);
        }
    }

    canvas.addEventListener("mousemove", mouseMoveListen);
    canvas.addEventListener("touchmove", mouseMoveListen);
}

function emptyWave() {
    var wave = new Uint8Array(width);
    wave[Math.floor(width/4)] = midpoint;
    wave[Math.floor(width/2)] = midpoint;
    wave[0] = midpoint;
    wave[width-1] = midpoint;
    return wave;
}

function std(x, y) {
    var pwidth = canvas.offsetWidth;
    var pheight = canvas.offsetHeight;
    var cx = Math.floor(x/pwidth * width);
    var cy = Math.floor(y/pheight * height);
    return {x: cx, y: cy};
}

function newPoint(cx, cy) {
    wave[cx] = cy;
    if (typeof(state.prevX)!=="undefined") {
        for (var _x = state.prevX +1; _x < cx; _x++) {
            wave[_x] = undefined;
        }
    }
    state.prevX = cx;
    state.prevY = cy;
}

function tempDrawPoint(x, y) {
    ctx.fillStyle = shadow_color;
    ctx.fillRect(x+shadow_offset, y+shadow_offset, shadow_width, shadow_width);
    ctx.fillStyle = wave_color;
    ctx.fillRect(x, y, wave_width, wave_width);
}

function redrawCanvas() {
    clearCanvas();
    ctx.beginPath();
    ctx.moveTo(0+shadow_offset, midpoint+shadow_offset);
    ctx.strokeStyle = shadow_color;
    ctx.lineWidth = shadow_width;
    wave.forEach((y, x)=> {
        ctx.lineTo(x+shadow_offset, y+shadow_offset);
    });
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, midpoint);
    ctx.strokeStyle = wave_color;
    ctx.lineWidth = wave_width;
    wave.forEach((y, x)=> {
        ctx.lineTo(x, y);
    });
    ctx.stroke();
}

function clearCanvas() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
}

function finishDraw() {
    state.clicked = false;
    interpolateWave();
    repeatWave();
    redrawCanvas();
    document.getElementById("get_wave").removeAttribute("disabled");
}

function repeatWave() {
    var repeat = Math.floor(wave.length/4);
    var n = Math.floor(wave.length / repeat);
    for (var i = 0; i < repeat; i++) {
        for (var p = 0; p < n; p++) {
            var x = p*repeat + i;
            if (x < repeat || x >= 2*repeat) {
                wave[x] = wave[i + repeat];
            }
        }
    }
}

function interpolateWave() {
    var x1 = 0, x2;
    for (var i = 0, ii = wave.length; i<ii; i++) {
        if (wave[i] > 0) {
            if (typeof(x2)==="undefined") {
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
            wave[x] = Math.floor(m*(x - x1) + y1);
        }
    }
}

function normalize(wave) {
    var min, max;
    var r = new Int8Array(wave.length/4);
    for (var x = 0, xx=wave.length/4; x<xx; x++) {
        min = Math.min(wave[x], min) || wave[x];
        max = Math.max(wave[x], max) || wave[x];
    }
    var mid = Math.floor((max + min)/2);
    for (x = 0, xx=wave.length/4; x<xx; x++) {
        r[x] = 0 - (wave[x] - mid);
    }
    return r;
}

export default function(_app) {
    application = _app;
    application.setup_draw_wave = setup_draw_wave;
    application.get_drawn_wave = function() {
        return normalize(wave);
    };
}