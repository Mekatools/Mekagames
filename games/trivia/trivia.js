(function(){
  try {
    var ID = 'trivia';
    var tabs = document.querySelector('.tabs'), box = document.querySelector('.container');
    if (!tabs || !box) return;

    var tab = document.createElement('div');
    tab.className = 'tab'; tab.dataset.tab = ID; tab.textContent = '❓ Trivia Quiz';
    
    var panel = document.createElement('div');
    panel.className = 'panel'; panel.id = 'panel-' + ID;
    panel.innerHTML = `
      <div class="controls">
        <h2 style="color:var(--ft-heading);">Quick Knowledge Quiz</h2>
        <p style="color:var(--ft-muted); font-size:0.9rem;">Test your general knowledge with instant scoring!</p>
        <div id="trivia-question-box" style="font-size:1.1rem; font-weight:600; margin: 15px 0;">Click Start to Begin!</div>
        <div id="trivia-options" style="display:flex; flex-direction:column; gap:8px;"></div>
        <button class="btn" id="trivia-start-btn">Start Quiz</button>
      </div>
      <div class="result" id="result-${ID}"></div>
    `;

    box.insertBefore(panel, box.querySelector('.footer'));
    tabs.appendChild(tab);

    tab.onclick = function() {
      document.querySelectorAll('.tab').forEach(function(x){ x.classList.remove('active'); });
      document.querySelectorAll('.panel').forEach(function(x){ x.classList.remove('active'); });
      tab.classList.add('active'); panel.classList.add('active');
    };

    var questions = [
      { q: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Rome"], correct: 2 },
      { q: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1 },
      { q: "What is 5 + 7 * 2?", options: ["24", "19", "17", "14"], correct: 1 }
    ];

    var currentQ = 0, score = 0;
    var startBtn = panel.querySelector('#trivia-start-btn');
    var qBox = panel.querySelector('#trivia-question-box');
    var optBox = panel.querySelector('#trivia-options');
    var resDiv = panel.querySelector('#result-' + ID);

    startBtn.onclick = function() {
      currentQ = 0;
      score = 0;
      startBtn.style.display = 'none';
      resDiv.classList.remove('show');
      loadQuestion();
    };

    function loadQuestion() {
      if (currentQ >= questions.length) {
        qBox.textContent = "Quiz Complete! 🎉";
        optBox.innerHTML = "";
        resDiv.textContent = "Your Final Score: " + score + " / " + questions.length;
        resDiv.classList.add('show');
        startBtn.textContent = "Play Again";
        startBtn.style.display = 'block';
        return;
      }

      var q = questions[currentQ];
      qBox.textContent = "Q" + (currentQ + 1) + ": " + q.q;
      optBox.innerHTML = "";

      q.options.forEach(function(opt, idx) {
        var btn = document.createElement('button');
        btn.className = 'btn btn-secondary';
        btn.style.textAlign = 'left';
        btn.textContent = opt;
        btn.onclick = function() {
          if (idx === q.correct) score++;
          currentQ++;
          loadQuestion();
        };
        optBox.appendChild(btn);
      });
    }
  } catch(e) {
    console.error('Trivia game failed', e);
  }
})();
