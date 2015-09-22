// Monitor tabs for a tt-rss tab, and use its unread count if possible 

function is_ttrss_url(url) {
  var site_url = localStorage['site_url'];
  return url.indexOf(site_url) == 0;
}

function get_ttrss_tab(callback) {
  chrome.tabs.getAllInWindow(undefined, function (tabs) {
    var site_url = localStorage['site_url'];

    for (var i = 0, tab; tab = tabs[i]; i++) {
      if (tab.url && is_ttrss_url(tab.url)) {
        callback(tab);
        return;
      }
    }
    callback(null);
  });
}

window.setInterval(function () {
  var show_badge = localStorage['show_badge'] == '1';
  if (show_badge) {
    get_ttrss_tab(function (tab) {
      if (tab) {
        var codeString = "(document.getElementsByClassName('counterNode')[2]).innerHTML;"
        if (localStorage['show_fresh'] == '1')
          codeString = "(document.getElementsByClassName('counterNode')[3]).innerHTML;"
  
        chrome.tabs.executeScript(tab.id, { code: codeString }, function (result) {
          if (result && (result[0] != null)) {
            var unread = parseInt(result[0], 10);
    
            if (isNaN(unread)) {
              chrome.browserAction.setTitle({ title: 'You have no unread articles.' });
              chrome.browserAction.setBadgeText({ text: '' });
            }
            else if (unread > 0) {
              var title = new Object();
              var badge = new Object();
              var badge_color = new Object();
    
              title.title = 'You have %s unread articles.'.replace('%s', unread);
              badge.text = unread + '';
              badge_color.color = [255, 0, 0, 255];
    
              chrome.browserAction.setBadgeBackgroundColor(badge_color);
              chrome.browserAction.setBadgeText(badge);
              chrome.browserAction.setTitle(title);
            }
          }
        });
      }
    });
  }
}, 333);
