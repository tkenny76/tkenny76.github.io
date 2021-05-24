function startup() {
  var el = document.getElementById("canvas");
  el.addEventListener("touchstart", handleStart, false);
  el.addEventListener("touchend", handleEnd, false);
  el.addEventListener("touchcancel", handleCancel, false);
  el.addEventListener("touchmove", handleMove, false);
	el.addEventListener("mousedown", doMouseDown, false);
  el.addEventListener("mouseup", doMouseUp, false);
}

document.addEventListener("DOMContentLoaded", startup); // 
var winX = screen.width;
var winY = screen.height;
var ongoingTouches = [];
var el = document.getElementById('canvas');
var ctx = el.getContext('2d');  // el was canvas
//var buttonLeft = Math.min(522, winX-80);
var buttonLeft = winX-100;

createAllButtons();



// Set display size (css pixels).
var size = Math.min(512, winX);
var startSize = size;
// list of default sizes
var sizeList = [64, 128, 256, 512, 768, 1024];
if(!sizeList.includes(size)) sizeList.push(size);// add custom size if not present
sizeList.sort(function(a, b){return a - b});
sizeIdx = sizeList.indexOf(startSize);
var canx;
var cany;
var maxSize = sizeList[sizeList.length-1];
el.style.width = maxSize + "px"; // el was canvas
el.style.height = (el.style.width) + "px";

// Set actual size in memory (scaled to account for extra pixel density).
var scale = 1; // window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
console.log("Scale = " + scale);
el.width = Math.floor(maxSize * scale);
el.height = Math.floor(maxSize * scale);

console.log("cw = " + el.width);
console.log("ch = " + el.height);

let myRect = el.getBoundingClientRect();
let canUY = Math.ceil(myRect.y);
let canLX = Math.ceil(myRect.x)

// Normalize coordinate system to use css pixels.
ctx.scale(scale, scale);

ctx.fillStyle = "#7f7f7f";
ctx.fillRect(0, 0, maxSize, maxSize);
const random255 = () => Math.floor(Math.random() * 255);
const randomColor = () => `rgb(${random255()},${random255()},${random255()}`;
var side = startSize; // Math.min(1024, size-80);
var ncol = 256;
var nSchemes = 4; /////////////////  COLOR SCHEME COUNT ////////////////////////////
var nColInScheme;
var schemeNo = 3;
var colArray = [];
var counts = Create2DArray(maxSize);
var scheme = Create2DArray(7);
// Start with Roygbiv colors
fillColorArray(schemeNo);
var xc = -0.750;
var yc = 0.0;
var r = 1.3;
var cR;
var cI;
var cMax = 1024;
var bandMin = 0;
var mdx; // mouse down x
var mdy; // mouse down y
fillCounts(counts, side, xc, yc, r,cMax);
drawMand(counts, side);

ctx.fillStyle = "#ffffff";
ctx.font = '18px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

var x = size / 2;
var y = size / 2;

var nTouches = 0;
var nReleases = 0;
var ongoingTouches = [];


function handleStart(evt) {
	evt.preventDefault();
  var el = document.getElementById("canvas");
  var ctx = el.getContext("2d");
  var touches = evt.changedTouches;
  nTouches = touches.length;
  console.log(nTouches + " touches")
//  for (let i = 0; i < nTouches; i++) {
  if( nTouches == 1 ) { // click at new center and drag to range 
    let {pageX, pageY} = touches[0];
    canx = pageX;  // event.pageX
	  cany = pageY;  // event.pageY
	  mdx = canx-canLX;
	  mdy = cany-canUY;
	  console.log("Touched at x = " + mdx + " y = " + mdy);
  	if (mdx >= 0 && mdx <= side && mdy >= 0 && mdy <= side) {
		  xc = (xc-r)+2.0*(mdx*r)/side;
		  yc = (yc+r)-2.0*(mdy*r)/side;
    }
  }
  
  if( nTouches == 2 ) {
    let {pageX1, pageY1} = touches[0];
    let {pageX2, pageY2} = touches[1];
    let pageX = Math.floor((pageX1 + pageX2)/2);
    let pageY = Math.floor((pageY1 + pageY2)/2);
    canx = pageX;  // event.pageX
	  cany = pageY;  // event.pageY
	  mdx = canx-canLX;
	  mdy = cany-canUY;
	  console.log("Centered at x = " + mdx + " y = " + mdy);
  	if (mdx >= 0 && mdx <= side && mdy >= 0 && mdy <= side) {
		  xc = (xc-r)+2.0*(mdx*r)/side;
		  yc = (yc+r)-2.0*(mdy*r)/side;
    }
    evt.preventDefault();		
  }
  
	// }
  // event.preventDefault();
}

