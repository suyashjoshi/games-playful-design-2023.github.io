
var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};



let charaters = ["T", "I", "G", "H", "T", "R", "O", "P", "E"];
let count = 9;
let pluckers = [];
let pitch = (isMobile.any())? 90 : 60;
let cHeight;
let cWidth;

let myFont;

function preload(){
    myFont = loadFont("Assets/impact.ttf");
}

function setup() {
    pixelDensity(1);
    /*
    if(isMobile.any()){
        frameRate(60);
    }else{
        frameRate(60);
    }
    */
    let canvasParent = document.getElementById('banner');
    createCanvas(canvasParent.offsetWidth, canvasParent.offsetHeight).parent(canvasParent);
    setupPluckers();
    textFont(myFont);
    
    cHeight = canvasParent.offsetHeight;
    cWidth = canvasParent.offsetWidth;
}
function setupPluckers() {
    let canvasParent = document.getElementById('banner');
    cHeight = canvasParent.offsetHeight;
    angleMode(DEGREES);
    for (let i = 1; i <= count; i++) {
        let x = -width / (count * 2) + (i * width / count);
        pluckers.push(new Plucker(x, i, Math.ceil(i / 2)));
    }
}
function windowResized() {
    let canvasParent = document.getElementById('banner');
    resizeCanvas(canvasParent.offsetWidth, canvasParent.offsetHeight);
    pluckers.length = 0;
    setupPluckers();
}
function draw() {
    background('#01006C');
    for (let p of pluckers) {
        p.show();
        //if( !isMobile.any() ){
            if (mouseY >= 0 && mouseY <= height) {
                if (((pmouseX < p.x && mouseX > p.x) || (pmouseX > p.x && mouseX < p.x))) {
                    p.wamp = width / pitch;
                }
    
            }
        //}
      
    }
}


class Plucker {
    constructor(x, id, nodes) {
        this.x = x;
        this.id = id;
        this.chara = charaters[this.id - 1];
        this.wamp = width / random(120, 180);															//Startup vibration
        this.damp = 0;
        this.nodes = nodes;
    }
    show() {


        let canvasParent = document.getElementById('banner');
        let cvs_width = canvasParent.offsetWidth;
        let ratio_responsive = 150 / 1500;
        let weight_ratio = 125 / 15000;



        stroke(246 - 0.7 * this.wamp, 194 - 0.7 * this.wamp, 244 - 0.7 * this.wamp);
        strokeWeight(2);																							//String weight
        this.wamp += this.damp;
        this.damp -= this.wamp;
        let lastx = this.x;
        let lasty = 0;
        let steps = this.nodes * 180 / height;
        let unitLength = (isMobile.any())? 70 : 4;

        //Draw the line(s)
        for (let y = 0; lasty <= cHeight; y += unitLength) {
            let x = this.x + this.wamp * sin(steps * y);
            line(x, y, lastx, lasty);
            lastx = x;
            lasty = y;
            if(y < cHeight && y + unitLength >= cHeight){
                line(this.x, cHeight, lastx, lasty);
            }
        }


        //Draw the word
        push();
        rectMode(CENTER);
        textAlign(CENTER);
        fill('#01006C');

        let text_weight = cvs_width * weight_ratio;
        strokeWeight(text_weight);	        //Test weight
        
        let text_size = cvs_width * ratio_responsive;									//responsive text size												
        textSize(text_size);																									//Text size

        text(this.chara, this.x, height / 2);
        pop();

        if (Math.abs(this.wamp) + Math.abs(this.damp) < width / 500) {
            this.wamp = width/random(120, 220);													  //Random vibration
        } else {
            this.damp *= 0.97;   																					//Falloff rate
        }
    }
}