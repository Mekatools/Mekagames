(function(){
  try {
    var groups = {
      "Quizzes": ["trivia"],
      "Study Tools": ["flashcards"]
    };

    var tabsContainer = document.querySelector('.tabs');
    if (!tabsContainer) return;

    var allTabs = Array.from(tabsContainer.querySelectorAll('.tab'));
    
    // Create folders
    Object.keys(groups).forEach(function(groupName) {
      var gameIds = groups[groupName];
      var matchedTabs = allTabs.filter(function(t) {
        return gameIds.includes(t.dataset.tab);
      });

      if (matchedTabs.length === 0) return;

      var folderDiv = document.createElement('div');
      folderDiv.className = 'folder-box';
      folderDiv.style.width = '100%';

      var header = document.createElement('div');
      header.className = 'folder-header';
      header.innerHTML = '<span>📁 ' + groupName + '</span><span>▼</span>';

      var content = document.createElement('div');
      content.className = 'folder-content';

      matchedTabs.forEach(function(t) {
        content.appendChild(t);
      });

      folderDiv.appendChild(header);
      folderDiv.appendChild(content);
      tabsContainer.appendChild(folderDiv);

      header.onclick = function() {
        content.style.display = content.style.display === 'none' ? 'flex' : 'none';
      };
    });
  } catch(e) {
    console.error('Groups script failed', e);
  }
})();
