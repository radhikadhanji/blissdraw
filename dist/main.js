var BlissDraw = /** @class */ (function () {
    function BlissDraw() {
        var _this = this;
        this.paint = false;
        this.backgroundColour = "#ffffff";
        this.eraserMode = false;
        //Lines arrays
        this.lines = [];
        this.undoneLines = [];
        this.currentStroke = [];
        this.clearEventHandler = function () {
            _this.clearCanvas();
        };
        this.modeEventHandler = function () {
            _this.switchModes();
        };
        this.undoEventHandler = function () {
            _this.undoLine();
        };
        this.redoEventHandler = function () {
            _this.redoLine();
        };
        this.exportEventHandler = function () {
            _this.exportImage();
        };
        this.releaseEventHandler = function () {
            _this.paint = false;
            if (_this.currentStroke.length > 0) {
                //If there's a current stroke, add this on 
                _this.lines.push(_this.currentStroke);
                _this.currentStroke = [];
                _this.undoneLines = [];
            }
            _this.redraw();
        };
        this.cancelEventHandler = function () {
            _this.paint = false;
        };
        this.pressEventHandler = function (e) {
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
        context.fillStyle = 'white';
        context.lineWidth = 1;
        this.canvas = canvas;
        this.context = context;
        var textBox = document.createElement('input');
        var fileArea = document.getElementById('filename');
        textBox.type = "text";
        textBox.placeholder = "Enter a file name";
        textBox.maxLength = 50;
        fileArea.appendChild(textBox);
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
        //Colour inputs
        document.getElementById('colour').addEventListener("input", function () {
            var currentColour = document.getElementById('colour').value;
            _this.context.strokeStyle = currentColour;
        });
        document.getElementById('background').addEventListener("input", function () {
            var currentColour = document.getElementById('background').value;
            _this.backgroundColour = currentColour;
            _this.redraw();
        });
        document.getElementById('modes').addEventListener("click", this.modeEventHandler);
        //Size inputs
        document.getElementById('sizeSlider').addEventListener("input", function () {
            var currentSize = document.getElementById('sizeSlider').value;
            _this.context.lineWidth = parseInt(currentSize);
        });
        document.getElementById('undo').addEventListener("click", this.undoEventHandler);
        document.getElementById('redo').addEventListener("click", this.redoEventHandler);
        document.getElementById('export').addEventListener("click", this.exportEventHandler);
    };
    BlissDraw.prototype.redraw = function () {
        var _this = this;
        var context = this.context;
        // Reset the background and everything
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        context.fillStyle = this.backgroundColour;
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        var drawStroke = function (stroke) {
            //Drawing all strokes helper method
            for (var i = 0; i < stroke.length; i++) {
                var point = stroke[i];
                context.save();
                context.beginPath();
                context.lineWidth = point.size;
                context.strokeStyle = point.mode === "erase" ? _this.backgroundColour : point.colour;
                if (point.dragging && i > 0) {
                    //Move to the next part of the stroke
                    context.moveTo(stroke[i - 1].x, stroke[i - 1].y);
                }
                else {
                    //Finish off the stroke
                    context.moveTo(point.x - 1, point.y);
                }
                context.lineTo(point.x, point.y);
                context.stroke();
                context.closePath();
                context.restore();
            }
        };
        for (var _i = 0, _a = this.lines; _i < _a.length; _i++) {
            var stroke = _a[_i];
            drawStroke(stroke);
        }
        if (this.paint && this.currentStroke.length > 0) {
            drawStroke(this.currentStroke);
        }
    };
    BlissDraw.prototype.addClick = function (x, y, dragging) {
        var line = {
            x: x,
            y: y,
            dragging: dragging,
            size: this.context.lineWidth,
            colour: !this.eraserMode ? this.context.strokeStyle : undefined,
            mode: this.eraserMode ? "erase" : "draw"
        };
        //Add line to the stroke
        this.currentStroke.push(line);
    };
    BlissDraw.prototype.clearCanvas = function () {
        //Reset canvas and arrays
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.lines = [];
        this.undoneLines = [];
        this.redraw();
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
    BlissDraw.prototype.undoLine = function () {
        var prevLine = this.lines.pop();
        if (prevLine) {
            this.undoneLines.push(prevLine);
            this.redraw();
        }
    };
    BlissDraw.prototype.redoLine = function () {
        var prevLine = this.undoneLines.pop();
        if (prevLine) {
            this.lines.push(prevLine);
            this.redraw();
        }
    };
    BlissDraw.prototype.exportImage = function () {
        //Convert the canvas to url and make anchor
        var url = this.canvas.toDataURL("image/png");
        var createEl = document.createElement('a');
        createEl.href = url;
        //Download the image
        var fileNameInput = document.querySelector("#filename input");
        var fileValue = (fileNameInput === null || fileNameInput === void 0 ? void 0 : fileNameInput.value.trim()) || "blissdraw";
        createEl.download = fileValue;
        createEl.click();
        createEl.remove();
    };
    return BlissDraw;
}());
new BlissDraw();
//# sourceMappingURL=main.js.map