function handleMove(evt) {
  evt.preventDefault();
  var el = document.getElementById("canvas");
  var ctx = el.getContext("2d");
  var touches = evt.changedTouches;

  for (var i = 0; i < touches.length; i++) {
    var idx = ongoingTouchIndexById(touches[i].identifier);
    ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
  }
}

function handleEnd(evt){
	evt.preventDefault();
  var el = document.getElementById("canvas");
  var ctx = el.getContext("2d");
  var touches = evt.changedTouches;
  nTouches = touches.length;
  console.log(nTouches + " releases")
  if(nTouches == 1) {
		var idx = ongoingTouchIndexById(touches[0].identifier);
		canx = touches[0].pageX;
		cany = touches[0].pageY;
		mux = canx-canLX;
		muy = cany-canUY;
		console.log("Touch End at   x = " + mux + " y = " + muy);
		if (Math.abs(mux - mdx) < 4 && Math.abs(muy - mdy) < 4 && mux >= 0 && mux <= side && muy >= 0 && muy <= side) {
			console.log(xc, yc, r,cMax);
			fillCounts(counts, side, xc, yc, r,cMax);
			drawMand(counts, side);
		} else {
			if (mux >= 0 && mux <= side && muy >= 0 && muy <= side) {
				var pixlen = Math.floor(Math.sqrt((mux-mdx)*(mux-mdx)+(muy-mdy)*(muy-mdy)));
				r = 2.0 * r * pixlen / side;
				console.log(xc, yc, r,cMax);
				fillCounts(counts, side, xc, yc, r,cMax);
				drawMand(counts, side);
			}
		}
		ongoingTouches.splice(idx, 1);
	}
}

function handleCancel(evt) {
  evt.preventDefault();
  console.log("touchcancel.");
  var touches = evt.changedTouches;
  
  for (var i = 0; i < touches.length; i++) {
    var idx = ongoingTouchIndexById(touches[i].identifier);
    ongoingTouches.splice(idx, 1);  // remove it; we're done
  }
}

function doMouseDown(evt){
	canx = evt.pageX;
	cany = evt.pageY;
	mdx = canx-canLX;
	mdy = cany-canUY;
	console.log("Down at x = " + mdx + " y = " + mdy);
	if (mdx >= 0 && mdx <= side && mdy >= 0 && mdy <= side) {
		xc = (xc-r)+2.0*(mdx*r)/side;
		yc = (yc+r)-2.0*(mdy*r)/side;
	}
}

function doMouseUp(evt){
	canx = evt.pageX;
	cany = evt.pageY;
	mux = canx-canLX;
	muy = cany-canUY;
	console.log("Up at   x = " + mux + " y = " + muy);
	if (mux == mdx && muy == mdy && mux >= 0 && mux <= side && muy >= 0 && muy <= side) {
		fillCounts(counts, side, xc, yc, r,cMax);
		drawMand(counts, side);
	} else {
		if (mux >= 0 && mux <= side && muy >= 0 && muy <= side) {
			var pixlen = Math.floor(Math.sqrt((mux-mdx)*(mux-mdx)+(muy-mdy)*(muy-mdy)));
			r = 2.0 * r * pixlen / side;
			fillCounts(counts, side, xc, yc, r,cMax);
			drawMand(counts, side);
		}
	}
}

function copyTouch({ identifier, pageX, pageY }) {
  return { identifier, pageX, pageY };
}

function ongoingTouchIndexById(idToFind) {
  for (var i = 0; i < ongoingTouches.length; i++) {
    var id = ongoingTouches[i].identifier;
    
    if (id == idToFind) {
      return i;
    }
  }
  return -1;    // not found
}

document.getElementById("btn01").addEventListener("click", function(){
  for ( let j = 0; j < side; j += 1) {
    for( let i = 0; i < side; i += 1) {
			if (counts[i][j] == cMax) {
					cR = xc-r+i*(2.0*r)/side;
					cI = yc+r-j*(2.0*r)/side;
					counts[i][j] = getMandCount(cR, cI, 2*cMax);
				}
		}
  }
cMax *= 2;
console.log("but01 x2 cMax = " + cMax);
// drawMand(counts, side);
});

