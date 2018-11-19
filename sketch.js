UFO=function(img,speed,ratio) {
	this.img=img;
	this.x=random(0,width);
	this.y=random(0,height);
	this.ratio=ratio;
	this.speed=speed;
	this.skewX=random(-10*this.speed,10*this.speed);
	this.skewY=random(-10*this.speed,10*this.speed);
	this.display=function() {
		image(this.img,this.x,this.y,this.img.width/this.ratio,this.img.height/this.ratio);
	}
	
	this.move=function() {
		this.x+=random(this.skewX-(2*this.speed+2),this.skewX+(2*this.speed+2));
		this.y+=random(this.skewY-(2*this.speed+2),this.skewY+(2*this.speed+2));

		let jump=random(100);
		let reappear=random(100);
		let freeze=random(100);
		if(jump<=(this.speed/2)) {
			this.x+=floor(random(-80,80));
		 	this.y+=floor(random(-80,80));
		}
		if(reappear<=(this.speed/10)) {
			this.x=random(0,width);
			this.y=random(0,height);
			this.skewX*=.3;
			this.skewY*=.3;
		}
		if(freeze<=.5*this.speed) {
			this.skewX=random(-3*this.speed,3*this.speed);
			this.skewY=random(-3*this.speed,3*this.speed);
		}

		this.fixSkew();
	}
	this.fixSkew=function() {
		if(this.x<0) {
			this.skewX=5;
		}
		if(this.x>width) {
			this.skewX=-5;
		}
		if(this.y<0) {
			this.skewY=5;
		}
		if(this.y>height) {
			this.skewY=-5;
		}
		if(this.x<.75*width&&this.x>.25*width) {
			this.skewX*=random(.98,1.01);
		}
		if(this.y<.75*height&&this.y>.75*height) {
			this.skewY*=random(.95,1);
		}
	}

	this.contains=function(xPos,yPos) {
		let dx=abs(this.x-xPos);
		let dy=abs(this.y-yPos);
		let a=pow(dx,2);
		let b=pow(dy,2);
		let dist=sqrt(a+b);
		if(dist<=(this.img.height/(1.4*this.ratio))) {
			return true;
		}
		return false;
	}	
}

Explosion=function(vid,x,y) {
	this.vid=vid;
	this.x=x;
	this.y=y;
	this.w=70;
	this.h=70;
	vid.play();
	this.display=function() {
		image(this.vid,this.x,this.y,this.w,this.h);
	}
}

Words=function(txt,x,y) {
    this.txt=txt;
    this.display=function() {
        textSize(15);
        fill(255);
        text(this.txt,x,y);
    }
}

var ufoList=[];
var currSpeed=1;
var ammoMsg;
var scoreMsg;
var ammo=10;
var score=0;
var lost=false;
var laser;
var explosionList=[];
var explosionVids=[];
var currRatio=2;
var explosionSound;
var spaceMusic;
var musicSpeed=.8;
var loseScream;
var loseSound;
var ufoPics=[];
var spewShips;
var replayButton;


/*add value system for each individual ship
*/
function preload() {
	ufoPics.push(loadImage("assets/ufo0.png"));
	laser=loadSound(["assets/laser.mp3","assets/laser.flac"]);
	explosionSound=loadSound("assets/explosion.flac");
	for(var i=0; i<4; i++) {
		let explosionVid=createVideo("assets/explosionVid.mov");
		explosionVid.hide();
		explosionVid.volume(0);
		explosionVids.push(explosionVid);
	}
}


function setup() {
	let can=createCanvas(windowWidth,windowHeight);
	can.position(0,0);
	frameRate(35);
	select("#gamename").html("UFO Takedown");
	noCursor();
	angleMode(DEGREES);
	imageMode(CENTER);
	rectMode(CENTER);
	strokeWeight(1);
	for(var i=0; i<4; i++) {
		ufoList.push(new UFO(ufoPics[floor(random(ufoPics.length))],currSpeed,currRatio));
	}
	
	scoreMsg=new Words("Your Score: "+score,5,20);
	ammoMsg=new Words("Ammunition: "+ammo,5,40);

	laser.setVolume(.5);
	explosionSound.setVolume(15);
	spaceMusic=loadSound(["assets/spaceMusic.mp3","assets/spaceMusic.flac"],function(){
		if(!lost) {
			spaceMusic.setVolume(3);
			spaceMusic.loop();
			spaceMusic.rate(musicSpeed);
		}
	});
	for(var i=1; i<4; i++) {
		let ufo=loadImage("assets/ufo"+i+".png",function(){ufoPics.push(ufo);})
	}
	loseScream=loadSound("assets/loseScream.wav");
	loseSound=loadSound(["assets/loseSound.mp3","assets/loseSound.flac"]);

	replayButton={
		buttonWidth:100,
		buttonHeight:40,
		x:width/2,
		y:height/2+40,
		display:function(strk){
			push();
			noStroke();
			if(strk) {
				stroke(0);
				strokeWeight(strk);
			}
			fill(255,0,0);
			rect(this.x,this.y,this.buttonWidth,this.buttonHeight);
			fill(200,200,0);
			textSize(15);
			text("Play Again?",this.x-35,this.y+5)
			pop();
		},
		contains:function(xPos,yPos){
			let xLeft=this.x-this.buttonWidth/2;
			let xRight=this.x+this.buttonWidth/2;
			let yTop=this.y-this.buttonHeight/2;
			let yBottom=this.y+this.buttonHeight/2;
			return xPos>xLeft&&xPos<xRight&&yPos>yTop&&yPos<yBottom;
		}
	};
}

