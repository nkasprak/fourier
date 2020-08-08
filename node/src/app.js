import 'core-js/stable';
import 'regenerator-runtime/runtime';

var application = {};

require("./draw_wave.js")(application);
require("./scss/style.scss");
const fft = require("ml-fft");

application.setup_draw_wave();

document.getElementById("get_wave").addEventListener("click", ()=> {
    console.log(application.get_drawn_wave());
});