document.getElementById("btn02").addEventListener("click", function(){
  for ( let j = 0; j < side; j += 1) {
    for( let i = 0; i < side; i += 1) {
			if (counts[i][j] > cMax/2) {
					counts[i][j] = cMax/2;
			}
		}
  }
	cMax = cMax / 2;
	console.log("but02 //2 cMax = " + cMax);
//	drawMand(counts, side);
});

document.getElementById("btn03").addEventListener("click", function(){
	r = r * 5.0;
	fillCounts(counts, side, xc, yc, r,cMax);
//	drawMand(counts, side);
});

document.getElementById("btn04").addEventListener("click", function(){
	r = r / 5.0;
	fillCounts(counts, side, xc, yc, r,cMax);
//	drawMand(counts, side);
});

document.getElementById("btn05").addEventListener("click", function(){
  for(let j = 0;j<10;j++) {
    let temp=colArray[0];
    for(let i = 0; i<ncol-1; i++) {
      colArray[i]=colArray[i+1];
    }
    colArray[ncol-1]=temp;
  }
//	drawMand(counts, side);
});

document.getElementById("btn06").addEventListener("click", function(){
  let temp=colArray[ncol-1];
  for(let i = ncol-1; i>0; i--) {
    colArray[i]=colArray[i-1];
  }
  colArray[0]=temp;
//	drawMand(counts, side);
});

document.getElementById("btn07").addEventListener("click", function(){
  bandMin += 10;
});

document.getElementById("btn08").addEventListener("click", function(){
  bandMin -= 1;
});

document.getElementById("btn09").addEventListener("click", function(){
  let myMin = cMax;
  for ( j = 0; j < side; j += 1) {
	  for( i = 0; i < side; i += 1) {
			if (counts[i][j] < myMin) myMin = counts[i][j];
			}
	}

  console.log("Button 9 band min = " + myMin)
  bandMin = myMin;
});

document.getElementById("btn11").addEventListener("click", function(){
  console.log("but11");
  ctx.fillStyle = "#7f7f7f";
  ctx.fillRect(0, 0, maxSize, maxSize);
  sizeIdx += 1;
  if (sizeIdx == sizeList.length) sizeIdx = 0;
  side = sizeList[sizeIdx];
  fillCounts(counts, side, xc, yc, r,cMax);
  drawMand(counts, side);
});

document.getElementById("btn16").addEventListener("click", function(){
  console.log("but16");
  ctx.fillStyle = "#7f7f7f";
  ctx.fillRect(0, 0, maxSize, maxSize);
  sizeIdx -= 1;
  if (sizeIdx < 0) sizeIdx = 0;
  side = sizeList[sizeIdx];
  fillCounts(counts, side, xc, yc, r,cMax);
  drawMand(counts, side);
});

document.getElementById("btn12").addEventListener("click", function(){
	console.log("but12");
  fillColorArray(0);
//  drawMand(counts, side);
});

document.getElementById("btn13").addEventListener("click", function(){
	console.log("but13");
  fillColorArray(1);
//  drawMand(counts, side);
});

document.getElementById("btn14").addEventListener("click", function(){
	console.log("but14");
  fillColorArray(2);
//  drawMand(counts, side);
});

document.getElementById("btn15").addEventListener("click", function(){
	console.log("but15");
  fillColorArray(3);
//  drawMand(counts, side);
});

document.getElementById("btn99").addEventListener("click", function(){
	console.log("but99");
  drawMand(counts, side);
});

function fillCounts(counts, side, xc, yc, r, cMax) {
  console.log("line 355 side = " + side + " size = " + size);
	for ( j = 0; j < side; j += 1) {
	  for( i = 0; i < side; i += 1) {
			cR = xc-r+i*(2.0*r)/side;
			cI = yc+r-j*(2.0*r)/side;
			counts[i][j] = getMandCount(cR, cI, cMax);
		}
	}
}

