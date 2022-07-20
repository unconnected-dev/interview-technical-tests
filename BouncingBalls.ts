/**
 * @author Paul Bennett
 * @description Bouncing Balls 
 *              This requires PixiJS and TweenMax 
 *              1. Draw bouncing balls on a screen
 *              2. Draw buttons on screen with functionality to stop, start, add and remove balls
 *              3. Add effects using TweenMax
 */


const DEBUG:                    boolean = true;
const CANVAS_WIDTH:             number  = 500;
const CANVAS_HEIGHT:            number  = 300;
const CANVAS_COLOR:             number  = 0x84BCDA;
const BALL_SPAWN_INDENT:        number  = 100;      //Indent to ensure spawn balls away from canvas edge
const MIN_NUMBER_OF_BALLS:      number  = 20;       //Minimum number of balls to initially generate
const MAX_NUMBER_OF_BALLS:      number  = 30;       //Maximum number of balls to initially generate
const TOTAL_BALL_COLORS:        number  = 4;        //Total number of colors balls can be set to (req for getBallColor())
const TOTAL_BALL_BORDER_COLORS: number  = 1;        //Total number of colors the border (req for getBallBorderColor())
const BALL_MINSIZE:             number  = 25;       //Minimum size of a ball (diameter)
const BALL_MAXSIZE:             number  = 50;       //Maximum size of a ball (diameter)
const BALL_BORDERMINSIZE:       number  = 0;        //Minimum size of a balls border
const BALL_BORDERMAXSIZE:       number  = 0;        //Maximum size of a balls border
const BALL_MINSPEED:            number  = 1;        //Minimum speed of a ball
const BALL_MAXSPEED:            number  = 3;        //Maximum speed of a ball
const BALL_ARRAY:               Ball[]  = [];       //Stores the balls
const BALL_DESTROY_ARRAY:       Ball[]  = [];       //Store to destroy the balls once ready

const BOUNDARY_X1:              number  = 0;
const BOUNDARY_Y1:              number  = 0;
const BOUNDARY_X2:              number  = BOUNDARY_X1 + CANVAS_WIDTH;
const BOUNDARY_Y2:              number  = BOUNDARY_Y1 + CANVAS_HEIGHT;

//Button styling
const BUTTON_COLOR:             number  = 0x067BC2;   
const BUTTON_BORDER_COLOR:      number  = 0xffffff;    
const BUTTON_TEXT_COLOR:        number  = 0xffffff;
const BUTTON_WIDTH:             number  = 100;
const BUTTON_HEIGHT:            number  = 50;
const BUTTON_BORDER_SIZE:       number  = 2;
const BUTTON_CORNER_RADIUS:     number  = 10;
const BUTTON_CANVAS_INDENT:     number  = 10;       //Set buttons away from canvas edge
const BUTTON_STYLE                      = new PIXI.TextStyle({
                                            fontFamily: 'Arial',
                                            fontSize:   10,
                                            fontWeight: "bold",
                                            fill:       [BUTTON_TEXT_COLOR],
                                        });

  
  
