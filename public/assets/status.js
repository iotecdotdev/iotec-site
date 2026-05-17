/* Status indicator — pinta el dot del footer con el estado en vivo de los
   monitores de UptimeRobot. Read-only API key safe to expose. */
(function () {
  'use strict';

  var API_URL  = 'https://api.uptimerobot.com/v2/getMonitors';
  var API_KEY  = 'ur3510042-1ab0bb1a68381444909648d0';
  var REFRESH_MS = 60 * 1000; // refresca cada 60s

  var STATUS_LABEL = {
    0: 'paused',
    1: 'not checked yet',
    2: 'up',
    8: 'seems down',
    9: 'down'
  };

  function setDot(cls, title) {
    var dot = document.getElementById('iotecStatusDot');
    if (!dot) return;
    dot.classList.remove('up', 'down', 'partial');
    if (cls) dot.classList.add(cls);
    if (title) dot.title = title;
  }

  function update() {
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'api_key=' + encodeURIComponent(API_KEY) + '&format=json'
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || d.stat !== 'ok' || !Array.isArray(d.monitors)) return;
        var allUp = d.monitors.every(function (m) { return m.status === 2; });
        var anyDown = d.monitors.some(function (m) { return m.status === 8 || m.status === 9; });
        var cls = anyDown ? 'down' : (allUp ? 'up' : 'partial');
        var parts = d.monitors.map(function (m) {
          return m.friendly_name + ': ' + (STATUS_LABEL[m.status] || 'unknown');
        });
        setDot(cls, parts.join(' · '));
      })
      .catch(function () { /* network blip — keep last state */ });
  }

  // Run on DOMContentLoaded so the dot exists, then refresh.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', update);
  } else {
    update();
  }
  setInterval(update, REFRESH_MS);
})();
