// creating reference to document and setting up width and height of the canvas
const canvas = document.querySelector('.myCanvas');
const width = canvas.width = 320;
const height = canvas.height = 480;

let frames = 0;
//creating 2d context 
const ctx = canvas.getContext('2d');

// loading sprite's
const sprite = new Image();
sprite.src = "image/sprite.png";

let Degree = Math.PI / 180;

//defining game state 
const state = {
    current: 0,
    gameStart:0,
    game:1,
    gameOver:2,
} 

const scored = new Audio();
const hit = new Audio();
const flap = new Audio();
const swoosh = new Audio();
const die = new Audio();

scored.src ="audio/point.wav";
hit.src ="audio/hit.wav";
flap.src ="audio/flap.wav";
swoosh.src ="audio/swoosh.wav";
die.src ="audio/die.wav";

// identifying start button axis 
const startBtn = {
    x:120,
    y:263,
    w:83,
    h:29
}

canvas.addEventListener('click',(evt)=>{
    switch (state.current){
        case state.gameStart:
            state.current = state.game;
            swoosh.play();
            break;
        
        case state.game:
            bird.flap();
            flap.play();
            break;
        
        case state.gameOver:
            let rect = canvas.getBoundingClientRect();
            let clickX = evt.clientX - rect.left;
            let clickY = evt.clientY - rect.top;
    
            if(clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h){
                pipes.reset();
                bird.speedReset();
                scores.reset();
                state.current = state.gameStart;
            break;
    }
}
});

// drawing backgorund to the canvas
const backGround = {
    sourceX:0,
    sourceY:0,
    w:275,
    h:226,
    x:0,
    y:height - 226,
    draw: function(){
        ctx.drawImage(sprite,this.sourceX,this.sourceY,this.w,this.h,this.x,this.y,this.w,this.h);
        ctx.drawImage(sprite,this.sourceX,this.sourceY,this.w,this.h,this.x + this.w,this.y,this.w,this.h);
    }
}

// drawing foreground to canvas
const foreGround = {
    sourceX:276,
    sourceY:0,
    w:224,
    h:112,
    x:0,
    y:height-112,
    dx:2,

    draw: function(){
        ctx.drawImage(sprite,this.sourceX,this.sourceY,this.w,this.h,this.x ,this.y,this.w,this.h);
        ctx.drawImage(sprite,this.sourceX,this.sourceY,this.w,this.h,this.x + this.w,this.y,this.w,this.h);
    },

    update: function(){
        if(state.current == state.game){
            this.x = (this.x - this.dx) % (this.w/2);
        }
    }

}


// drawing bird
const bird = {
    animation : [
        {sourceX:276 ,sourceY:112},
        {sourceX:276 ,sourceY:139},
        {sourceX:276 ,sourceY:164},
        {sourceX:276 ,sourceY:139},
    ],
    w:34,
    h:26,
    x:50,
    y:150, 
    frame:0,
    gravity:0.25,
    jump:4.5,
    speed:0,
    rotation:0,
    radius:12,

    draw: function(){
        let bird = this.animation[this.frame];
        ctx.save();
        ctx.translate(this.x,this.y)
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite,bird.sourceX,bird.sourceY,this.w,this.h,-this.w/2,-this.h/2,this.w,this.h);
        ctx.restore();
    },
    flap: function(){
        this.speed = -this.jump;
    },
    update: function(){
        this.period = (state.current == state.gameStart) ? 10:5;
        this.frame += (frames % this.period ==0 )?1:0;
        this.frame = this.frame % this.animation.length;

        if(state.current == state.gameStart){
            this.y = 150;
            this.rotation = 0 * Degree;
        }else{

            this.speed += this.gravity;
            this.y += this.speed;

            if(this.y + this.h/2 >= height - foreGround.h){
                this.y = height - foreGround.h - this.h/2;
                if(state.current == state.game){
                    state.current = state.gameOver;
                    die.play();
                }
            }

            if(this.speed >= this.jump){
                this.rotation = 90*Degree;
                this.frame = 1;
            }else{
                this.rotation = -25 *Degree;
            }  
                
            }
        },
        speedReset: function(){
            this.speed =0;
        }

    }

