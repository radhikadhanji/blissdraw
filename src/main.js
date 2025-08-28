var BlissDraw = /** @class */ (function () {
    function BlissDraw() {
        var _this = this;
        this.paint = false;
        //mouse elements
        this.clickX = [];
        this.clickY = [];
        this.clickDrag = [];
        this.eraseX = [];
        this.eraseY = [];
        this.eraseDrag = [];
        //drawing modes
        this.drawingMode = false;
        this.eraserMode = false;
        this.clearEventHandler = function () {
            _this.clearCanvas();
        };
        this.colourEventHandler = function () {
            _this.changeColour();
        };
        this.modeEventHandler = function () {
            _this.switchModes();
        };
        this.releaseEventHandler = function () {
            _this.paint = false;
            _this.drawingMode = false;
            _this.redraw();
        };
        this.cancelEventHandler = function () {
            _this.paint = false;
            _this.drawingMode = false;
        };
        this.pressEventHandler = function (e) {
            //handle the mouse position
            _this.drawingMode = true;
            var mouseX = e.changedTouches ?
                e.changedTouches[0].pageX :
                e.pageX;
            var mouseY = e.changedTouches ?
                e.changedTouches[0].pageY :
                e.pageY;
            mouseX -= _this.canvas.offsetLeft;
            mouseY -= _this.canvas.offsetTop;
            _this.paint = true;
            _this.addClick(mouseX, mouseY, false);
            _this.redraw();
        };
        this.dragEventHandler = function (e) {
            //handle the mouse position
            var mouseX = e.changedTouches ?
                e.changedTouches[0].pageX :
                e.pageX;
            var mouseY = e.changedTouches ?
                e.changedTouches[0].pageY :
                e.pageY;
            mouseX -= _this.canvas.offsetLeft;
            mouseY -= _this.canvas.offsetTop;
            if (_this.paint) {
                _this.addClick(mouseX, mouseY, true);
                _this.redraw();
            }
            e.preventDefault();
        };
        //Create drawing elements
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext("2d");
        if (!context) {
            throw new Error("There is no context!!!");
        }
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = 'black';
        context.lineWidth = 1;
        this.canvas = canvas;
        this.context = context;
        this.redraw();
        this.createUserEvents();
    }
    BlissDraw.prototype.createUserEvents = function () {
        var _this = this;
        var canvas = this.canvas;
        //Event listeners for all mouse movements
        canvas.addEventListener("mousedown", this.pressEventHandler);
        canvas.addEventListener("mousemove", this.dragEventHandler);
        canvas.addEventListener("mouseup", this.releaseEventHandler);
        canvas.addEventListener("mouseout", this.cancelEventHandler);
        //Event listeners for touched
        canvas.addEventListener("touchstart", this.pressEventHandler);
        canvas.addEventListener("touchmove", this.dragEventHandler);
        canvas.addEventListener("touchend", this.releaseEventHandler);
        canvas.addEventListener("touchcancel", this.cancelEventHandler);
        //Event listeners for buttons
        document.getElementById('clear').addEventListener("click", this.clearEventHandler);
        document.getElementById('colour').addEventListener("click", this.colourEventHandler);
        document.getElementById('modes').addEventListener("click", this.modeEventHandler);
        document.getElementById('sizeSlider').addEventListener("input", function () {
            var currentSize = document.getElementById('sizeSlider').value;
            _this.context.lineWidth = parseInt(currentSize);
        });
    };
    BlissDraw.prototype.redraw = function () {
        var clickX = this.clickX;
        var context = this.context;
        var clickDrag = this.clickDrag;
        var clickY = this.clickY;
        var eraseX = this.eraseX;
        var eraseY = this.eraseY;
        var eraseDrag = this.eraseDrag;
        //Draw the path of the line
        if (!this.eraserMode) {
            for (var i = 0; i < clickX.length; ++i) {
                context.beginPath();
                if (clickDrag[i] && i) {
                    //Draw the dragged path
                    context.moveTo(clickX[i - 1], clickY[i - 1]);
                }
                else {
                    context.moveTo(clickX[i] - 1, clickY[i]);
                }
                context.lineTo(clickX[i], clickY[i]);
                context.stroke();
            }
            context.closePath();
        }
        else {
            //eraser functionality
            for (var i = 0; i < eraseX.length; ++i) {
                if (eraseDrag[i] && i) {
                    context.clearRect(eraseX[i - 1], eraseY[i - 1], context.lineWidth, context.lineWidth);
                }
                else {
                    context.clearRect(eraseX[i] - 1, eraseY[i], context.lineWidth, context.lineWidth);
                }
                context.clearRect(eraseX[i], eraseY[i], context.lineWidth, context.lineWidth);
            }
        }
    };
    BlissDraw.prototype.addClick = function (x, y, dragging) {
        if (!this.eraserMode) {
            this.clickX.push(x);
            this.clickY.push(y);
            this.clickDrag.push(dragging);
        }
        else {
            this.eraseX.push(x);
            this.eraseY.push(y);
            this.eraseDrag.push(dragging);
        }
    };
    BlissDraw.prototype.clearCanvas = function () {
        //Reset canvas and arrays
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.clickX = [];
        this.clickY = [];
        this.clickDrag = [];
        this.eraseX = [];
        this.eraseY = [];
        this.eraseDrag = [];
    };
    BlissDraw.prototype.switchModes = function () {
        //Switch between drawing and eraser modes
        var modeButton = document.getElementById('modes');
        this.eraserMode = !this.eraserMode;
        if (this.eraserMode) {
            modeButton.textContent = "Switch to Drawing mode";
        }
        else {
            modeButton.textContent = "Switch to Eraser mode";
        }
    };
    BlissDraw.prototype.changeColour = function () {
        //Change the colour of the pen
        this.context.strokeStyle = "red";
    };
    return BlissDraw;
}());
new BlissDraw();
//# sourceMappingURL=main.js.map