(function (root) {
  var CATS = ['food', 'transport', 'study', 'fun', 'other'];
  function monthKey(d) { return d.slice(0, 7); }
  function daysIn(key) { var p = key.split('-').map(Number); return new Date(p[0], p[1], 0).getDate(); }
  function summarize(st, key, todayStr) {
    var ex = st.expenses.filter(function (e) { return monthKey(e.date) === key; }), spent = 0, by = {};
    CATS.forEach(function (c) { by[c] = 0; });
    ex.forEach(function (e) { spent += e.amount; by[e.cat] = (by[e.cat] || 0) + e.amount; });
    var total = daysIn(key), cur = monthKey(todayStr) === key, day = cur ? +todayStr.slice(8, 10) : (key < monthKey(todayStr) ? total : 0);
    var left = st.allowance - spent, remaining = cur ? total - day + 1 : (key > monthKey(todayStr) ? total : 0);
    var safe = remaining > 0 ? Math.max(0, left) / remaining : 0, pace = day > 0 ? spent / day : 0;
    var proj = cur ? pace * total : spent;
    var cats = CATS.map(function (c) { var lim = (st.limits || {})[c] || 0; return { cat: c, spent: by[c], limit: lim, over: lim > 0 && by[c] > lim, pct: lim > 0 ? Math.min(100, Math.round(by[c] / lim * 100)) : (spent ? Math.round(by[c] / spent * 100) : 0) }; });
    return { spent: spent, left: left, safe: safe, projected: proj, willRunOut: cur && proj > st.allowance && st.allowance > 0, cats: cats, count: ex.length, daysLeft: remaining, over: left < 0 };
  }
  function toCSV(expenses) {
    var q = function (s) { s = String(s == null ? '' : s); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    return 'date,category,amount,note\n' + expenses.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }).map(function (e) { return [e.date, e.cat, e.amount, e.note].map(q).join(','); }).join('\n') + '\n';
  }
  var api = { CATS: CATS, summarize: summarize, toCSV: toCSV, monthKey: monthKey };
  if (typeof module !== 'undefined') module.exports = api; else root.Masroof = api;
})(this);
