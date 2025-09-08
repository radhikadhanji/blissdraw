//Line objects
    type Line = {
        x: number,
        y: number,
        dragging: boolean,
        size: number,
        colour?: string,
        mode: "draw" | "erase";
    };

    type Stroke = Line[];

class BlissDraw{
    //canvas elements
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private paint: boolean = false;
    private backgroundColour: string = "#ffffff";

    //drawing modes
    private drawingMode = false;
    private eraserMode = false;

    //Lines arrays
    private lines: Stroke[] = [];
    private undoneLines: Stroke[] = [];
    private currentStroke: Stroke = [];

    constructor() {
        //Create drawing elements
        let canvas = document.getElementById('canvas') as HTMLCanvasElement;
        let context = canvas.getContext("2d");
        if(!context){
            throw new Error("There is no context!!!");
        }
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = 'black';
        context.fillStyle = 'white';
        context.lineWidth = 1;

        this.canvas = canvas;
        this.context = context;

        const textBox = document.createElement('input');
        const fileArea = document.getElementById('filename');
        textBox.type = "text";
        textBox.placeholder = "Enter a file name";
        textBox.maxLength = 50;
        fileArea.appendChild(textBox);
        
        this.redraw();
        this.createUserEvents();
    }

    private createUserEvents() {
        let canvas = this.canvas;
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
        document.getElementById('colour').addEventListener("input", () => {
            let currentColour = (document.getElementById('colour') as HTMLInputElement).value;
            this.context.strokeStyle = currentColour;
        });
        document.getElementById('background').addEventListener("input", () => {
            let currentColour = (document.getElementById('background') as HTMLInputElement).value;
            this.backgroundColour = currentColour;
            this.redraw();
        });

        document.getElementById('modes').addEventListener("click", this.modeEventHandler);

        //Size inputs
        document.getElementById('sizeSlider').addEventListener("input", () => {
            let currentSize = (document.getElementById('sizeSlider') as HTMLInputElement).value;
            this.context.lineWidth = parseInt(currentSize);
        });

        document.getElementById('undo').addEventListener("click", this.undoEventHandler);
        document.getElementById('redo').addEventListener("click", this.redoEventHandler);
        document.getElementById('export').addEventListener("click", this.exportEventHandler);
    }

    private redraw(){
    let context = this.context;

    // Reset the background and everything
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.fillStyle = this.backgroundColour;
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const drawStroke = (stroke: Stroke) => {
        //Drawing all strokes helper method
        for (let i = 0; i < stroke.length; i++) {
            const point = stroke[i];
            context.save();
            context.beginPath();
            context.lineWidth = point.size;
            context.strokeStyle = point.mode === "erase" ? this.backgroundColour : point.colour!;

            if (point.dragging && i > 0) {
                //Move to the next part of the stroke
                context.moveTo(stroke[i - 1].x, stroke[i - 1].y);
            } else {
                //Finish off the stroke
                context.moveTo(point.x - 1, point.y);
            }
            context.lineTo(point.x, point.y);
            context.stroke();
            context.closePath();
            context.restore();
        }
    };
    for (const stroke of this.lines) {
        drawStroke(stroke);
    }
    if (this.paint && this.currentStroke.length > 0) {
        drawStroke(this.currentStroke);
    }
}


    private addClick(x: number, y: number, dragging: boolean){
        let line: Line = {
        x,
        y,
        dragging,
        size: this.context.lineWidth,
        colour: !this.eraserMode ? this.context.strokeStyle as string : undefined,
        mode: this.eraserMode ? "erase" : "draw"
        };
        //Add line to the stroke
        this.currentStroke.push(line);
    }

    private clearCanvas(){
        //Reset canvas and arrays
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
        this.lines = [];
        this.undoneLines = [];
        this.redraw();
    }

    private switchModes(){
        //Switch between drawing and eraser modes
        let modeButton = document.getElementById('modes');
        this.eraserMode = !this.eraserMode;
        if(this.eraserMode){
            modeButton.textContent = "Switch to Drawing mode";
        }
        else{
            modeButton.textContent = "Switch to Eraser mode";
        }
    }

    private undoLine(){
        var prevLine = this.lines.pop();
        if(prevLine){
            this.undoneLines.push(prevLine);
            this.redraw();
        }
    }

    private redoLine(){
        var prevLine = this.undoneLines.pop();
        if(prevLine){
            this.lines.push(prevLine);
            this.redraw();
        }
    }

    private exportImage(){
        //Convert the canvas to url and make anchor
        let url = this.canvas.toDataURL("image/png");
        const createEl = document.createElement('a');
        createEl.href = url;
        //Download the image
        const fileNameInput = document.querySelector("#filename input") as HTMLInputElement;
        let fileValue = fileNameInput?.value.trim() || "blissdraw";
        createEl.download = fileValue;
        createEl.click();
        createEl.remove();
    }

    private clearEventHandler = () => {
        this.clearCanvas();
    }

    private modeEventHandler = () => {
        this.switchModes();
    }

    private undoEventHandler = () => {
        this.undoLine();
    }

    private redoEventHandler = () => {
        this.redoLine();
    }

    private exportEventHandler = () => {
        this.exportImage();
    }

    private releaseEventHandler = () => {
        this.paint = false;
        this.drawingMode = false;
        if(this.currentStroke.length > 0){
            //If there's a current stroke, add this on 
            this.lines.push(this.currentStroke);
            this.currentStroke = [];
            this.undoneLines = [];
        }
        this.redraw();
    }

    private cancelEventHandler = () => {
        this.paint = false;
        this.drawingMode = false;
    }
    
    private pressEventHandler = (e: MouseEvent | TouchEvent) => {
        //handle the mouse position
        this.drawingMode = true;
        let mouseX = (e as TouchEvent).changedTouches ?
                     (e as TouchEvent).changedTouches[0].pageX :
                     (e as MouseEvent).pageX;
        let mouseY = (e as TouchEvent).changedTouches ?
                     (e as TouchEvent).changedTouches[0].pageY :
                     (e as MouseEvent).pageY;
        mouseX -= this.canvas.offsetLeft;
        mouseY -= this.canvas.offsetTop;

        this.paint = true;
        this.addClick(mouseX, mouseY, false);
        this.redraw();
    }

    private dragEventHandler = (e: MouseEvent | TouchEvent) => {
        //handle the mouse position
        let mouseX = (e as TouchEvent).changedTouches ?
                     (e as TouchEvent).changedTouches[0].pageX :
                     (e as MouseEvent).pageX;
        let mouseY = (e as TouchEvent).changedTouches ?
                     (e as TouchEvent).changedTouches[0].pageY :
                     (e as MouseEvent).pageY;
        mouseX -= this.canvas.offsetLeft;
        mouseY -= this.canvas.offsetTop;

        if (this.paint){
            this.addClick(mouseX, mouseY, true);
            this.redraw();
        }
        e.preventDefault();
    }
    
}

new BlissDraw();