class BlissDraw{
    //canvas elements
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private paint: boolean;

    //mouse elements
    private clickX: number[] = [];
    private clickY: number[] = [];
    private clickDrag: boolean[] = [];

    constructor() {
        //Create drawing elements
        let canvas = document.getElementById('canvas') as HTMLCanvasElement;
        let context = canvas.getContext("2d");
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

        document.getElementById('clear').addEventListener("click", this.clearEventHandler);

    }

    private redraw(){
        let clickX = this.clickX;
        let context = this.context;
        let clickDrag = this.clickDrag;
        let clickY = this.clickY;
        //Draw the path of the line
        for(let i = 0; i < clickX.length; ++i){
            context.beginPath();
            if(clickDrag[i] && i){
                //Draw the dragged path
                context.moveTo(clickX[i - 1], clickY[i - 1]);
            }
            else{
                context.moveTo(clickX[i] - 1, clickY[i]);
            }
            context.lineTo(clickX[i], clickY[i]);
            context.stroke();
        }
        context.closePath();
    }
    
}

new BlissDraw();