
const string1 = "Hidden Worlds"; //words to be displayed
const size = 120; //font size
const showText = true; //whether or not to have an overlay of the original text (in the background color)
const textAlpha = 1; //the alpha of the text if displayed (low value will make it slowly fade in)
const backgroundColor = 0; //kinda self-explanatory
const strokeAlpha = 60; //the alpha of the lines (lower numbers are more transparent)
const strokeColor = 255; //the line color

const fontSampleFactor = 0.3; //How many points there are: the higher the number, the closer together they are (more detail)

const noiseZoom = 0.006; //how zoomed in the perlin noise is
const noiseOctaves = 4; //The number of octaves for the noise
const noiseFalloff = 0.5; //The falloff for the noise layers

const zOffsetChange = 0; //How much the noise field changes in the z direction each frame
const individualZOffset = 0; //how far away the points/lines are from each other in the z noise axies (the bigger the number, the more chaotic)

const lineSpeed = .5; //the maximum amount each point can move each frame

const newPointsCount = 9; //the number of new points added when the mouse is dragged

let font;
let points = [];
let startingPoints;
let systems;
let soundEffect;

function preload(){
    font = loadFont("Assets/impact.ttf");
    soundFormats('mp3', 'ogg');
    soundEffect = loadSound('Assets/siguiente.mp3');
}

function setup() {
  let canvasParent = document.getElementById('banner');
  createCanvas(canvasParent.offsetWidth, canvasParent.offsetHeight).parent(canvasParent);
  textFont(font);
  
  cHeight = canvasParent.offsetHeight;
  cWidth = canvasParent.offsetWidth;
  systems = [];

  textFont(font);
	textSize(size);
	fill(backgroundColor, textAlpha);
	stroke(strokeColor, strokeAlpha);
	noiseDetail(noiseOctaves, noiseFalloff);

	startingPoints = font.textToPoints(string1, width / 2 - textWidth(string1) / 2, height / 2-120, size, {"sampleFactor": fontSampleFactor});
	// startingPoints = font.textToPoints(string2, width / 2 - textWidth(string2) / 2, height / 2, size, {"sampleFactor": fontSampleFactor});
	// startingPoints = font.textToPoints(string3, width / 2 - textWidth(string3) / 2, height / 2, size, {"sampleFactor": fontSampleFactor});

	
	for (let p = 0; p < startingPoints.length; p++) {
		points[p] = startingPoints[p];
		points[p].zOffset = random();
  }
} 

function draw() {
  background(51);
  background(0);
  for (i = 0; i < systems.length; i++) {
    systems[i].run();
    systems[i].addParticle();
  }
  if (systems.length == 0) {
    fill(255);
    textAlign(CENTER);
  }
  if(showText){
		noStroke();
		text(string1, width / 2 - textWidth(string1) / 2, height);
		stroke(strokeColor, strokeAlpha);
	}
	for (let pt = 0; pt < points.length; pt++) {
		let p = points[pt];
		let noiseX = p.x * noiseZoom;
		let noiseY = p.y * noiseZoom;
		let noiseZ = frameCount * zOffsetChange + p.zOffset*individualZOffset;
		let newPX = p.x + map(noise(noiseX, noiseY, noiseZ), 0, 1, -lineSpeed, lineSpeed);
		let newPY = p.y + map(noise(noiseX, noiseY, noiseZ + 214), 0, 1, -lineSpeed, lineSpeed);
		line(p.x, p.y, newPX, newPY);
		p.x = newPX;
		p.y = newPY;
	}
}

function mousePressed() {
  this.p = new ParticleSystem(createVector(mouseX, mouseY));
  systems.push(p);
  soundEffect.play();
}

// A simple Particle class
let Particle = function(position) {
  this.acceleration = createVector(0, 0.05);
  this.velocity = createVector(random(-1, 1), random(-1, 0));
  this.position = position.copy();
  this.lifespan = 255.0;
};

Particle.prototype.run = function() {
  this.update();
  this.display();
};

// Method to update position
Particle.prototype.update = function(){
  this.velocity.add(this.acceleration);
  this.position.add(this.velocity);
  this.lifespan -= 2;
};

// Method to display
Particle.prototype.display = function () {
  stroke(200, this.lifespan);
  strokeWeight(2);
  fill(127, this.lifespan);
  ellipse(this.position.x, this.position.y, 12, 12);
};

// Is the particle still useful?
Particle.prototype.isDead = function () {
  if (this.lifespan < 0) {
    return true;
  } else {
    return false;
  }
};

let ParticleSystem = function (position) {
  this.origin = position.copy();
  this.particles = [];
};

ParticleSystem.prototype.addParticle = function () {
  // Add either a Particle or CrazyParticle to the system
  if (int(random(0, 2)) == 0) {
    p = new Particle(this.origin);
  }
  else {
    p = new CrazyParticle(this.origin);
  }
  this.particles.push(p);
};

ParticleSystem.prototype.run = function () {
  for (let i = this.particles.length - 1; i >= 0; i--) {
    let p = this.particles[i];
    p.run();
    if (p.isDead()) {
      this.particles.splice(i, 1);
    }
  }
};

// A subclass of Particle

function CrazyParticle(origin) {
  // Call the parent constructor, making sure (using Function#call)
  // that "this" is set correctly during the call
  Particle.call(this, origin);

  // Initialize our added properties
  this.theta = 0.0;
};

// Create a Crazy.prototype object that inherits from Particle.prototype.
// Note: A common error here is to use "new Particle()" to create the
// Crazy.prototype. That's incorrect for several reasons, not least
// that we don't have anything to give Particle for the "origin"
// argument. The correct place to call Particle is above, where we call
// it from Crazy.
CrazyParticle.prototype = Object.create(Particle.prototype); // See note below

// Set the "constructor" property to refer to CrazyParticle
CrazyParticle.prototype.constructor = CrazyParticle;

// Notice we don't have the method run() here; it is inherited from Particle

// This update() method overrides the parent class update() method
CrazyParticle.prototype.update=function() {
  Particle.prototype.update.call(this);
  // Increment rotation based on horizontal velocity
  this.theta += (this.velocity.x * this.velocity.mag()) / 10.0;
}

// This display() method overrides the parent class display() method
CrazyParticle.prototype.display=function() {
  // Render the ellipse just like in a regular particle
  Particle.prototype.display.call(this);
  // Then add a rotating line
  push();
  translate(this.position.x, this.position.y);
  rotate(this.theta);
  stroke(255, this.lifespan);
  line(0, 0, 25, 0);
  pop();
}

function mouseDragged() {
	for (let i = 0; i < newPointsCount; i++) {
		let angle = random(TAU);
		let magnitude = randomGaussian() * ((newPointsCount-1)**0.5*3);
		let newPoint = {
			"x": mouseX + magnitude * cos(angle),
			"y": mouseY + magnitude * sin(angle),
			"zOffset": random()
		};
		points[points.length] = newPoint;
		startingPoints[startingPoints.length] = newPoint;
	}
}