function draw() {
	background(0);
	scoreMsg.display();
	ammoMsg.display();
	
	for(var i=0; i<explosionList.length; i++) {
		explosionList[i].display();
		if(explosionList[i].vid.duration()==explosionList[i].vid.time()) {
			explosionVids.push(explosionList.splice(i,1)[0].vid);
		}
	}

	for(var i=0; i<ufoList.length; i++) {
		ufoList[i].move();
		ufoList[i].display();
	}

	if(onCanvas(mouseX,mouseY)&&!lost) {
		drawReticle(mouseX,mouseY,20,5);
	}

	if(lost&&explosionList.length==0) {
		fill(255);
		textSize(20);
		text("You Lost! The UFOs are taking over!",width/2-175,height/2-25);
		fill(255,255,0);
		text("Score: "+score,width/2-40,height/2);
		replayButton.display();
	}

	if(lost&&replayButton.contains(mouseX,mouseY)&&explosionList.length==0) {
		replayButton.display(2);
	}
}

function drawReticle(x,y,d,off) {
	noFill();
	stroke(0,255,0);
	if(mouseIsPressed) {
		strokeWeight(3)
	}
	arc(x+off,y+off,d,d,0,90);
	arc(x-off,y+off,d,d,90,180);
	arc(x-off,y-off,d,d,180,270);
	arc(x+off,y-off,d,d,270,360);
	strokeWeight(1);
	noStroke();
	fill(255,0,0);
	ellipse(x,y,d/5,d/5);
}

function mousePressed() {
	if(!lost&&onCanvas(mouseX,mouseY)) {
		laser.play();
		let hit=false;
		for(var i=ufoList.length-1; i>=0; i--) {
			if(ufoList[i].contains(mouseX,mouseY)) {
				let explosion=explosionVids.splice(0,1)[0];
				explosionList.push(new Explosion(explosion,ufoList[i].x,ufoList[i].y));
				explosionSound.play();
				if(currRatio<3.2) {
					currRatio+=.04;
				}
				if(musicSpeed<=1.2) {
					musicSpeed+=.02
				}
				ufoList.splice(i,1);
				currSpeed+=.4;//////////change
				ammo+=3;
				score++;
				hit=true;
				setTimeout(addUfo,3000);
				spaceMusic.rate(musicSpeed); 
			}
		}
		if(!hit) {
			ammo--;
		}
		scoreMsg.txt=("Your Score: "+score);
		ammoMsg.txt=("Ammunition: "+ammo);
		if(ammo==0) {
			loseGame();
		}
	}else if(replayButton.contains(mouseX,mouseY)) {
		resetGame();
	}
}

function addUfo() {
	ufoList.push(new UFO(ufoPics[floor(random(ufoPics.length))],currSpeed, currRatio));
	if(lost&&ufoList.length>=500) {
		ufoList.splice(0,1);
	}
}

function loseGame() {
	currSpeed=3.2;
	let expl=new Explosion(explosionVids.splice(0,1)[0],width/2,height/2);
	expl.w=width*1.5;
	expl.h=height*1.3;
	explosionList.push(expl);
	explosionSound.setVolume(30);
	explosionSound.play();
	lost=true;
	setTimeout(function(){
		loseSound.setVolume(15);
		loseSound.play();
	},500);
	setTimeout(function(){
		loseScream.setVolume(10);
		loseScream.play();
	},4000);
	spewShips=setInterval(addUfo,1000);
	spaceMusic.stop();
	setTimeout(function(){cursor();},4100);

}

function onCanvas(x,y) {
	if(x<0||x>width||y<0||y>height) {
		return false;
	}
	return true;
}

function resetGame() {
	clearInterval(spewShips);
	noCursor();
	ammo=10;
	score=0;
	ufoList=[];
	for(var i=0; i<explosionList.length; i++) {
		explosionVids.push(explosionList[i].vid);
	}
	explosionList=[];
	for(var i=0; i<4; i++) {
		ufoList.push(new UFO(ufoPics[floor(random(ufoPics.length))],currSpeed,currRatio));
	}
	musicSpeed=.8;
	laser.setVolume(.5);
	explosionSound.setVolume(15);
	spaceMusic.setVolume(3);
	spaceMusic.loop();
	spaceMusic.rate(musicSpeed);
	currSpeed=1;
	currRatio=2;
	lost=false;
	background(0);
}
