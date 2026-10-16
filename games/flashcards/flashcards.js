(function(){
  try {
    var ID = 'flashcards';
    var tabs = document.querySelector('.tabs'), box = document.querySelector('.container');
    if (!tabs || !box) return;

    var tab = document.createElement('div');
    tab.className = 'tab'; tab.dataset.tab = ID; tab.textContent = '📇 Flashcards';
    
    var panel = document.createElement('div');
    panel.className = 'panel'; panel.id = 'panel-' + ID;
    panel.innerHTML = `
      <div class="controls">
        <h2 style="color:var(--ft-heading);">Study Flashcards</h2>
        <p style="color:var(--ft-muted); font-size:0.9rem;">Click the card to flip between term and definition.</p>
        <div id="fc-card" style="background:var(--ft-bg); border:1px solid var(--ft-border2); border-radius:12px; padding:40px; text-align:center; font-size:1.2rem; font-weight:600; cursor:pointer; min-height:140px; display:flex; align-items:center; justify-content:center;">Click to Start</div>
        <div class="control-row" style="justify-content:center; margin-top:10px;">
          <button class="btn btn-secondary" id="fc-prev">Previous</button>
          <button class="btn" id="fc-next">Next Card</button>
        </div>
      </div>
    `;

    box.insertBefore(panel, box.querySelector('.footer'));
    tabs.appendChild(tab);

    tab.onclick = function() {
      document.querySelectorAll('.tab').forEach(function(x){ x.classList.remove('active'); });
      document.querySelectorAll('.panel').forEach(function(x){ x.classList.remove('active'); });
      tab.classList.add('active'); panel.classList.add('active');
    };

    var cards = [
      { term: "HTML", def: "HyperText Markup Language - Structure of web pages" },
      { term: "CSS", def: "Cascading Style Sheets - Styling and layout" },
      { term: "JavaScript", def: "Programming language for the web" }
    ];

    var idx = 0, showDef = false;
    var cardEl = panel.querySelector('#fc-card');
    var nextBtn = panel.querySelector('#fc-next');
    var prevBtn = panel.querySelector('#fc-prev');

    function updateCard() {
      showDef = false;
      cardEl.textContent = cards[idx].term + " (Click to flip)";
    }

    cardEl.onclick = function() {
      showDef = !showDef;
      cardEl.textContent = showDef ? cards[idx].def : cards[idx].term + " (Click to flip)";
    };

    nextBtn.onclick = function() {
      idx = (idx + 1) % cards.length;
      updateCard();
    };

    prevBtn.onclick = function() {
      idx = (idx - 1 + cards.length) % cards.length;
      updateCard();
    };

    updateCard();
  } catch(e) {
    console.error('Flashcards failed', e);
  }
})();
