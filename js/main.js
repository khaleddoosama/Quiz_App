// Select Elements
let countSpan = document.querySelector(".count span");
let bullets = document.querySelector(".bullets");
let bulletsSpanContainer = document.querySelector(".bullets .spans");
let quizArea = document.querySelector(".quiz-area");
let answersArea = document.querySelector(".answers-area");
let submitButton = document.querySelector(".submit-button");
let resultsContainer = document.querySelector(".results");
let countdownElement = document.querySelector(".countdown");
let arrow = document.querySelectorAll(".arrow");

// Set Options
let currentIndex = 0;
let rightAnswers = 0;
let countdownInterval;
let questionsObject;
let theanswerChoice=[];
let random = [];

function getQuestions() {
  let myRequest = new XMLHttpRequest();

  myRequest.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      questionsObject = JSON.parse(this.responseText);
      let qCount = questionsObject.length;

      // Create Bullets + Set Questions Count
      createBullets(qCount);

      // Randomize Questions 
      for (let i = 0; i < qCount; i++) {
        let randomQuestion = Math.floor(Math.random() * qCount);
        [questionsObject[i], questionsObject[randomQuestion]] = [questionsObject[randomQuestion], questionsObject[i]];
      }
      checkArrows();
      // Add Question Data
      
      addQuestionData(questionsObject[currentIndex], qCount,random[currentIndex]);
      random[currentIndex]=false;
      // Start CountDown
      countdown(qCount*10, qCount);

      // Click On Submit
      submitButton.onclick = () => {
        if(!submitButton.classList.contains("disabled")){
          arrow[1].click();
        }
      
      };
      arrow[0].onclick = () => {
        if (currentIndex > 0) {
          // Remove Previous Question
          quizArea.innerHTML = "";
          answersArea.innerHTML = "";

          currentIndex--;
          checkArrows();

          // Add Question Data
          addQuestionData(questionsObject[currentIndex], qCount,random[currentIndex]);
          random[currentIndex] = false;

          // Handle Bullets Class
          handleBullets();
        }
      };
      arrow[1].onclick = () => {
        // Get Right Answer
        let theRightAnswer = questionsObject[currentIndex].right_answer;

        // Check The Answer
        answerChoice(theRightAnswer, qCount);

        // Increase Index
        currentIndex++;
        checkArrows();

        // Remove Previous Question
        quizArea.innerHTML = "";
        answersArea.innerHTML = "";

        // Add Question Data
        addQuestionData(questionsObject[currentIndex], qCount,random[currentIndex]);
        random[currentIndex]=false;

        // Handle Bullets Class
        handleBullets();

        // Show Results
        showResults(qCount);
      };
      
    }
  };

  myRequest.open("GET", "html_questions.json", true);
  myRequest.send();
}

getQuestions();

function createBullets(num) {
  countSpan.innerHTML = num;

  // Create Spans
  for (let i = 0; i < num; i++) {
    // Create Bullet
    let theBullet = document.createElement("span");

    // Check If Its First Span
    if (i === 0) {
      theBullet.className = "on";
    }

    // Append Bullets To Main Bullet Container
    bulletsSpanContainer.appendChild(theBullet);
  }
}

