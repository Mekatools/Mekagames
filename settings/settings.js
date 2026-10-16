(function(){
  try {
    var btn = document.createElement('button');
    btn.innerHTML = '⚙️';
    btn.style.cssText = 'position:fixed; top:20px; right:20px; background:var(--ft-card); border:1px solid var(--ft-border); color:var(--ft-text); padding:8px 12px; border-radius:8px; cursor:pointer; z-index:1000; font-size:1rem;';
    
    var panel = document.createElement('div');
    panel.style.cssText = 'position:fixed; top:70px; right:20px; background:var(--ft-card); border:1px solid var(--ft-border); padding:20px; border-radius:12px; box-shadow:0 8px 30px rgba(0,0,0,0.5); display:none; z-index:1000; width:260px;';
    panel.innerHTML = '<h3 style="margin-bottom:12px; font-size:1.1rem; color:var(--ft-heading);">Settings</h3><label style="font-size:0.85rem; color:var(--ft-muted);">Accent Color</label><input type="color" id="ft-color-picker" value="#4f46e5" style="width:100%; margin-top:6px; height:36px; border:none; cursor:pointer; background:none;">';
    
    document.body.appendChild(btn);
    document.body.appendChild(panel);

    btn.onclick = function() {
      panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    };

    var colorPicker = panel.querySelector('#ft-color-picker');
    colorPicker.oninput = function(e) {
      document.documentElement.style.setProperty('--ft-accent', e.target.value);
    };
  } catch(e) {
    console.error('Settings failed', e);
  }
})();
