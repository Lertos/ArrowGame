//======================
//  Global Variables
//======================

//Difficulty Speeds
var globalSpeed = 0;
var easySpeed = 1000;
var mediumSpeed = 600;
var hardSpeed = 300;

//Buttons to click
var numberOfButtons = 15;

//Interval Countdowns
var remaining;
var initialCountdown;

//Game Logic
var globalPoints;
var buttonCurrentlyActive = 0;
var activeGame = false;
var didPress = true; //Confirms the user DID press a button during any turn
var correctPressed = 0;
var incorrectPressed = 0;

//Penalties
var incorrectKeyPentalty = 5000;
var noKeyPenalty = 10000;

//Images
var blankImage = 'Images/blank.png';
var goImage = 'Images/GO.png';
var wrongImage = 'Images/wrong.png';

//Global Timer
var timer;


//--Index
//0 - Up
//1 - Left
//2 - Right
//3 - Down

//[elementName, sourceImg]
var items = [
    ['imgUpArrow', 'Images/up.png'],
    ['imgLeftArrow', 'Images/left.png'],
    ['imgRightArrow', 'Images/right.png'],
    ['imgDownArrow', 'Images/down.png']
]

//======================
//  Functions
//======================

function chooseDifficulty(){
    switchDivDisplay( $('divStartButton'), $('divDifficulty') );
}

function setDifficulty(difficulty){
    if(difficulty === 'easy')
        globalSpeed = easySpeed;

    if(difficulty === 'medium')
        globalSpeed = mediumSpeed;

    if(difficulty === 'hard')
        globalSpeed = hardSpeed;
}

function setPointsLabel(points){
    globalPoints += points;
    $('labelPoints').innerHTML = '' + globalPoints;
}

function startGame(difficulty){
    var divButtons = $('divButtons');
    var divDifficulty = $('divDifficulty');

    setDifficulty(difficulty);

    //Resetting variables
    initialCountdown = 3;
    globalPoints = 0;
    remaining = numberOfButtons;
    correctPressed = 0;
    incorrectPressed = 0;
    timeOfImageChange = Date.now()
    setPointsLabel(globalPoints);
    
    //Hide difficulty buttons and start the countdown
    switchDivDisplay(divDifficulty, divButtons);
    
    timer = setInterval(countdown, 1000, globalSpeed);
}

function countdown(speed){
    var countDownImg = $('countDownImg');

    //If the counter is: 3, 2, or 1
    if(initialCountdown > 0) {
        countDownImg.setAttribute('src', 'Images/' + initialCountdown + '.png');
        playSound("audio/wav", "Audio/ding.wav");
    }

    //If the counter is: 0 - show GO instead of 0
    if(initialCountdown == 0) {
        countDownImg.setAttribute('src', goImage);
        playSound("audio/wav", "Audio/whistle.wav");
    }

    //Once the GO has been shown, start the game
    if(initialCountdown < 0){
        countDownImg.setAttribute('src', blankImage);

        activeGame = true;
        clearInterval(timer);

        timer = setInterval(gameLoop, speed);
    }

    //Decrease the counter
    initialCountdown--;
}

function gameLoop(){
    var randomIndex = Math.floor((Math.random() * 4));

    //If the new button equals the currently active button, choose one that isn't active
    if(randomIndex == buttonCurrentlyActive)
        randomIndex = (randomIndex + 1) % 3;

    //Set the previous button back to default and set the new button at random
    updateButton(items[buttonCurrentlyActive][0], blankImage, null)
    updateButton(items[randomIndex][0], items[randomIndex][1], 'imgShadow')

    //Did the user even press a key? If no - assign a major penalty
    if(didPress == false)
        setPointsLabel(noKeyPenalty);
    didPress = false;

    //Update the active button
    buttonCurrentlyActive = randomIndex;

    //Get the time that the button changed - so we can calculate the points off of it later
    timeOfImageChange = Date.now();

    //Play a click sound
    playSound("audio/wav", "Audio/click.wav");

    //If the middle image shows an error, set it back to the blank image
    switchRedSquaresOnOrOff(false);

    //Decreasing the remaining turns and update the Remaining label
    checkIfGameOver();
}

function checkIfGameOver(){
    remaining--;

    //If there are no buttons left to click - end the game
    if(remaining < 0)
        gameOver();
    //Else - update the remaining buttons label
    else
        $('labelRemaining').innerHTML = '' + remaining;
}

function incorrectKey(){
    //Pentalty for missing the button
    setPointsLabel(incorrectKeyPentalty);

    incorrectPressed++;

    switchRedSquaresOnOrOff(true);
}

function switchRedSquaresOnOrOff(boolVal){
    var redSquares = document.getElementsByName('redSquare');
    //If true - set all redSquares to red
    if(boolVal){
        redSquares.forEach( square => {
            square.setAttribute('src', wrongImage);
        });
    }
    //Else - set them back to blank
    else{
        redSquares.forEach( square => {
            square.setAttribute('src', blankImage);
        });
    }
}

function assignPoints(){
    var getTimeBetween = (Date.now() - timeOfImageChange);

    setPointsLabel(getTimeBetween);

    correctPressed++;
}

function gameOver(){
    //Stop the game loop from firing
    clearInterval(timer);

    //Reset currently active button back to default
    updateButton(items[buttonCurrentlyActive][0], blankImage, null);

    switchRedSquaresOnOrOff(false);
    buttonCurrentlyActive = 0;

    //Update the btnStart to display "Play Again" instead of "Start"
    $('btnStart').innerHTML = 'Play Again';

    //Update the Correct and Incorrect labels
    $('labelCorrect').innerHTML = '' + correctPressed;
    $('labelIncorrect').innerHTML = '' + incorrectPressed;

    //Hide the buttons div and show the start button
    switchDivDisplay( $('divButtons'), $('divStartButton') );

    //Set the game to inactive to avoid points being given after timeup
    activeGame = false;
}

//======================
//  Helper Functions
//======================

function $(elementId){
    return document.getElementById(elementId);
}

function switchDivDisplay(divOne, divTwo){
    divOne.style = 'display:none';
    divTwo.style = 'display:inline-block';
}

function updateButton(button, changeSource, className){
    var newButton = $(button);

    newButton.setAttribute('src', changeSource);
    newButton.className = className;
}

function playSound(type, source){
    var newSound  = new Audio();
    var newSource  = document.createElement("source");

    newSource.type = type;
    newSource.src  = source;

    newSound.appendChild(newSource);
    newSound.play();
}

//======================
//  Event Listeners
//======================


document.addEventListener('keydown', function(event) {

    if(activeGame){
        var correctKey = true;

        //Left
        if(event.keyCode == 37) {
            didPress = true;
            if(buttonCurrentlyActive != 1)
                correctKey = false;
        }
        //Up
        else if(event.keyCode == 38) {
            didPress = true;
            if(buttonCurrentlyActive != 0)
                correctKey = false;
        }
        //Right
        else if(event.keyCode == 39) {
            didPress = true;
            if(buttonCurrentlyActive != 2)
                correctKey = false;
        }
        //Down
        else if(event.keyCode == 40) {
            didPress = true;
            if(buttonCurrentlyActive != 3)
                correctKey = false;
        }

        if(correctKey){
            assignPoints();
        } else {
            incorrectKey();
        }
    }
});
