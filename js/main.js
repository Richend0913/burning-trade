// ── FX収支データ（サンプル - 後でKagemushaから自動連携） ──
const fxData = [
  { date: '2026-03-23', pnl: -4369, trades: 2, wins: 0, pairs: 'EURJPY, GBPJPY', bot: 'Confluence' },
  { date: '2026-03-20', pnl: 3561, trades: 2, wins: 1, pairs: 'EURJPY, GBPJPY', bot: 'Confluence' }
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
        <div class="fx-date">${dateStr} <span style="color:#666; font-size:.75rem;">| ${d.bot}</span></div>
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

// ── サマリー生成 ──
function renderSummary() {
  const row = document.getElementById('summaryRow');
  if (!row) return;

  const totalPnl = fxData.reduce((s, d) => s + d.pnl, 0);
  const totalTrades = fxData.reduce((s, d) => s + d.trades, 0);
  const totalWins = fxData.reduce((s, d) => s + d.wins, 0);
  const winDays = fxData.filter(d => d.pnl > 0).length;
  const loseDays = fxData.filter(d => d.pnl < 0).length;
  const profitDaysData = fxData.filter(d => d.pnl > 0);
  const lossDaysData = fxData.filter(d => d.pnl < 0);
  const maxWin = profitDaysData.length ? Math.max(...profitDaysData.map(d => d.pnl)) : 0;
  const maxLose = lossDaysData.length ? Math.min(...lossDaysData.map(d => d.pnl)) : 0;
  const avgPnl = Math.round(totalPnl / fxData.length);

  const items = [
    { label: '累計損益', value: (totalPnl >= 0 ? '+' : '') + totalPnl.toLocaleString() + ' 円', cls: totalPnl >= 0 ? 'positive' : 'negative' },
    { label: '勝率', value: Math.round(totalWins / totalTrades * 100) + '%', cls: 'neutral' },
    { label: '勝ち日 / 負け日', value: `${winDays}日 / ${loseDays}日`, cls: 'neutral' },
    { label: '1日平均損益', value: (avgPnl >= 0 ? '+' : '') + avgPnl.toLocaleString() + ' 円', cls: avgPnl >= 0 ? 'positive' : 'negative' },
    { label: '最大利益（1日）', value: '+' + maxWin.toLocaleString() + ' 円', cls: 'positive' },
    { label: '最大損失（1日）', value: maxLose === 0 ? '0 円' : maxLose.toLocaleString() + ' 円', cls: maxLose === 0 ? 'neutral' : 'negative' },
  ];

  row.innerHTML = items.map(i => `
    <div class="summary-item">
      <div class="summary-label">${i.label}</div>
      <div class="summary-value ${i.cls}">${i.value}</div>
    </div>
  `).join('');
}

// ── ヒーローの統計 ──
function updateHeroStats() {
  const totalPnl = fxData.reduce((s, d) => s + d.pnl, 0);
  const totalTrades = fxData.reduce((s, d) => s + d.trades, 0);
  const totalWins = fxData.reduce((s, d) => s + d.wins, 0);
  const winRate = Math.round(totalWins / totalTrades * 100);

  animateNumber('totalPnl', totalPnl, true);
  animateNumber('totalTrades', totalTrades, false);
  animateNumber('totalBalance', totalPnl, true);
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

// ── 収支推移グラフ ──
let pnlChart = null;
function renderPnlChart() {
  const ctx = document.getElementById('pnlChart');
  if (!ctx) return;

  const sorted = [...fxData].reverse();
  const labels = sorted.map(d => {
    const dt = new Date(d.date);
    return (dt.getMonth() + 1) + '/' + dt.getDate();
  });
  const dailyPnl = sorted.map(d => d.pnl);

  // 累計計算
  let cumulative = [];
  let sum = 0;
  for (const p of dailyPnl) {
    sum += p;
    cumulative.push(sum);
  }

  pnlChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '日次損益（円）',
          data: dailyPnl,
          backgroundColor: dailyPnl.map(v => v >= 0 ? 'rgba(102,187,106,.6)' : 'rgba(239,83,80,.6)'),
          borderRadius: 4,
          order: 2,
        },
        {
          label: '累計損益（円）',
          data: cumulative,
          type: 'line',
          borderColor: '#4fc3f7',
          backgroundColor: 'rgba(79,195,247,.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#4fc3f7',
          order: 1,
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { labels: { color: '#999' } },
        tooltip: {
          callbacks: {
            label: (ctx) => ctx.dataset.label + ': ' + (ctx.parsed.y >= 0 ? '+' : '') + ctx.parsed.y.toLocaleString() + ' 円'
          }
        }
      },
      scales: {
        x: { ticks: { color: '#666' }, grid: { color: 'rgba(255,255,255,.04)' } },
        y: {
          ticks: {
            color: '#666',
            callback: v => (v >= 0 ? '+' : '') + (v / 1000).toFixed(0) + 'k'
          },
          grid: { color: 'rgba(255,255,255,.04)' }
        }
      }
    }
  });
}

