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
        <p style="color:var(--ft-muted); font-size:0.9rem;">Host a game to get a Room Code, or join your friends!</p>
        
        <div style="display:flex; gap:10px; margin-top:10px;">
          <button class="btn" id="mt-host-btn">Host a Game</button>
        </div>

        <div style="border-top:1px solid var(--ft-border2); padding-top:15px; margin-top:10px;">
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

    // Game variables
    var peer = null, conn = null, isHost = false;
    var myName = "", roomCode = "";
    var currentQ = 0, score = 0;
    
    var questions = [
      { q: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Rome"], correct: 2 },
      { q: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1 },
      { q: "What is 5 + 7 * 2?", options: ["24", "19", "17", "14"], correct: 1 }
    ];

    var lobbyEl = panel.querySelector('#mt-lobby');
    var gameAreaEl = panel.querySelector('#mt-game-area');
    var statusBar = panel.querySelector('#mt-status-bar');
    var qBox = panel.querySelector('#mt-question-box');
    var optBox = panel.querySelector('#mt-options');
    var resDiv = panel.querySelector('#result-' + ID);

    // Host Game
    panel.querySelector('#mt-host-btn').onclick = function() {
      isHost = true;
      roomCode = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit code
      
      peer = new Peer('edugames-' + roomCode);
      
      peer.on('open', function() {
        lobbyEl.style.display = 'none';
        gameAreaEl.style.display = 'flex';
        statusBar.textContent = "Hosting Room Code: " + roomCode + " (Waiting for players...)";
        
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
      if (currentQ >= questions.length) {
        qBox.textContent = "Game Over! 🎉";
        optBox.innerHTML = "";
        statusBar.textContent = "Final Score: " + score;
        return;
      }

      var q = questions[currentQ];
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
            // Answer selected
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