function getMandCount(cr, ci, cmax) {
  var bandMin = 0;
  var ncol = 256;
  var zr = 0.0;
  var zi = 0.0;
  var count = 0;
  var zrsqr = zr * zr;
  var zisqr = zi * zi;
  var a;
  var b;
  while ((zrsqr + zisqr <= 4.0) && (count < cmax)) {
    count++;
		// 4 original lines are Z^2 + C
		zi = zr * zi;
		zi += zi; // Multiply by two
		zi += ci; 
		zr = zrsqr - zisqr + cr;
    zrsqr = zr * zr; // square(z.r);
    zisqr = zi * zi;  //square(z.i);
  }
 return count;
}

function drawMand(counts, side) {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  console.log("Draw: side = " + side + " cMax = "+ cMax);
  for ( j = 0; j < side; j += 1) {
    for( let i = 0; i < side; i += 1) {
      ctx.fillStyle = setColor(counts[i][j]);
      ctx.fillRect(i, j, 1, 1);
    }
  }
	console.log("Drawn");
	console.log("xc = " + xc);
	console.log("yc = " + yc);
	console.log("r = " + r);
}

function setColor(myCount) {
	if(myCount == cMax) {
		return "rgb(0,0,0)";
	} else if(myCount < bandMin) {
		return "rgb(0,0,0)";
	} else {
		return colArray[myCount % ncol];
	}

	//return colText;
}

function Create2DArray(rows) {
  var arr = [];

  for (var i=0;i<rows;i++) {
     arr[i] = [];
  }

  return arr;
}

function fillColorArray(schemeNo) {
  console.log("Scheme Number: " + schemeNo);
	if (schemeNo == 0) {                        // 50 -ok 256- Shades of Gray
		for (let i=0; i<ncol; i++) {
			var rd = i % ncol;
			var gr = i % ncol;
			var bl = i % ncol;
			colArray[i] = "rgb(" + rd + ", " + gr + ", " + bl + ")";
		}
	} else if (schemeNo == 1) { // RANDOM
		for (let i=0; i<ncol; i++) {
			var rd = random255();
			var gr = random255();
			var bl = random255();
			colArray[i] = "rgb(" + rd + ", " + gr + ", " + bl + ")";
		}
	} else if (schemeNo == 2) { // RWB
	    nColInScheme = 4;
	    scheme[0] = [255, 0, 0];
	    scheme[1] = [255, 255, 255];
	    scheme[2] = [0, 0, 255];
	    scheme[3] = [255, 255, 255];
    	resetColors(scheme);
  }	else if (schemeNo == 3) { // ROYGBIV
	    nColInScheme = 7;
	    scheme[0] = [255, 0, 0];
	    scheme[1] = [255, 165, 0];
	    scheme[2] = [255, 255, 0];
	    scheme[3] = [0, 128, 0];
	    scheme[4] = [0, 0, 255];
	    scheme[5] = [75, 0, 130];
	    scheme[6] = [238, 130, 238];
		  resetColors(scheme);
	}
}

function resetColors(scheme) {
	var nBase = nColInScheme; // 3
	var width = 1.0*ncol/nBase; // 42
	for (let colNum=0;colNum<ncol;colNum++) { // 0 - 127
		var setNo = Math.floor((nBase * colNum) / ncol); //0 - 2
		var offset =(colNum - (setNo*(width))); //  had (int) at the beginning [0..127] - [0,42,84
		var colBottom = scheme[setNo];  
		var colTop = scheme[(setNo+1) % nBase];
		var frac = 1.0*offset/width;
		var rd = colBottom[0] + Math.floor(frac*(colTop[0]-colBottom[0]));
		var gr = colBottom[1] + Math.floor(frac*(colTop[1]-colBottom[1]));
		var bl = colBottom[2] + Math.floor(frac*(colTop[2]-colBottom[2]));
		if (rd<0) rd=0; if(rd>255) rd=255;
		if (gr<0) gr=0; if(gr>255) gr=255;
		if (bl<0) bl=0; if(bl>255) bl=255;
		colArray[colNum] = "rgb(" + rd + ", " + gr + ", " + bl + ")";
	}
}