// ── 通貨ペア別グラフ ──
function renderPairChart() {
  const ctx = document.getElementById('pairChart');
  if (!ctx) return;

  // 通貨ペア別集計
  const pairPnl = {};
  fxData.forEach(d => {
    d.pairs.split(', ').forEach(pair => {
      if (!pairPnl[pair]) pairPnl[pair] = 0;
      pairPnl[pair] += Math.round(d.pnl / d.pairs.split(', ').length);
    });
  });

  const pairs = Object.keys(pairPnl);
  const values = Object.values(pairPnl);

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: pairs,
      datasets: [{
        data: values.map(Math.abs),
        backgroundColor: ['#4fc3f7', '#ab47bc', '#66bb6a', '#ffb74d', '#ef5350'],
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#999', padding: 16 } },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const idx = ctx.dataIndex;
              const v = values[idx];
              return pairs[idx] + ': ' + (v >= 0 ? '+' : '') + v.toLocaleString() + ' 円';
            }
          }
        }
      }
    }
  });
}

// ── Bot別グラフ ──
function renderBotChart() {
  const ctx = document.getElementById('botChart');
  if (!ctx) return;

  const botPnl = {};
  fxData.forEach(d => {
    if (!botPnl[d.bot]) botPnl[d.bot] = 0;
    botPnl[d.bot] += d.pnl;
  });

  const bots = Object.keys(botPnl);
  const values = Object.values(botPnl);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: bots,
      datasets: [{
        label: '損益（円）',
        data: values,
        backgroundColor: values.map(v => v >= 0 ? 'rgba(102,187,106,.7)' : 'rgba(239,83,80,.7)'),
        borderRadius: 8,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => (ctx.parsed.x >= 0 ? '+' : '') + ctx.parsed.x.toLocaleString() + ' 円'
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#666', callback: v => (v / 1000).toFixed(0) + 'k' },
          grid: { color: 'rgba(255,255,255,.04)' }
        },
        y: { ticks: { color: '#ccc' }, grid: { display: false } }
      }
    }
  });
}

// ── 統計テーブル ──
function renderStatsTable() {
  const tbody = document.querySelector('#statsTable tbody');
  if (!tbody) return;

  const totalPnl = fxData.reduce((s, d) => s + d.pnl, 0);
  const totalTrades = fxData.reduce((s, d) => s + d.trades, 0);
  const totalWins = fxData.reduce((s, d) => s + d.wins, 0);
  const profitDays = fxData.filter(d => d.pnl > 0);
  const lossDays = fxData.filter(d => d.pnl < 0);
  const avgProfit = profitDays.length ? Math.round(profitDays.reduce((s, d) => s + d.pnl, 0) / profitDays.length) : 0;
  const avgLoss = lossDays.length ? Math.round(lossDays.reduce((s, d) => s + d.pnl, 0) / lossDays.length) : 0;
  const pf = avgLoss !== 0 ? Math.abs(avgProfit / avgLoss).toFixed(2) : '-';

  const stats = [
    ['運用期間', fxData.length + ' 日間'],
    ['累計損益', (totalPnl >= 0 ? '+' : '') + totalPnl.toLocaleString() + ' 円'],
    ['総トレード数', totalTrades + ' 回'],
    ['勝率', Math.round(totalWins / totalTrades * 100) + '%'],
    ['勝ち日数 / 負け日数', profitDays.length + ' 日 / ' + lossDays.length + ' 日'],
    ['平均利益（勝ち日）', '+' + avgProfit.toLocaleString() + ' 円'],
    ['平均損失（負け日）', avgLoss.toLocaleString() + ' 円'],
    ['プロフィットファクター', pf],
    ['稼働Bot数', '3（Kagemusha + EA-Alpha + EA-Beta）'],
    ['取引通貨ペア', 'GBPJPY, XAUUSD, EURJPY, USDJPY'],
  ];

  tbody.innerHTML = stats.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');
}

// ── 申請フォーム ──
function handleApply(e) {
  e.preventDefault();
  alert('参加申請ありがとうございます！\n確認でき次第、Discordの招待リンクをお送りします。');
  e.target.reset();
  return false;
}

// ── 初期化 ──
document.addEventListener('DOMContentLoaded', () => {
  renderFxCards();
  renderSummary();
  updateHeroStats();
  renderPnlChart();
  renderPairChart();
  renderBotChart();
  renderStatsTable();
});
