
var g_height = 240;
	
function XColumn(xvalue, yvalue, functionName, xoffset, yoffset,color,seriesNumber) {
	this.xvalue = xvalue;
	this.xoffset = xoffset;
	this.yoffset = yoffset;
	this.height = functionName(xMap(xvalue),seriesNumber,typeOfWave)*yscale;
	this.yvalue = this.yoffset - this.height;
	this.resting = false;
	this.color=color;
};

function VerticalGridLine(xvalue) {
	this.xloc = reverseMap(xvalue);
};

function DrawGridLine(gridLine) {
	context.fillStyle = "#BBBBFF";
	var xloc = gridLine.xloc;
	DebugAlert(xloc);
	context.fillRect(gridLine.xloc,0,1,g_height);
};

function CreateGridLines() {
	var pi = Math.PI;
	for (var i = 0; i<=16; i++) {
		gridArray[i] = new VerticalGridLine((i-8)*(pi/4)+pi/8);	
	}
};

function DrawGridLines() {
	for (var i=0; i<=16; i++) {
		DrawGridLine(gridArray[i]);	
	}
};

function drawColumn(xColumn) {
	x = xColumn.xvalue + xColumn.xoffset;
	y = xColumn.yvalue + xColumn.yoffset + globalYOffset;
	height = xColumn.height;
	context.fillStyle = xColumn.color;
	context.fillRect(x,y,1,height);
};

function drawColumnExtraHeight(xColumn) {
	x = xColumn.xvalue + xColumn.xoffset;
	y = xColumn.yvalue + xColumn.yoffset + globalYOffset;
	height = xColumn.height;
	height++;
	context.fillStyle = xColumn.color;
	context.fillRect(x,y,1,height);
};

function clearColumn(x,height) {
	context.clearRect(x,0,1,height);
};



function xMap(x) {
	var width = document.getElementById("mainCanvas").width;
	return ((x - width/2)/width)*(xend - xstart);
};

function reverseMap(x) {
	var width = document.getElementById("mainCanvas").width;
	return (x/(xend - xstart))*width+width/2;
}

function DebugAlert(whatToAlert) {
	/*if (numOfAlerts<15) {
		alert(whatToAlert);
		numOfAlerts++;
	}*/
};

function CreateColumns(functionName,seriesNumber) {
	for (var i=0; i<document.getElementById("mainCanvas").width; i++) {
		columns[seriesNumber][i] = new XColumn(i,0,functionName,0,0,GetColor(seriesNumber),seriesNumber);
	}
};

function ResetObjects() {
	for (var x = 0; x<document.getElementById("mainCanvas").width; x++) {
			columns[0][x].resting = false;
			columns[0][x].yoffset = g_height;
		}
	for (var i=1; i<=numberOfWaves; i++) {
		for (var x = 0; x<document.getElementById("mainCanvas").width; x++) {
			columns[i][x].resting = false;
			columns[i][x].yoffset = 0;
		}
	}
};

function GetColor(i) {
	var c = Math.round(200 - (200/(numberOfWaves-1))*i);
	return "rgb(" + c + "," + c + "," + c + ")";
};

function alwaysZero(x,i,type) {
	return 0;
};

function waves(x,i,t) {
	x = 2*x;
	switch (t) {
		case "square":
		return ((2/(2*i-1))*(Math.sin((2*i-1)*x)/2)+1/(2*i-1));
		break;
		case "triangle":
		return (Math.pow(-1,((2*i-1)-1)/2)/((2*i-1)*(2*i-1))*Math.sin((2*i-1)*(2*x)/2)+1/((2*i-1)*(2*i-1)));
		break;
		case "half":
		if (i==1) {
			return Math.sin(x)+1;
		} else {
			var k = 2*i-2;
			return ((0-4)/Math.PI)*(1/((k*k)-1))*Math.cos(k*x)+(4/Math.PI)*(1/((k*k)-1));
		}
		break;
		case "sawtooth":
		return ((0-3/4)/i)*Math.sin(i*(2*x)/2)+(3/4)/i;
	}
};

