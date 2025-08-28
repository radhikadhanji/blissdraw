class BlissDraw{
    //canvas elements
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private paint: boolean = false;

    //mouse elements
    private clickX: number[] = [];
    private clickY: number[] = [];
    private clickDrag: boolean[] = [];
    private eraseX: number[] = [];
    private eraseY: number[] = [];
    private eraseDrag: boolean[] = [];

    //line elements
    private clickColour: string[] = [];
    private clickSize: number[] = [];

    //drawing modes
    private drawingMode = false;
    private eraserMode = false;

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
        context.lineWidth = 1;

        this.canvas = canvas;
        this.context = context;
        
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
        document.getElementById('colour').addEventListener("input", () => {
            let currentColour = (document.getElementById('colour') as HTMLInputElement).value;
            this.context.strokeStyle = currentColour;
        });
        document.getElementById('modes').addEventListener("click", this.modeEventHandler);
        document.getElementById('sizeSlider').addEventListener("input", () => {
            let currentSize = (document.getElementById('sizeSlider') as HTMLInputElement).value;
            this.context.lineWidth = parseInt(currentSize);
        });
    }

    private redraw(){
        let clickX = this.clickX;
        let context = this.context;
        let clickDrag = this.clickDrag;
        let clickY = this.clickY;
        let eraseX = this.eraseX;
        let eraseY = this.eraseY;
        let eraseDrag = this.eraseDrag;
        let clickColour = this.clickColour;
        let clickSize = this.clickSize;

        //Draw the path of the line
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
             for(let i = 0; i < clickX.length; ++i){
            context.beginPath();
            if(clickDrag[i] && i){
                //Draw the dragged path if it exists
                context.moveTo(clickX[i - 1], clickY[i - 1]);
            }
            else{
                //Finish off the path
                context.moveTo(clickX[i] - 1, clickY[i]);
            }
            context.lineTo(clickX[i], clickY[i]);
            context.strokeStyle = clickColour[i];
            context.lineWidth = clickSize[i];
            context.stroke();
        }
        context.closePath();
        
            //eraser functionality
            for(let i = 0; i < eraseX.length; ++i){
                if(eraseDrag[i] && i){
                    context.clearRect(eraseX[i - 1], eraseY[i - 1], context.lineWidth, context.lineWidth);
                }
                else{
                    context.clearRect(eraseX[i] - 1, eraseY[i], context.lineWidth, context.lineWidth);
                }
                context.clearRect(eraseX[i], eraseY[i], context.lineWidth, context.lineWidth);
        }
       
    }

    private addClick(x: number, y: number, dragging: boolean){
        if(!this.eraserMode){
            this.clickX.push(x);
            this.clickY.push(y);
            this.clickDrag.push(dragging);
            this.clickColour.push(this.context.strokeStyle as string);
            this.clickSize.push(this.context.lineWidth);
        }
        else{
            this.eraseX.push(x);
            this.eraseY.push(y);
            this.eraseDrag.push(dragging);
        }
    }

    private clearCanvas(){
        //Reset canvas and arrays
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
        this.clickX = [];
        this.clickY = [];
        this.clickDrag = [];
        this.eraseX = [];
        this.eraseY = [];
        this.eraseDrag = [];
        this.clickColour = [];
        this.clickSize = [];
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


    private clearEventHandler = () => {
        this.clearCanvas();
    }

    private modeEventHandler = () => {
        this.switchModes();
    }

    private releaseEventHandler = () => {
        this.paint = false;
        this.drawingMode = false;
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