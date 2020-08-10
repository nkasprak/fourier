"use strict";

import fft from "ml-fft";

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
    for (var i = 1, ii = components.length/2; i<ii; i++) {
        for (var x = 0, xx = components[i].re.length; x<xx; x++) {
            components[i].re[x] += components[ii*2 - i].re[x];
            components[i].im[x] += components[ii*2 - i].im[x];
        } 
    }
    components = components.slice(0, components.length/2);
    return components;
}

function shallow_clone(arr) {
    var r = [];
    for (var i = 0, ii = arr.length; i<ii; i++) {
        r[i] = arr[i];
    }
    return r;
}

function setup_transform(application) {
    application.setup_transform = function() {
        document.getElementById("get_wave").addEventListener("click", ()=> {
            var drawn_wave = application.get_drawn_wave();
            var components = do_transform(drawn_wave);
            application.animate_transform_components(components);
            document.getElementById("stop").removeAttribute("disabled");
        });   
    }
}

export default setup_transform;
