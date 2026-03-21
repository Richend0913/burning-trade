// ── FX収支サンプルデータ（後で実データに差し替え可能） ──
const fxData = [
  { date: '2026-03-21', pnl: 12450, trades: 8, wins: 6, pairs: 'GBPJPY, XAUUSD' },
  { date: '2026-03-20', pnl: 8745, trades: 5, wins: 4, pairs: 'GBPJPY, EURJPY' },
  { date: '2026-03-19', pnl: -3200, trades: 6, wins: 2, pairs: 'XAUUSD, USDJPY' },
  { date: '2026-03-18', pnl: 15680, trades: 7, wins: 5, pairs: 'GBPJPY, XAUUSD' },
  { date: '2026-03-17', pnl: 6320, trades: 4, wins: 3, pairs: 'EURJPY, GBPJPY' },
  { date: '2026-03-16', pnl: -1500, trades: 3, wins: 1, pairs: 'USDJPY' },
  { date: '2026-03-15', pnl: 22100, trades: 9, wins: 7, pairs: 'XAUUSD, GBPJPY, EURJPY' },
  { date: '2026-03-14', pnl: 4890, trades: 5, wins: 3, pairs: 'GBPJPY, USDJPY' },
  { date: '2026-03-13', pnl: 9750, trades: 6, wins: 4, pairs: 'XAUUSD, EURJPY' },
];

// ── FXカード生成 ──
function renderFxCards() {
  const grid = document.getElementById('fxGrid');
  if (!grid) return;

  grid.innerHTML = fxData.map(d => {
    const isPositive = d.pnl >= 0;
    const pnlClass = isPositive ? 'positive' : 'negative';
    const pnlSign = isPositive ? '+' : '';
    const dateStr = new Date(d.date).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });

    return `
      <div class="fx-card">
        <div class="fx-date">${dateStr}</div>
        <div class="fx-pnl ${pnlClass}">${pnlSign}${d.pnl.toLocaleString()} 円</div>
        <div class="fx-details">
          <div class="fx-detail">トレード: <span>${d.trades}回</span></div>
          <div class="fx-detail">勝率: <span>${Math.round(d.wins / d.trades * 100)}%</span></div>
          <div class="fx-detail">通貨: <span>${d.pairs}</span></div>
        </div>
      </div>
    `;
  }).join('');
}

// ── ヒーローの統計 ──
function updateHeroStats() {
  const totalPnl = fxData.reduce((sum, d) => sum + d.pnl, 0);
  const totalTrades = fxData.reduce((sum, d) => sum + d.trades, 0);
  const totalWins = fxData.reduce((sum, d) => sum + d.wins, 0);
  const winRate = Math.round(totalWins / totalTrades * 100);

  animateNumber('totalPnl', totalPnl, true);
  animateNumber('totalTrades', totalTrades, false);
  document.getElementById('winRate').textContent = winRate + '%';
}

// ── 数字アニメーション ──
function animateNumber(id, target, isCurrency) {
  const el = document.getElementById(id);
  if (!el) return;
  const duration = 1500;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * eased);

    if (isCurrency) {
      const sign = current >= 0 ? '+' : '';
      el.textContent = sign + current.toLocaleString();
    } else {
      el.textContent = current.toLocaleString();
    }

    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ── お問い合わせ ──
function handleContact(e) {
  e.preventDefault();
  alert('お問い合わせありがとうございます。\n内容を確認の上、ご連絡いたします。');
  e.target.reset();
  return false;
}

// ── 初期化 ──
document.addEventListener('DOMContentLoaded', () => {
  renderFxCards();
  updateHeroStats();
});