function startAnimation() {
	try {
		n=1;
		if (animationOn == false) {
		animationOn = true;
		numberOfWaves = Math.round(document.parameters.numberOfWaves.value)+1;
		for (var i=0;i<=numberOfWaves;i++) {
		columns[i] = new Array();
	}
	CreateColumns(alwaysZero,0);
	for (var i = 1; i<=numberOfWaves; i++) {
		CreateColumns(waves,i);
	};
	CreateGridLines();
	for (x=0;x<animation_width;x++) {
		columns[0][x].yoffset = g_height;
	};
	for (i=1;i<numberOfWaves;i++) {
		restingColumns[i] = 0;	
	}
		interval1 = setTimeout(DrawFrame,1);
		}
	} catch (ex) {
		//alert(ex)
	}
};
	
function endAnimation() {
	n=numberOfWaves;
	clearInterval(interval1);
	animationOn = false;
	context.clearRect(0,0,animation_width,g_height);
	globalYOffset = 0;
	frameCount = 0;
	timesDrawn = 0;
	timesDrawn = 0;
	
	ResetObjects();
};

function changeType(newType) {
	typeOfWave = newType;
};

function DrawFrame() {
	/*if (frameCount % 50 == 0) {
		globalYOffset++;	
	}*/
	if (n<=numberOfWaves) {
		var offset = 0;
		var totalheight = 0;
		var displayedheight=0;
		var heightOfPreviousColumn = 0;
		for (x=0;x<animation_width;x++) {
			var heightToClear = columns[n][x].yvalue+columns[n][x].yoffset; 
			clearColumn(x,heightToClear);
			//for (var i = 1;i<=n;i++) {
				drawColumn(columns[n][x]);
			//}
				
			if (frameCount % 100 == 0 && frameCount !=0) {
				drawColumnExtraHeight(columns[n-1][x]);
			}
			if (columns[n][x].resting == false) {
				columns[n][x].yoffset++;
			}
			if ((columns[n][x].yvalue + columns[n][x].height + columns[n][x].yoffset)
			   >=(columns[n-1][x].yvalue + columns[n-1][x].yoffset)
				) {
				if (columns[n][x].resting == false) {
					restingColumns[n]++;
					columns[n][x].resting = true;
					//the following conditional corrects accumulating rounding errors
					if (n>1) {
						offset = 0;
						totalheight = columns[n-1][x].height;
						displayedheight = columns[n-1][x].yoffset - columns[n][x].yoffset;
						offset = totalheight - displayedheight;
						columns[n][x].height = columns[n][x].height + offset;
						columns[n][x].yvalue = columns[n][x].yvalue - offset;
					}
				}
			}
		}
		//DrawGridLines();
		if (restingColumns[n] >=animation_width) {
			if (n<numberOfWaves) {
				for (x=0;x<animation_width;x++) {
					columns[n+1][x].yoffset = columns[n+1][x].yoffset - globalYOffset;	
				}
			}
			n++;
		}
	frameCount++;
		setTimeout(DrawFrame,1);
	}
};



try {
	var isReady=false;
	var animation_width=document.getElementById("mainCanvas").width;
	var xstart = -2*Math.PI;
	var xend = 2*Math.PI;
	var yscale = 40;
	var numOfAlerts = 0;
	var typeOfWave = "square";
	var context = document.getElementById("mainCanvas").getContext('2d');
	var columns = new Array();
	var gridArray = new Array();
	var numberOfWaves = Math.round(document.parameters.numberOfWaves.value)+1;
	var timesDrawn = 0;
	var n=1;
	var globalYOffset = 0;
	var frameCount = 0;
	var interval1;
	var restingColumns = new Array();
	var animationOn = false;
	
} catch (ex) {
	//alert(ex);
}