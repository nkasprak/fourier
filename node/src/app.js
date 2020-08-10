"use strict";
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import wave_draw from "./draw_wave.js";
import transform from "./transform.js";
import animate from "./animate.js"; 
import "./scss/style.scss";

var application = {};

wave_draw(application);
transform(application);
animate(application);


application.setup_draw_wave();
application.setup_transform();
application.setup_animate();