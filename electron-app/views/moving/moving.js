const canvas = document.getElementById('rectangle');
const context = canvas.getContext('2d');

canvas.width = 500;
canvas.height = 500;

xRect = 20;
yRect = 20;
widthRect = 150;
heightRect = 150;

function drawRectangle(){
    context.fillStyle = '#ff0000'; // rouge
    context.fillRect(xRect, yRect, widthRect, heightRect);
    //context.strokeRect(20, 20, 150, 150);
}



function test(){
    alert("oui");
}

function moveleft(){
    if(xRect > 0){
        context.clearRect(xRect, yRect, widthRect, heightRect);
        xRect -= 10;
        drawRectangle();
    }  
}

function moveup(){
    if(yRect > 0){
        context.clearRect(xRect, yRect, widthRect, heightRect);
        yRect -= 10;
        drawRectangle();
    }
}

function moveright(){
    if((xRect+widthRect) < canvas.width){
        context.clearRect(xRect, yRect, widthRect, heightRect);
        xRect += 10;
        drawRectangle();
    }   
}

function movedown(){
    if((yRect+heightRect) < canvas.height){
        context.clearRect(xRect, yRect, widthRect, heightRect);
        yRect += 10;
        drawRectangle();
    } 
}

window.onkeydown = function(e) {
    var key = e.keyCode || e.which;
    switch (key) {
        case 37:
            moveleft();
            break;
        case 38:
            moveup();
            break;
        case 39:
            moveright();
            break;
        case 40:
            movedown();
            break;
                                
    }
}


window.onload = function() {
    drawRectangle();
  };