// darwing pipes to canvas    
const pipes = {
        position:[],
        top:{
            sourceX:553,
            sourceY:0
        },
        bottom:{
            sourceX:502,
            sourceY:0
        },
        w:53,
        h:400,
        gap:85,
        maxYpos:-150,
        dx:2,
        draw: function(){
            for (let i=0;i<this.position.length;i++){
                let p = this.position[i];
                let topYpos = p.y;
                let bottomYpos = p.y + this.h + this.gap;
    
                // drawing top pipe
                ctx.drawImage(sprite,this.top.sourceX,this.top.sourceY,this.w,this.h,p.x ,topYpos,this.w,this.h);
                // drawing bottom pipe
                ctx.drawImage(sprite,this.bottom.sourceX,this.bottom.sourceY,this.w,this.h,p.x ,bottomYpos,this.w,this.h);
             }
        },
    
        update: function(){
            if(state.current !== state.game) return;
    
            if(frames%100 == 0){
                this.position.push({
                    x:width,
                    y:this.maxYpos * ( Math.random() +1 )
                });
            }
            for(let i=0;i<this.position.length;i++){
                let p = this.position[i];
    
                let bottomPipe = p.y + this.h +this.gap;
                if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius <p.y +this.h){
                    hit.play();
                    state.current = state.gameOver;

                }
    
                if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipe && bird.y - bird.radius < bottomPipe + this.h){
                    hit.play();
                    state.current = state.gameOver;
                }
                p.x -=this.dx;
                
                if(p.x + this.w <= 0){
                    this.position.shift();
                    scores.value +=1;
                    scored.play();
                    scores.best = Math.max(scores.value,scores.best);
                    localStorage.setItem('best',scores.best);
                }
               
            }
        },
        reset: function(){
            this.position = [];
        }
    
    }
    
// drawing scores to screen
const scores = {
    best:parseInt(localStorage.getItem('best')) || 0,
    value:0,
    draw: function(){
        ctx.fillStyle = '#FFF';
        ctx.strokeStyle ="#000";
        if(state.current == state.game){
            ctx.lineWidth = 1;
            ctx.font = "35px Teko";
            ctx.fillText(this.value,width/2,50);
            ctx.strokeText(this.value,width/2,50);
        }else if(state.current == state.gameOver){
            ctx.font = "35px Teko";
            ctx.fillText(this.value,225,186);
            ctx.strokeText(this.value,225,186);
            ctx.fillText(this.best,225,228);
            ctx.strokeText(this.best,225,228);

        }
    },
    reset: function(){
        this.value = 0;
    }
}

// drawing ongamestart screen
const startScreen = {
    sourceX:0,
    sourceY:229,
    w:173,
    h:152,
    x:width/2 -173/2,
    y:80,
    draw: function(){
        if(state.current == state.gameStart){
            ctx.drawImage(sprite,this.sourceX,this.sourceY,this.w,this.h,this.x ,this.y,this.w,this.h);
        }
    }
}

const gameOverScreen = {
    sourceX:174,
    sourceY:228,
    w:225,
    h:202,
    x:width/2 - 225/2,
    y:90,
    draw: function(){
        if(state.current == state.gameOver){
            ctx.drawImage(sprite,this.sourceX,this.sourceY,this.w,this.h,this.x ,this.y,this.w,this.h);
        }
    }
}

function draw(){
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    backGround.draw();
    pipes.draw();
    foreGround.draw();
    bird.draw();
    startScreen.draw();
    gameOverScreen.draw();
    scores.draw();
  
}

function update(){
    bird.update();
    foreGround.update();
    pipes.update();
}

function loop(){
    update();
    draw();
    frames++;

    requestAnimationFrame(loop);
}

loop();
