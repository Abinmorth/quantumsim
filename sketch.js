var numberOfQbits;
var numberOfButtons;
var lineLength;
var lineDistance;
var selectedButton = -1;
var buttons = [];
var lines = [];
let font;

function setup() {
	//Edit this section for customizing
	numberOfQbits = 3;
	lineLength = 400;
	lineDistance = 50;
	listButtons = ["X", "Z", "H", "CX"];
	
	//do not edit.
	numberOfButtons = listButtons.length;
	createCanvas(1000,1000);
	for(let k = 0; k < numberOfButtons; k++){
		var button = new Button(100 + 70*k, listButtons[k]);
		buttons.push(button);
	}
	
	for (let k = 0; k < numberOfQbits; k++) {
		var arr = [];
		lines.push(arr);
	}
}

function draw() {
	background(255,255,255);
	
	// selectedButton
	if(selectedButton >= 0){
		stroke(255,0,0);
		rect(buttons[selectedButton].xPos - 10, 100 - 10, 70, 70);
		stroke(0,0,0);
	}
	
	//buttons
	for(let k = 0; k < numberOfButtons; k++){
		buttons[k].display();
	}
	
	//lines
	for (let k = 0; k < numberOfQbits; k++) {
		line(100,200 + lineDistance*k, 100 + lineLength,200 + lineDistance*k);
		var lineObjectCount = lines[k].length;
		fill(255,255,255);
		for(let n = 0; n < lineObjectCount; n++){
			lines[k][n].display();
		}
	}
}

var controlMode = "control";
var control;
var target;

function mouseClicked(){ 	
		//Click within button area
		if(mouseY >= 100 && mouseY <= 150){
			for(let k = 0; k < numberOfButtons; k++){
				if(mouseX >= buttons[k].xPos && mouseX <= (buttons[k].xPos + 50)){
					if(selectedButton == k){
						selectedButton = -1;
					}else{
						selectedButton = k;
						var gateType = listButtons[selectedButton];
						if (gateType == "CX"){
							controlMode == "control";
						}
					}
				}
			}
		}
		
		//Click within line Area
		if (selectedButton >= 0){
			if(mouseX >= 100 && mouseX <= 100 + lineLength){
				for(let k = 0; k < numberOfQbits; k++){
					var half = +lineDistance / 2;
					if(mouseY >= ((200 + lineDistance*k) - 20) && mouseY <= ((200 + 50*k) + 20)){
						var gateType = listButtons[selectedButton];
						if(gateType == "CX"){
							if(controlMode == "control"){
								control = k;
								controlMode = "target";
							}else if(controlMode == "target"){
								target = k;
								controlMode = "control";
								addCNOT(control, target);
							}
						}else{
							var gate = new Gate(gateType, k, lines[k].length);
							lines[k].push(gate);
						}
					}
				}
			}
		}
}

// Should add the following: Control, Target, Fill other lines with identity
function addCNOT(control, target){
		var maxGates = for_lines_getMaxGateNumber()
		for_lines_fillIdentity(maxGates);
		var cx = new ControlledGate("X", control, lines[control].length, target, lines[target].length)
		
		//var c = new Gate("C", control, lines[control].length);
		lines[control].push(cx);
		//var t = new Gate("X", target, lines[target].length);
		lines[target].push(cx);
		
		var maxGates = for_lines_getMaxGateNumber()
		for_lines_fillIdentity(maxGates);
}

function for_lines_getMaxGateNumber(){
	var max = 0;
	for(let k = 0; k < numberOfQbits; k++){
		if(max < lines[k].length){
			max = lines[k].length;
		}
	}
	return max;
}

function for_lines_fillIdentity(max){
	for(let k = 0; k < numberOfQbits; k++){
		while(lines[k].length < max){
			var identity = new Gate("I", k, lines[k].length);
			lines[k].push(identity);
		}
	}
}

class Button{
	constructor(xPos, txt){
		this.xPos = xPos;
		this.txt = txt;
	}
	
	display(){
		rect(this.xPos, 100, 50, 50);
		fill(0);
		text(this.txt, this.xPos + 12, 125);
		fill(255);
	}
}

class Gate{
	constructor(txt, lineIndex, gateIndex){
		this.txt = txt;
		this.xPos = 100 + gateIndex * 25;
		this.yPos = 200 + lineDistance*lineIndex - 10;
		
		this.matrix = this.getMatrix();
		console.log(this.matrix);
	}
	
	display(){
		if(this.txt != "I"){
			rect(this.xPos, this.yPos ,20,20);
			fill(0);
			text(this.txt, this.xPos + 8, this.yPos + 12);
			fill(255);
		}
		
	}
	
	getMatrix(){
		if(this.txt == 'X'){
			return math.matrix([[0, 1], [1, 0]]);			
		}else if(this.txt == 'Z'){
			return math.matrix([[1, 0], [0, -1]]); 
		}else if(this.txt == 'H'){
			return math.multiply((1/math.sqrt(2)), math.matrix([[1, 1], [1, -1]])); 
		}	
	}
}

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

class ControlledGate{
	constructor(txt, lineIndexControl, gateIndexControl, lineIndexTarget, gateIndexTarget){
		this.txt = txt;
		this.control = createVector(100 + gateIndexControl * 25, 200 + lineDistance*lineIndexControl - 10);
		this.target = createVector(100 + gateIndexTarget * 25, 200 + lineDistance*lineIndexTarget - 10);
		this.controlIndex = lineIndexControl;
		this.targetIndex = lineIndexTarget;
		
		this.matrix = this.getMatrix();
		console.log(this.matrix);
	}
	
	display(){
		if(this.txt == "X"){
			rect(this.control.x, this.control.y ,20,20);
			rect(this.target.x, this.target.y ,20,20);
			fill(0);
			text('C', this.control.x + 8, this.control.y + 12);
			text('X', this.target.x + 8, this.target.y + 12);
			fill(255);
		}
		
	}
	
	getMatrix(){
		var ident = math.identity(math.pow(2,numberOfQbits), math.pow(2,numberOfQbits), 'dense')
		var zeros = '0'.repeat(numberOfQbits);
		var x1 = zeros.replaceAt(this.controlIndex, '1');
		var x2 = x1.replaceAt(this.targetIndex, '1');
		var s1 = parseInt(x1, 2);
		var s2 = parseInt(x2, 2);
		var cnot = ident.swapRows(s1, s2);
		return cnot;
	}
}