function createAllButtons() {
  var btn01 = document.createElement("BUTTON");
      btn01.id = "btn01";
      btn01.innerText = "Count x2"; 
      btn01.style="position:fixed;left:"+ buttonLeft + "px;top:12px;height:20px;width:80px;" 
      document.body.appendChild(btn01);
  
  var btn02 = document.createElement("BUTTON");
      btn02.id = "btn02";
      btn02.innerText = "Count /2"; 
      btn02.style="position:fixed;left:"+ buttonLeft + "px;top:32px;height:20px;width:80px;" 
      document.body.appendChild(btn02);

  var btn03 = document.createElement("BUTTON");
      btn03.id = "btn03";
      btn03.innerText = "Zoom -5"; 
      btn03.style="position:fixed;left:"+ buttonLeft + "px;top:52px;height:20px;width:80px;" 
      document.body.appendChild(btn03);

  var btn04 = document.createElement("BUTTON");
      btn04.id = "btn04";
      btn04.innerText = "Zoom +5"; 
      btn04.style="position:fixed;left:"+ buttonLeft + "px;top:72px;height:20px;width:80px;" 
      document.body.appendChild(btn04);

  var btn05 = document.createElement("BUTTON");
      btn05.id = "btn05";
      btn05.innerText = "Col Sh 10"; 
      btn05.style="position:fixed;left:"+ buttonLeft + "px;top:92px;height:20px;width:80px;" 
      document.body.appendChild(btn05);

  var btn06 = document.createElement("BUTTON");
      btn06.id = "btn06";
      btn06.innerText = "Col Sh -1"; 
      btn06.style="position:fixed;left:"+ buttonLeft + "px;top:112px;height:20px;width:80px;" 
      document.body.appendChild(btn06);

  var btn07 = document.createElement("BUTTON");
      btn07.id = "btn07";
      btn07.innerText = "Min +10"; 
      btn07.style="position:fixed;left:"+ buttonLeft + "px;top:152px;height:20px;width:80px;" 
      document.body.appendChild(btn07);

  var btn08 = document.createElement("BUTTON");
      btn08.id = "btn08";
      btn08.innerText = "Min -1"; 
      btn08.style="position:fixed;left:"+ buttonLeft + "px;top:172px;height:20px;width:80px;" 
      document.body.appendChild(btn08);

  var btn09 = document.createElement("BUTTON");
      btn09.id = "btn09";
      btn09.innerText = "Min Blk"; 
      btn09.style="position:fixed;left:"+ buttonLeft + "px;top:132px;height:20px;width:80px;" 
      document.body.appendChild(btn09);

  var btn10 = document.createElement("BUTTON");
      btn10.id = "btn10";
      btn10.innerText = "btn10"; 
      btn10.style="position:fixed;left:"+ buttonLeft + "px;top:192px;height:20px;width:80px;" 
      document.body.appendChild(btn10);

  var btn11 = document.createElement("BUTTON");
      btn11.id = "btn11";
      btn11.innerText = "size +"; 
      btn11.style="position:fixed;left:"+ buttonLeft + "px;top:212px;height:20px;width:80px;" 
      document.body.appendChild(btn11);
  
   var btn16 = document.createElement("BUTTON");
      btn16.id = "btn16";
      btn16.innerText = "size -"; 
      btn16.style="position:fixed;left:"+ buttonLeft + "px;top:232px;height:20px;width:80px;" 
      document.body.appendChild(btn16);
  
  var btn12 = document.createElement("BUTTON");
      btn12.id = "btn12";
      btn12.innerText = "BW"; 
      btn12.style="position:fixed;left:"+ buttonLeft + "px;top:252px;height:20px;width:80px;" 
      document.body.appendChild(btn12);

  var btn13 = document.createElement("BUTTON");
      btn13.id = "btn13";
      btn13.innerText = "Rand"; 
      btn13.style="position:fixed;left:"+ buttonLeft + "px;top:272px;height:20px;width:80px;" 
      document.body.appendChild(btn13);

  var btn14 = document.createElement("BUTTON");
      btn14.id = "btn14";
      btn14.innerText = "RWB"; 
      btn14.style="position:fixed;left:"+ buttonLeft + "px;top:292px;height:20px;width:80px;" 
      document.body.appendChild(btn14);

  var btn15 = document.createElement("BUTTON");
      btn15.id = "btn15";
      btn15.innerText = "ROYGBIV"; 
      btn15.style="position:fixed;left:"+ buttonLeft + "px;top:312px;height:20px;width:80px;" 
      document.body.appendChild(btn15);

  var btn99 = document.createElement("BUTTON");
      btn99.id = "btn99";
      btn99.innerText = "Draw"; 
      btn99.style="position:fixed;left:"+ buttonLeft + "px;top:352px;height:40px;width:80px;" 
      document.body.appendChild(btn99);
}