function addQuestionData(obj, count,random) {
  if (currentIndex < count) {
    // Create H2 Question Title
    let questionTitle = document.createElement("h2");

    // Create Question Text
    let questionText = document.createTextNode(obj["title"]);

    // Append Text To H2
    questionTitle.appendChild(questionText);

    // Append The H2 To The Quiz Area
    quizArea.appendChild(questionTitle);

    // Random The Answers
    if (random===undefined) {
      for (let i = 1; i <= 4; i++) {
        let randomAnswer = Math.floor(Math.random() * 4) + 1;
        [obj[`answer_${i}`], obj[`answer_${randomAnswer}`]] = [obj[`answer_${randomAnswer}`], obj[`answer_${i}`]];
      }
    }

    // Create The Answers
    for (let i = 1; i <= 4; i++) {
      
      // Create Main Answer Div
      let mainDiv = document.createElement("div");

      // Add Class To Main Div
      mainDiv.className = "answer";

      // Create Radio Input
      let radioInput = document.createElement("input");

      // Add Type + Name + Id + Data-Attribute
      radioInput.name = "question";
      radioInput.type = "radio";
      radioInput.id = `answer_${i}`;
      radioInput.dataset.answer = obj[`answer_${i}`];

      // Make First Option Selected
      if (i === 1) {
        radioInput.checked = true;
      }

      // Create Label
      let theLabel = document.createElement("label");

      // Add For Attribute
      theLabel.htmlFor = `answer_${i}`;

      // Create Label Text
      let theLabelText = document.createTextNode(obj[`answer_${i}`]);

      // Add The Text To Label
      theLabel.appendChild(theLabelText);

      // Add Input + Label To Main Div
      mainDiv.appendChild(radioInput);
      mainDiv.appendChild(theLabel);

      // Append All Divs To Answers Area
      answersArea.appendChild(mainDiv);
    }
  }
}

function answerChoice(rAnswer, count) {
  let answers = document.getElementsByName("question");

  for (let i = 0; i < answers.length; i++) {
    if (answers[i].checked) {
      theanswerChoice[currentIndex] = answers[i].dataset.answer;
    }
  }
}

function handleBullets() {
  let bulletsSpans = document.querySelectorAll(".bullets .spans span");
  let arrayOfSpans = Array.from(bulletsSpans);
  for (let i = 0; i < arrayOfSpans.length; i++) {
    if (currentIndex === i) {
      arrayOfSpans[i].className = "on";
    } else {
      arrayOfSpans[i].className = "";
    }
  }
}

function showResults(count) {
  let theResults;
  if (currentIndex === count) {
    quizArea.remove();
    answersArea.remove();
    submitButton.remove();
    bullets.remove();
    arrow[0].remove();
    arrow[1].remove();

    for (let i = 0; i < count; i++) {
      console.log(theanswerChoice[i]);
      console.log(questionsObject[i].right_answer);
      if (theanswerChoice[i] == questionsObject[i].right_answer) {
        rightAnswers++;
      }
    }
    console.log("right answers is " + rightAnswers);

    if (rightAnswers > count / 2 && rightAnswers < count) {
      theResults = `<span class="good">Good</span>, ${rightAnswers} From ${count}`;
    } else if (rightAnswers === count) {
      theResults = `<span class="perfect">Perfect</span>, All Answers Is Good`;
    } else {
      theResults = `<span class="bad">Bad</span>, ${rightAnswers} From ${count}`;
    }

    resultsContainer.innerHTML = theResults;
    resultsContainer.style.padding = "10px";
    resultsContainer.style.backgroundColor = "white";
    resultsContainer.style.marginTop = "10px";
  }
}

function countdown(duration, count) {
  if (currentIndex < count) {
    let minutes, seconds;
    countdownInterval = setInterval(function () {
      minutes = parseInt(duration / 60);
      seconds = parseInt(duration % 60);

      minutes = minutes < 10 ? `0${minutes}` : minutes;
      seconds = seconds < 10 ? `0${seconds}` : seconds;

      countdownElement.innerHTML = `${minutes}:${seconds}`;

      if (--duration < 0) {
        clearInterval(countdownInterval);
        currentIndex = count;
        showResults(count);
      }
    }, 1000);
  }
}

function checkArrows() {
  if (currentIndex === 0) {
    arrow[0].style.visibility = "hidden";
  }
  else {
    arrow[0].style.visibility = "visible";;
  }
  if (currentIndex === questionsObject.length - 1) {
    arrow[1].style.visibility = "hidden";
    submitButton.classList.remove("disabled");
  }
  else {
    arrow[1].style.visibility = "visible";
  }
  if (currentIndex < questionsObject.length - 1) {
    submitButton.classList.add("disabled");
  }
}