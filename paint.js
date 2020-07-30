// bind canvas to listeners
var canvas = document.getElementById('canvas');
canvas.addEventListener('mousedown', mouseDown, false);
canvas.addEventListener('mousemove', mouseMove, false);
canvas.addEventListener('mouseup', mouseUp, false);
canvas.addEventListener('mouseout', mouseUp, false);
var ctx = canvas.getContext('2d');

ctx.lineWidth = 5;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.lineStyle = 'rgb(0, 0, 0)';

var painting = false;
var lastx = 0;
var lasty = 0;

// create canvas for memory
var memCanvas = document.createElement('canvas');
memCanvas.width = canvas.width;
memCanvas.height = canvas.height;
var memCtx = memCanvas.getContext('2d');
var points = [];

function mouseDown(e) {
    var m = getMouse(e, canvas);
    points.push({
        x: m.x,
        y: m.y
    });
    painting = true;
};

function mouseMove(e) { 
        if(painting) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // put back the saved content
            ctx.drawImage(memCanvas, 0, 0);
            var m = getMouse(e, canvas);
            points.push({
                x: m.x,
                y: m.y
            });
            drawPoints(ctx, points);
        }
    };

function mouseUp(e) {
    // save stroke to memory
    if(painting) {
        painting = false;
        memCtx.clearRect(0, 0, canvas.width, canvas.height);
        memCtx.drawImage(canvas, 0, 0);
        points = []; // flush points array and memory canvas
    }
};

function drawPoints(ctx, points) {
    // draw a basic circle when not enough points are given
    if(points.length === 1)  {
        return
    } else if(points.length < 6) {
        var b = points[0];
        ctx.beginPath(), ctx.arc(b.x, b.y, ctx.lineWidth / 2, 0, Math.PI * 2, !0), ctx.closePath(), ctx.fill();
        return
    }
    ctx.beginPath(), ctx.moveTo(points[0].x, points[0].y);
    // draw a bunch of quadratics, use the average of two points as the control point
    for(i = 1; i < points.length - 2; i++) {
        var c = (points[i].x + points[i + 1].x) / 2,
            d = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, c, d)
    }
    ctx.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y), ctx.stroke()
};

// fetch accurate mouse position
function getMouse(e, canvas) {
    var element = canvas, offsetX = 0, offsetY = 0, mx, my;

    if (element.offsetParent !== undefined) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
    }

    mx = e.pageX - offsetX;
    my = e.pageY - offsetY;

    return {x: mx, y: my};
}

// html buttons
document.getElementById('button_clear').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    memCtx.clearRect(0, 0, canvas.width, canvas.height);
}, false);

document.getElementById('button_download').addEventListener('click', () => {
    // var dataURL = canvas.toDataURL('image/png'); // save canvas to a png image
    document.write('<img src="'+img+'"/>'); // write to the document an image source
    getElementById('button_download').setAttribute("href", image); // redirect to download link
});

// brush control
function changeBrush(type, value) {
    switch(type) {
        case 'increase':
            ctx.lineWidth += value;
            break;
        case 'decrease':
            ctx.lineWidth -= value;
            break;
        case 'color':
            ctx.lineStyle = value;
            break;
    }
};