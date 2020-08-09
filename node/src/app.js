import 'core-js/stable';
import 'regenerator-runtime/runtime';

var application = {};

require("./draw_wave.js")(application);
require("./scss/style.scss");
const fft = require("ml-fft");

application.setup_draw_wave();

document.getElementById("get_wave").addEventListener("click", ()=> {
    var drawn_wave = application.get_drawn_wave();
    do_transform(drawn_wave);
});

function do_transform(wave) {
    var {FFT} = fft;
    FFT.init(wave.length);
    var re = [];
    var im = [];
    for (var i = 0, ii = wave.length; i<ii; i++) {
        re[i] = wave[i];
        im[i] = 0;
    }
    FFT.fft(re, im);
    var components = [];
    for (var i = 0, ii = re.length; i<ii; i++) {
        var _re = shallow_clone(re);
        var _im = shallow_clone(im);
        for (var j = 0, jj = _re.length; j<jj; j++) {
            if (j!==i) {
                _re[j] = 0;
                _im[j] = 0;
            }
        }
        FFT.ifft(_re, _im);
        components[i] = {
            re:_re,
            im:_im
        };
    }

    var transformed = [];
    for (i = 0, ii = wave.length; i<ii; i++) {
        transformed[i] = 0;
        for (var j = 0, jj= 20; j<jj; j++) {
            transformed[i] += components[j].re[i];
        }
    }
    draw_transformed_wave(transformed); 
}

function shallow_clone(arr) {
    var r = [];
    for (var i = 0, ii = arr.length; i<ii; i++) {
        r[i] = arr[i];
    }
    return r;
}

function draw_transformed_wave(wave) {
    var min, max;
    var cwave = [];
    for (var i = 0, ii = wave.length; i<ii; i++) {
        min = Math.min(wave[i], min) || wave[i];
        max = Math.max(wave[i], max) || wave[i];
    }
    for (var i = 0, ii = wave.length; i<ii; i++) {
        cwave[i] = -(wave[i]) + 128;
    }
    var ctx = document.getElementById("transformed-wave").getContext("2d");
    ctx.fillStyle="#000";
    ctx.beginPath();
    ctx.moveTo(0, cwave[0]);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    for (var i = 0, ii = cwave.length; i<ii; i++) {
        ctx.lineTo(i, cwave[i]);
    }
    ctx.stroke();
}