/* Enums - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
//#region Enums
enum ballcolors{
    _color_1 = 0xD95D39,
    _color_2 = 0xF18805,
    _color_3 = 0xF0A202,
    _color_4 = 0x067BC2,
    _error   = 0xff000      //ignore in TOTAL_BALL_COLORS
}
 
enum ballbordercolors{
    _color_1 = 0x0E1428,
    _error   = 0xff000      //ignore in TOTAL_BALL_BORDER_COLORS
}
 
enum boundarycollision{
    _none,
    _left_side,
    _right_side,
    _top_side,
    _bot_side
}
 
//For random color selection
function getBallColor(j: number): ballcolors{
    switch(j){
        case 0:  return ballcolors._color_1; break;
        case 1:  return ballcolors._color_2; break;     
        case 2:  return ballcolors._color_3; break;
        case 3:  return ballcolors._color_4; break;
        default: return ballcolors._error;   break;
    }
}
  
function getBallBorderColor(j: number): ballbordercolors{
    switch(j){
        case 0:  return ballbordercolors._color_1; break; 
        default: return ballbordercolors._error;   break;
    }
}
//#endregion Enums
  
  
  
/* Support Functions - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
//#region Support Functions
//Return random integer between two numbers
function getIntBetween(min: number, max: number): number{
    return Math.floor(Math.random() * (max - min + 1) + min) 
}
//#endregion Support Functions
 
  
  
/* Classes - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
//#region Classes
class Drawable{
    protected _x: number;
    protected _y: number;

    constructor(_x: number, _y: number){
        this._x = _x;
        this._y = _y;
    }

    public getDrawableDescription(): string{
        return `Drawable ${this._x}, ${this._y}`;
    }
}
  
class Ball extends Drawable{
    private _balldiameter:         number;
    private _ballradius:           number;
    private _ballbordersize:       number;
    private _ballcolor:            ballcolors;
    private _ballbordercolor:      ballbordercolors;
    private _balldirection:        number;
    private _ballspeed:            number;
    private _ballxmotion:          number;
    private _ballymotion:          number;
    private _ballgraphic:          any;
    private _ballbeingeddestroyed: boolean;

    constructor(_x: number, _y: number){
        super(_x, _y);
        //The ball styling is randomized
        this._ballbordersize       = getIntBetween(BALL_BORDERMINSIZE, BALL_BORDERMAXSIZE);
        this._balldiameter         = getIntBetween(BALL_MINSIZE, BALL_MAXSIZE) - (this._ballbordersize * 2);
        this._ballradius           = this._balldiameter / 2;
        this._ballcolor            = getBallColor(getIntBetween(0, TOTAL_BALL_COLORS - 1));
        this._ballbordercolor      = getBallBorderColor(getIntBetween(0, TOTAL_BALL_BORDER_COLORS - 1));
        this._balldirection        = getIntBetween(1, 360);
        this._ballspeed            = getIntBetween(BALL_MINSPEED, BALL_MAXSPEED);
        this._ballxmotion          = Math.sin(this._balldirection) * this._ballspeed;
        this._ballymotion          = Math.cos(this._balldirection) * this._ballspeed;
        this._ballbeingeddestroyed = false;

        //Create ball graphic
        this._ballgraphic = new PIXI.Graphics();
        this._ballgraphic.lineStyle(this._ballbordersize, this._ballbordercolor, 1);
        this._ballgraphic.beginFill(this._ballcolor);
        this._ballgraphic.drawCircle(0, 0, this._ballradius);
        this._ballgraphic.x = this._x;
        this._ballgraphic.y = this._y;
        botcontainer.addChild(this._ballgraphic);
        
        this.introAnimation();
    }
 
    public getGraphicAlpha():number{
        return this._ballgraphic.alpha;
    }

    private invertBallXMotion(): void{
        this._ballxmotion = -this._ballxmotion;
    }
 
    private invertBallYMotion(): void{
        this._ballymotion = -this._ballymotion;
    }
 
    private predictBallXPos(): number{
        return this._x + this._ballxmotion;
    }
 
    private predictBallYPos(): number{
        return this._y + this._ballymotion;
    }
 
    public updateBall(): void{

        //Prediction to prevent ball going past boundary in a single tick
        let ball_future_x_pos:number = this.predictBallXPos();
        let ball_future_y_pos:number = this.predictBallYPos();

        //Check ball direction
        let ball_going_left:boolean = true;  if(this._ballxmotion > 0) ball_going_left = false;
        let ball_going_up:boolean   = true;  if(this._ballymotion > 0) ball_going_up = false;

        //Check ball against boundary
        if(ball_going_left && (ball_future_x_pos - this._ballradius) < BOUNDARY_X1){
            //if(DEBUG) console.log("hit x: " + a_ball._x);
            this.invertBallXMotion();
            this.moveBall(boundarycollision._left_side);
        }
        else if(!ball_going_left && (ball_future_x_pos + this._ballradius) > BOUNDARY_X2){
            //if(DEBUG) console.log("hit x: " + a_ball._x);
            this.invertBallXMotion();
            this.moveBall(boundarycollision._right_side);
        }
        else if(ball_going_up && (ball_future_y_pos - this._ballradius) < BOUNDARY_Y1){
            //if(DEBUG) console.log("hit y: " + a_ball._y);
            this.invertBallYMotion();
            this.moveBall(boundarycollision._top_side);
        } 
        else if(!ball_going_up && (ball_future_y_pos + this._ballradius) > BOUNDARY_Y2){
            //if(DEBUG) console.log("hit y: " + a_ball._y);
            this.invertBallYMotion();
            this.moveBall(boundarycollision._bot_side);
        }
        else
            this.moveBall(boundarycollision._none);
    }

    private moveBall(collision: boundarycollision): void{
        let ball_new_x_pos:number = this._x + this._ballxmotion;
        let ball_new_y_pos:number = this._y + this._ballymotion;

        //To make the ball hit the edge
        switch(collision){
            case boundarycollision._none:                                                                                  break;
            case boundarycollision._left_side:  ball_new_x_pos = 0             + this._ballradius; this.bounceAnimation(); break;
            case boundarycollision._right_side: ball_new_x_pos = CANVAS_WIDTH  - this._ballradius; this.bounceAnimation(); break;
            case boundarycollision._top_side:   ball_new_y_pos = 0             + this._ballradius; this.bounceAnimation(); break;
            case boundarycollision._bot_side:   ball_new_y_pos = CANVAS_HEIGHT - this._ballradius; this.bounceAnimation(); break;
            default: 
                ball_new_x_pos = 0;
                ball_new_y_pos = 0;
                if(DEBUG) 
                    console.log("Update Ball Boundary Collision Default!");
                break;
        }
 
        this._x = ball_new_x_pos;
        this._y = ball_new_y_pos;
 
        this._ballgraphic.x = this._x;
        this._ballgraphic.y = this._y;
    }

    private introAnimation(): void{
        TweenMax.fromTo(this._ballgraphic.scale, 0.5, {x: 0, y: 0}, {x: 1, y: 1, ease: "Elastic.easeOut"});
    }

    private bounceAnimation(): void{
        //This is to prevent ball that is being destroyed from scaling back up if it is about to hit a wall
        if(this._ballbeingeddestroyed === false)
            TweenMax.fromTo(this._ballgraphic.scale, 0.5, {x: 0.9, y: 0.9}, {x: 1, y: 1, ease: "Elastic.easeOut"});
    }

    //Initiates animation to for ball being destroyed
    public ballOut(): void{
        this._ballbeingeddestroyed = true;
        TweenMax.to(this._ballgraphic, 0.3, {alpha: 0, ease: "Power2.easeIn"});
        TweenMax.fromTo(this._ballgraphic.scale, 0.3, {x: 1, y: 1}, {x: 0, y: 0, ease: "Elastic.easeOut"});
        console.log("Animating out a ball");
    }

    public destroyBall(): void{
        this._ballgraphic.destroy();
    }
 
    public getBallDescription(): string{
        let desc =  `${this.getDrawableDescription()}, balldiameter: ${this._balldiameter}, ballradius ${this._ballradius}, ballbordersize: ${this._ballbordersize}`;
            desc += `, balldirection: ${this._balldirection}, ballspeed ${this._ballspeed}, ballxmotion: ${this._ballxmotion}, ballymotion: ${this._ballymotion}`;
        return desc;
    }
}
 
class Button extends Drawable{
    protected _buttonwidth:            number;
    protected _buttonheight:           number;
    protected _buttonbordersize:       number;
    protected _buttoncornerradius:     number;
    protected _buttontext:             string;
    protected _buttonxpos:             number;
    protected _buttonypos:             number;
    protected _buttontextstyle:        any;
    protected _buttongraphic:          any;
    protected _buttontextobject:       any;
 
    constructor(_x: number, _y: number, _buttontext: string){
        super(_x, _y);
        this._buttonwidth        = BUTTON_WIDTH;
        this._buttonheight       = BUTTON_HEIGHT;
        this._buttonbordersize   = BUTTON_BORDER_SIZE;
        this._buttoncornerradius = BUTTON_CORNER_RADIUS;
        this._buttontext         = _buttontext;
        this._buttonxpos         = this._x + (this._buttonwidth / 2);
        this._buttonypos         = this._y + (this._buttonheight / 2);
 
        //Style for text graphic
        this._buttontextstyle    = BUTTON_STYLE;
 
        //Create button graphic
        this._buttongraphic = new PIXI.Graphics();
        this._buttongraphic.alpha = 1;
        this._buttongraphic.lineStyle(this._buttonbordersize, BUTTON_BORDER_COLOR, 1);
        this._buttongraphic.beginFill(BUTTON_COLOR);
        this._buttongraphic.drawRoundedRect(0, 0, this._buttonwidth, this._buttonheight, this._buttoncornerradius);
        
        this._buttongraphic.x = this._buttonxpos;
        this._buttongraphic.y = this._buttonypos;
        this._buttongraphic.pivot.x += this._buttonwidth / 2;
        this._buttongraphic.pivot.y += this._buttonheight / 2;
        this._buttongraphic.interactive = true;
        this._buttongraphic.buttonMode = true;
        //stage.addChild(this._buttongraphic);          //Added in the extended buttons
 
        //Create text object
        this._buttontextobject = new PIXI.Text(this._buttontext, this._buttontextstyle);
        //Center text in the button
        this._buttontextobject.x = this._buttonxpos;
        this._buttontextobject.y = this._buttonypos;
        this._buttontextobject.anchor.set(0.5 ,0.5);
        //stage.addChild(this._buttontextobject);      //Added in the extended buttons
    }

    protected getButtonYPos(): number{
        return this._buttonypos;
    }
 
    protected onClick(): void{
        //Overwritten in the extended
    }
 
    protected introAnimation(_delay: number): void{
        TweenMax.fromTo([this._buttongraphic, this._buttontextobject], 2, {y: 0 - (this._buttonheight*2), alpha: 0}, {y: this.getButtonYPos(), alpha: 1, ease: "Elastic.easeOut", delay:_delay});
    }

    protected onClickAnimation(): void{
        TweenMax.fromTo([this._buttongraphic.scale, this._buttontextobject.scale], 1, {x: 0.5, y:0.5}, {x: 1, y: 1, yoyo: true, ease: "Elastic.easeOut"});
    }

    public getButtonDescription(): string{
        let desc =  `${this.getDrawableDescription()}, buttonwidth: ${this._buttonwidth}, buttonheight: ${this._buttonheight}, buttonbordersize: ${this._buttonbordersize}`;
            desc += `, buttoncornerradius: ${this._buttoncornerradius}, buttontext: ${this._buttontext}, buttontextxpos: ${this._buttonxpos}, buttontextypos: ${this._buttonypos}`;
        return desc;
    }
}

class OnOffButton extends Button{
    private _buttonactive: boolean;

    constructor(_x: number, _y: number, _buttontext: string){
        super(_x, _y, _buttontext);
        this._buttonactive = false;
        this._buttongraphic.addListener('pointerdown', () => {this.onClick();});
        topcontainer.addChild(this._buttongraphic);
        topcontainer.addChild(this._buttontextobject);

        this.introAnimation(0);
    }

    //If true the button is on and the balls can move
    public getButtonActive(): boolean{
        return this._buttonactive;
    }
 
    protected onClick(): void{
        if(this._buttonactive){this._buttonactive = false; console.log("Stop all");}
        else                  {this._buttonactive =  true; console.log("Start all");}
        
        this.onClickAnimation();
    }
}
 
class AddButton extends Button{
     
    constructor(_x: number, _y: number, _buttontext: string){
        super(_x, _y, _buttontext);
        this._buttongraphic.addListener('pointerdown', () => {this.onClick();});
        topcontainer.addChild(this._buttongraphic);
        topcontainer.addChild(this._buttontextobject);

        this.introAnimation(0.5);
    }
  
    protected onClick(): void{
        let random_x_coord:number = getIntBetween(0 + BALL_SPAWN_INDENT, CANVAS_WIDTH - BALL_SPAWN_INDENT);
        let random_y_coord:number = getIntBetween(0 + BALL_SPAWN_INDENT, CANVAS_HEIGHT - BALL_SPAWN_INDENT);
     
        let a_ball:Ball = new Ball(random_x_coord, random_y_coord);
        BALL_ARRAY.push(a_ball);
 
        console.log("Added a ball");

        this.onClickAnimation();
    }
}
 
class RemoveButton extends Button{
     
    constructor(_x: number, _y: number, _buttontext: string){
        super(_x, _y, _buttontext);
        this._buttongraphic.addListener('pointerdown', () => {this.onClick();});
        topcontainer.addChild(this._buttongraphic);
        topcontainer.addChild(this._buttontextobject);
        
        this.introAnimation(1.0);
    }
 
    protected onClick(): void{
        let a_ball = BALL_ARRAY.pop();
        if(a_ball != null){
            console.log("Removing a ball");
            a_ball.ballOut();
            BALL_DESTROY_ARRAY.push(a_ball);
        }
        else
            console.log("No balls to remove");
    
        this.onClickAnimation();
    }
}
//#endregion Classes
  
 
  
/* Add PIXI - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
//#region Add PIXI
const app = new PIXI.Application({
    width:           CANVAS_WIDTH,
    height:          CANVAS_HEIGHT,
    antialias:       true,
    transparent:     false,
    resolution:      1,
    backgroundColor: CANVAS_COLOR
});
  
    document.body.appendChild(app.view);
    const stage = app.stage;
//#endregion Add PIXI


 
/* Create Containers - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
const botcontainer = new PIXI.Container();
stage.addChild(botcontainer);
 
const topcontainer = new PIXI.Container();
stage.addChild(topcontainer);
 
 
     
/* Create Balls - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
let numberofballs:number = getIntBetween(MIN_NUMBER_OF_BALLS, MAX_NUMBER_OF_BALLS);
if(DEBUG)
    console.log("Initial Number Of Balls: " + numberofballs);
 
function createABall(){
    let random_x_coord:number = getIntBetween(0 + BALL_SPAWN_INDENT, CANVAS_WIDTH - BALL_SPAWN_INDENT);
    let random_y_coord:number = getIntBetween(0 + BALL_SPAWN_INDENT, CANVAS_HEIGHT - BALL_SPAWN_INDENT);
 
    let a_ball = new Ball(random_x_coord, random_y_coord);
    BALL_ARRAY.push(a_ball);
     
    //if(DEBUG && (random_x_coord < 0 + BALL_SPAWN_INDENT || random_x_coord > CANVAS_WIDTH - BALL_SPAWN_INDENT 
    //    || random_y_coord < 0 + BALL_SPAWN_INDENT || random_y_coord > CANVAS_HEIGHT - BALL_SPAWN_INDENT))
    //    console.log("Ball: " + i + " OUTSIDE BOUNDARY! " + a_ball.getBallDescription());
}
 
for(let i = 0; i < numberofballs; i++){
    createABall();
}
  
 
 
/* Create Buttons - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
let button_first_x_pos:  number = 0 + BUTTON_CANVAS_INDENT;
let button_mid_x_pos:    number = (CANVAS_WIDTH / 2) - (BUTTON_WIDTH / 2);
let button_last_x_pos:   number = CANVAS_WIDTH - BUTTON_WIDTH - BUTTON_CANVAS_INDENT;
let button_general_y_pos:number = CANVAS_HEIGHT - BUTTON_HEIGHT - BUTTON_CANVAS_INDENT;
const button_on     = new OnOffButton(button_first_x_pos, button_general_y_pos, "On / Off");
const button_add    = new AddButton(button_mid_x_pos,     button_general_y_pos, "Add");
const button_remove = new RemoveButton(button_last_x_pos, button_general_y_pos, "Remove");
 
 
 
/* Ticker - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
app.ticker.add(() => {
 
    if(button_on.getButtonActive()){
        //Go through each ball and update its position
        for(let i = 0; i < BALL_ARRAY.length; i++){
            let a_ball:Ball = BALL_ARRAY[i];
            a_ball.updateBall();
        }
        //Keep moving balls that are being destroyed
        for(let i = 0; i < BALL_DESTROY_ARRAY.length; i++){
            let a_ball:Ball = BALL_DESTROY_ARRAY[i];
            a_ball.updateBall();
        }
    }

    //Destroy a ball when it has reached alpha 0
    if(BALL_DESTROY_ARRAY.length > 0){
        let a_ball_to_destroy = BALL_DESTROY_ARRAY.shift();
        if(a_ball_to_destroy != null && a_ball_to_destroy.getGraphicAlpha() === 0){
            a_ball_to_destroy.destroyBall();
            a_ball_to_destroy = undefined;
            console.log("Destroyed a ball");
        }
        else if(a_ball_to_destroy != null){
            BALL_DESTROY_ARRAY.unshift(a_ball_to_destroy);
            //console.log("A ball is not ready to destroy " + a_ball_to_destroy.getGraphicAlpha());
        }
        else
            console.log("A ball was shifted but not destroyed?");
    }
});