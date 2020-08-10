import {lab} from "d3-color";

function color_array(start, end, n) {
    var lab_start = lab(start);
    var lab_end = lab(end);
    var r = [];
    var p;
    for (var i = 0; i<n; i++) {
        p = Math.log(i+1)/Math.log(n);
        r.push(lab(
            p*(lab_end.l - lab_start.l) + lab_start.l,
            p*(lab_end.a - lab_start.a) + lab_start.a,
            p*(lab_end.b - lab_start.b) + lab_start.b
        ).formatHex());
    }
    return r;
}

export default color_array;