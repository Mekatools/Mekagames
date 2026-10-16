(function(){
  try {
    var ID = 'multi-trivia';
    var tabs = document.querySelector('.tabs'), box = document.querySelector('.container');
    if (!tabs || !box) return;

    var tab = document.createElement('div');
    tab.className = 'tab'; tab.dataset.tab = ID; tab.textContent = '⚡ Live Quiz (Kahoot-style)';
    
    var panel = document.createElement('div');
    panel.className = 'panel'; panel.id = 'panel-' + ID;
    panel.innerHTML = `
      <div class="controls" id="mt-lobby">
        <h2 style="color:var(--ft-heading);">Live Multiplayer Trivia</h2>
        <p style="color:var(--ft-muted); font-size:0.9rem;">Choose a theme, host a game, and invite your friends!</p>
        
        <div style="margin-top:10px;">
          <label style="font-size:0.85rem; color:var(--ft-muted); display:block; margin-bottom:6px; font-weight:600;">Select Quiz Theme:</label>
          <select id="mt-theme-select">
            <option value="history">🏛️ History</option>
            <option value="literature">📚 Literature</option>
            <option value="science">🔬 Science & Nature</option>
            <option value="popculture">🎬 Pop Culture</option>
          </select>
        </div>

        <div style="display:flex; gap:10px; margin-top:12px;">
          <button class="btn" id="mt-host-btn">Host a Game</button>
        </div>

        <div style="border-top:1px solid var(--ft-border2); padding-top:15px; margin-top:15px;">
          <p style="margin-bottom:8px; font-weight:600;">Join an Existing Game:</p>
          <input type="text" id="mt-name-input" placeholder="Enter your nickname" style="margin-bottom:8px;">
          <input type="text" id="mt-code-input" placeholder="Enter 4-digit Room Code (e.g. 5821)" style="margin-bottom:8px;">
          <button class="btn btn-secondary" id="mt-join-btn">Join Room</button>
        </div>
      </div>

      <div class="controls" id="mt-game-area" style="display:none;">
        <div id="mt-status-bar" style="font-weight:600; color:var(--ft-accent2);"></div>
        <div id="mt-question-box" style="font-size:1.2rem; font-weight:600; margin:15px 0;"></div>
        <div id="mt-options" style="display:flex; flex-direction:column; gap:8px;"></div>
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

    // Question banks categorized by theme
    var questionBanks = {
      history: [
        { q: "Who was the first President of the United States?", options: ["Thomas Jefferson", "Abraham Lincoln", "George Washington", "John Adams"], correct: 2 },
        { q: "In what year did World War II end?", options: ["1943", "1945", "1950", "1939"], correct: 1 },
        { q: "The ancient city of Rome was built on how many hills?", options: ["5", "7", "10", "12"], correct: 1 }
      ],
      literature: [
        { q: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "Mark Twain", "William Shakespeare", "Jane Austen"], correct: 2 },
        { q: "What is the name of the wizard school in Harry Potter?", options: ["Beauxbatons", "Durmstrang", "Hogwarts", "Ilvermorny"], correct: 2 },
        { q: "In George Orwell's '1984', what is the ruling party's supreme figure?", options: ["Big Brother", "The Chancellor", "Leader X", "Chief Overseer"], correct: 0 }
      ],
      science: [
        { q: "What chemical element is represented by the symbol 'Au'?", options: ["Silver", "Gold", "Copper", "Argon"], correct: 1 },
        { q: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Endoplasmic Reticulum"], correct: 2 },
        { q: "At what temperature do Celsius and Fahrenheit intersect?", options: ["-40", "0", "32", "100"], correct: 0 }
      ],
      popculture: [
        { q: "Which movie features a theme song called 'My Heart Will Go On'?", options: ["The Notebook", "Titanic", "Avatar", "Armageddon"], correct: 1 },
        { q: "What is the best-selling video game of all time as of recent years?", options: ["Grand Theft Auto V", "Tetris", "Minecraft", "Fortnite"], correct: 2 },
        { q: "Who plays Iron Man in the Marvel Cinematic Universe?", options: ["Chris Evans", "Mark Ruffalo", "Robert Downey Jr.", "Chris Hemsworth"], correct: 2 }
      ]
    };

    // Game variables
    var peer = null, conn = null, isHost = false;
    var myName = "", roomCode = "";
    var currentQ = 0, score = 0;
    var activeQuestions = [];
    
    var lobbyEl = panel.querySelector('#mt-lobby');
    var gameAreaEl = panel.querySelector('#mt-game-area');
    var statusBar = panel.querySelector('#mt-status-bar');
    var qBox = panel.querySelector('#mt-question-box');
    var optBox = panel.querySelector('#mt-options');
    var resDiv = panel.querySelector('#result-' + ID);

    // Host Game with Theme Selection
    panel.querySelector('#mt-host-btn').onclick = function() {
      isHost = true;
      var selectedTheme = panel.querySelector('#mt-theme-select').value;
      activeQuestions = questionBanks[selectedTheme] || questionBanks.history;
      
      roomCode = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit code
      peer = new Peer('edugames-' + roomCode);
      
      peer.on('open', function() {
        lobbyEl.style.display = 'none';
        gameAreaEl.style.display = 'flex';
        statusBar.textContent = "Hosting Room: " + roomCode + " | Theme: " + selectedTheme.toUpperCase() + " (Waiting for players...)";
        
        peer.on('connection', function(connection) {
          conn = connection;
          statusBar.textContent = "Player Connected! Starting game...";
          setTimeout(startHostGame, 1500);
        });
      });

      peer.on('error', function(err) {
        alert("Error creating room. Try again.");
        console.error(err);
      });
    };

    // Join Game
    panel.querySelector('#mt-join-btn').onclick = function() {
      isHost = false;
      myName = panel.querySelector('#mt-name-input').value.trim();
      var inputCode = panel.querySelector('#mt-code-input').value.trim();

      if (!myName || !inputCode) {
        alert("Please enter both your nickname and room code!");
        return;
      }

      peer = new Peer();
      peer.on('open', function() {
        conn = peer.connect('edugames-' + inputCode);
        
        conn.on('open', function() {
          lobbyEl.style.display = 'none';
          gameAreaEl.style.display = 'flex';
          statusBar.textContent = "Connected to room! Waiting for host to start...";
          conn.send({ type: 'JOIN', name: myName });
        });

        conn.on('data', function(data) {
          handleClientData(data);
        });
      });

      peer.on('error', function() {
        alert("Could not connect. Check the room code.");
      });
    };

    function startHostGame() {
      currentQ = 0;
      showHostQuestion();
    }

    function showHostQuestion() {
      if (currentQ >= activeQuestions.length) {
        qBox.textContent = "Game Over! 🎉";
        optBox.innerHTML = "";
        statusBar.textContent = "Final Score: " + score;
        return;
      }

      var q = activeQuestions[currentQ];
      qBox.textContent = "Q" + (currentQ + 1) + ": " + q.q;
      optBox.innerHTML = "";

      // Send question to connected client
      if (conn) {
        conn.send({ type: 'QUESTION', qIndex: currentQ, questionData: q });
      }

      q.options.forEach(function(opt, idx) {
        var btn = document.createElement('button');
        btn.className = 'btn btn-secondary';
        btn.textContent = opt;
        btn.onclick = function() {
          if (idx === q.correct) score++;
          currentQ++;
          showHostQuestion();
        };
        optBox.appendChild(btn);
      });
    }

    function handleClientData(data) {
      if (data.type === 'QUESTION') {
        var q = data.questionData;
        statusBar.textContent = "Live Question from Host";
        qBox.textContent = "Q" + (data.qIndex + 1) + ": " + q.q;
        optBox.innerHTML = "";

        q.options.forEach(function(opt, idx) {
          var btn = document.createElement('button');
          btn.className = 'btn btn-secondary';
          btn.textContent = opt;
          btn.onclick = function() {
            optBox.innerHTML = "<p style='color:var(--ft-accent2);'>Answer submitted! Waiting for next question...</p>";
          };
          optBox.appendChild(btn);
        });
      }
    }

  } catch(e) {
    console.error('Multiplayer trivia failed', e);
  }
})();
