"use strict";

import draw_wave from "./draw_wave";

var application,
    canvas,
    ctx,
    start,
    width,
    height,
    totals = [];

const prev_layer = [];

const time_for_harmonic = 2000;
const shift_time = 500;

var animation_state = {
    harmonic: 1,
    progress: 0,
    offset:0
};

export default function(_app) {
    application = _app;
    application.animate_transform_components = animate;
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
    if (i > 5) {
        return "#aaaaaa";
    } else {
        return [
            "#ffffff",
            "#000000",
            "#333333",
            "#666666",
            "#999999",
            "#aaaaaa"
        ][i];
    }
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
    ctx.fillStyle="#000000";
    ctx.fillRect(x, height - totals[x] + 1, 1, 1);
    var x_total = 0;
    comps.forEach((comp, _n)=> {
        if (_n < n) {
            ctx.fillStyle = harmonic_color(_n);
            ctx.fillRect(x, height - x_total - comp[x] + animation_state.offset, 1, comp[x]);
            ctx.fillStyle="#000000";
            ctx.fillRect(x, height - x_total - comp[x] + animation_state.offset + 1, 1, 1);
            x_total += comp[x];
        }
    });

}

function animate(raw_components) {
    canvas = document.getElementById("transformed-wave");
    ctx = canvas.getContext("2d");
    width = canvas.getAttribute("width");
    height = canvas.getAttribute("height");
    var n_components = [];
    for (var n = 0, nn = raw_components.length; n<nn; n++) {
        n_components[n] = normalize(raw_components[n].re);
    }
    animation_state.components = n_components;
    start_movement();
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
    for (var x = 0, xx = comps[animation_state.harmonic].length;x<xx;x++) {
        finish_component(comps, x, animation_state.harmonic);
    }
    console.log(totals);
    repeat_wave();
    var next_comp = function() {
        animation_state.harmonic++;
        animation_state.progress = 0;
        if (comps[animation_state.harmonic]) {
            component_down(animation_state.harmonic, function() {
                shift_down(next_comp);
            });
        }
    }
    next_comp();

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
                    ctx.fillStyle="#000000";
                    ctx.fillRect(x, offset - comp[x] + 1, 1, 1);
                    ctx.fillRect(x, offset + 1, 1, 1);
                }
            }
        }
        repeat_wave();
        if (progress < 1) {
            window.requestAnimationFrame(frame);
        } else {
            cb();
        }
    };

    frame();

}

function draw(data) {
    ctx.fillStyle = "#666";
    for (var x = 0, xx = data.length; x<xx; x++) {
        for (var y = 0, yy = data[x].length; y<yy; y++) {
            var _y = height - y;
            if (data[x][y]>0) {
                ctx.fillRect(x, _y, 1, 1);
            }
        }
    }
}



