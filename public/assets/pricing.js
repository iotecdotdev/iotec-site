/* pricing.js — Hydrata precios desde license.iotec.dev/api/pricing (que a su
   vez los obtiene de Lemon Squeezy, single source of truth). Cache server-side
   10 min. Si el fetch falla, los precios hardcoded en el HTML se quedan como
   fallback — el usuario no ve placeholders rotos.

   Markup esperado:
     <span data-iotec-price="gex.amount">49</span>
     <span data-iotec-price="gex.period">/ month</span>
     <span data-iotec-price="core.amount">497</span>
     <span data-iotec-price="core.period">one-time</span>

   El número que va dentro del HTML es el fallback (lo que se muestra si el
   fetch falla o tarda). Cuando el JS resuelve, lo reemplaza in-place. */
(function () {
  'use strict';

  var ENDPOINT  = 'https://license.iotec.dev/api/pricing';
  var LANG      = (document.documentElement.lang || 'en').toLowerCase().startsWith('es') ? 'es' : 'en';

  // Etiquetas localizadas para periodos.
  var PERIOD_LABEL = {
    en: { one_time: 'one-time', month: '/ month', year: '/ year' },
    es: { one_time: 'pago único', month: '/ mes',  year: '/ año'  }
  };

  function periodLabel(info) {
    var t = PERIOD_LABEL[LANG];
    if (!info || !info.is_subscription) return t.one_time;
    if (info.interval === 'year')  return t.year;
    return t.month;
  }

  function formatAmount(amount) {
    // Sin decimales si es entero; con .00 si no.
    if (amount == null) return '';
    if (amount === Math.floor(amount)) return '$' + amount;
    return '$' + amount.toFixed(2);
  }

  function apply(pricing) {
    var nodes = document.querySelectorAll('[data-iotec-price]');
    nodes.forEach(function (el) {
      var key = el.getAttribute('data-iotec-price'); // ej. "gex.amount"
      var parts = key.split('.');
      var product = parts[0];
      var field   = parts[1];
      var info = pricing[product];
      if (!info) return;
      if (field === 'amount') {
        el.textContent = formatAmount(info.amount);
      } else if (field === 'period') {
        el.textContent = periodLabel(info);
      } else if (field === 'amount_raw') {
        el.textContent = String(info.amount);
      }
    });
  }

  function load() {
    fetch(ENDPOINT, { method: 'GET', cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.pricing) apply(d.pricing);
      })
      .catch(function () { /* fallback al HTML hardcoded — ya está visible */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
