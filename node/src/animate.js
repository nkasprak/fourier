"use strict";

import color_gen from "./colors.js";

var application,
    canvas,
    ctx,
    svg,
    width,
    height,
    totals = [],
    colors = color_gen("#3250a8", "#f2b98a", 256);

const time_for_harmonic = 2000;
const shift_time = 500;

var animation_state;

export default function(_app) {
    application = _app;
    application.animate_transform_components = animate;
    application.setup_animate = setup;
}

function setup() {
    document.getElementById("stop").addEventListener("click", function() {
        animation_state = animation_state || {};
        animation_state.stopped = true;
        window.requestAnimationFrame(function() {
            totals = [];
            document.getElementById("stop").setAttribute("disabled",true);
        });
    });
}


function normalize(comp) {
    var r = new Float64Array(comp.length);
    var min;
    for (var i = 0, ii = comp.length; i<ii; i++) {
        min = Math.min(comp[i], min) || comp[i];
    }
    for (var i = 0, ii = comp.length; i<ii; i++) {
        r[i] = 2*(comp[i] - min);
    }
    return r;
}

function harmonic_color(i) {
    if (i===0) {
        return "#000000";
    }
    return colors[i - 1];
}

function finish_component(comps, x, n) {
    var comp = comps[n];
    ctx.fillStyle = "#ffffff";
    totals[x] = totals[x] || 0;
    totals[x] += comp[x];
    ctx.fillRect(x, 0, 1, height);
    ctx.fillStyle = harmonic_color(n);
    totals[x] = totals[x] || 0;
    ctx.fillRect(x, height - totals[x], 1, totals[x]);
    ctx.fillStyle="rgba(0,0,0,0.5)";
    ctx.fillRect(x, height - totals[x] + 1, 1, 1);
    var x_total = 0;
    comps.forEach((comp, _n)=> {
        if (_n < n) {
            ctx.fillStyle = harmonic_color(_n);
            ctx.fillRect(x, height - x_total - comp[x] + animation_state.offset, 1, comp[x]);
            ctx.fillStyle="rgba(0,0,0,0.5)";
            ctx.fillRect(x, height - x_total - comp[x] + animation_state.offset + 1, 1, 1);
            x_total += comp[x];
        }
    });

}

function animate(raw_components) {
    animation_state = {
        stopped:true,
        harmonic: 1,
        progress: 0,
        offset:0
    }
    window.requestAnimationFrame(function() {
        animation_state.stopped = false;
        totals = [];
        canvas = document.getElementById("transformed-wave");
        ctx = canvas.getContext("2d");
        svg = document.getElementById("transform-overlay");
        width = canvas.getAttribute("width");
        height = canvas.getAttribute("height");
        var n_components = [];
        for (var n = 0, nn = raw_components.length; n<nn; n++) {
            n_components[n] = normalize(raw_components[n].re);
        }
        animation_state.components = n_components;
        start_movement();
    });
}

function shift_down(cb) {
    var start = Date.now();
    var min;
    var next_frame_totals = [];
    var max;
    var shift = 0;
    for (var x = 0, xx = totals.length; x < xx; x++) {
        min = Math.min(totals[x], min) || totals[x];
        next_frame_totals[x] = totals[x] + animation_state.components[animation_state.harmonic][x];
        max = Math.max(next_frame_totals[x], max) || next_frame_totals[x];
    }
    if (max > height) {
        shift = min;
    }
    animation_state.offset += shift;
    var image_data = ctx.getImageData(0, 0, width, height);
    var frame = function() {
        var progress = (Date.now() - start)/shift_time;
        if (progress >= 1) {
            progress = 1;
        }
        var offset = Math.round(progress*shift);
        
        ctx.putImageData(image_data, 0, offset);
        repeat_wave();
        if (animation_state.stopped) {
            return;
        }
        if (progress < 1) {
            window.requestAnimationFrame(frame);
        } else {
            for (var x = 0, xx = totals.length; x<xx; x++) {
                totals[x] -= shift;
            }
            cb();
        }
    }
    frame();
}

function start_movement() {
    var comps = animation_state.components;
    update_overlay(animation_state.harmonic);
    for (var x = 0, xx = comps[animation_state.harmonic].length;x<xx;x++) {
        finish_component(comps, x, animation_state.harmonic);
    }
    repeat_wave();
    var next_comp = function() {
        animation_state.harmonic++;
        update_overlay(animation_state.harmonic);
        animation_state.progress = 0;
        if (comps[animation_state.harmonic]) {
            component_down(animation_state.harmonic, function() {
                shift_down(next_comp);
            });
        }
    }
    setTimeout(next_comp, 1000);

}

function repeat_wave() {
    var data = ctx.getImageData(0, 0, width/4, height);
    ctx.putImageData(data, width/4, 0);
    ctx.putImageData(data, width/2, 0);
    ctx.putImageData(data, 3*width/4, 0);
}

function component_down(harmonic, cb) {
    var comps = animation_state.components;
    var comp = comps[harmonic];
    var start = Date.now();
    var finished = [];
    var frame = function() {
        var progress = (Date.now() - start)/time_for_harmonic;
        if (progress >= 1) {
            progress = 1;
        }
        animation_state.progress = progress;
        var offset = Math.floor(animation_state.progress*height);
        for (var x = 0, xx = comp.length; x<xx; x++) {
            if (!finished[x]) {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(x, 0, 1, offset);
                if ((height - offset  <= totals[x])) {
                    finish_component(comps, x, animation_state.harmonic);
                    finished[x] = true;
                } else {
                    ctx.fillStyle = harmonic_color(animation_state.harmonic);
                    ctx.fillRect(x, offset - comp[x], 1, comp[x]+1);
                    ctx.fillStyle="rgba(0,0,0,0.5)";
                    ctx.fillRect(x, offset - comp[x] + 1, 1, 1);
                    ctx.fillRect(x, offset + 1, 1, 1);
                }
            }
        }
        repeat_wave();
        if (animation_state.stopped) {
            return;
        }
        if (progress < 1) {
            window.requestAnimationFrame(frame);
        } else {
            cb();
        }
    };

    frame();

}

function update_overlay(n) {
    document.getElementById("overlay-label").innerText = "N = " + n;
    while (svg.lastChild) {
        svg.removeChild(svg.lastChild);
    }
    var opacity = 1/n;
    var lines = n*4;
    for (var i = 0; i<4;i++) {
        var line = document.createElementNS("http://www.w3.org/2000/svg","line");
        var x = width/4*i;
        line.setAttribute("x1", x);
        line.setAttribute("y1", 0);
        line.setAttribute("x2", x);
        line.setAttribute("y2", height);
        line.setAttribute("stroke-width",1);
        line.setAttribute("stroke","#000000");
        svg.appendChild(line);
    }
    if (n > 1) {
        for (var i = 0; i<lines;i++) {
            var line = document.createElementNS("http://www.w3.org/2000/svg","line");
            var x = width/lines*i;
            line.setAttribute("x1", x);
            line.setAttribute("y1", 0);
            line.setAttribute("x2", x);
            line.setAttribute("y2", height);
            line.setAttribute("stroke-width",1);
            line.setAttribute("stroke-opacity",opacity);
            line.setAttribute("stroke","#000000");
            svg.appendChild(line);
        }
    }
}