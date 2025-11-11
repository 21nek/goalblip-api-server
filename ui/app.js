const LIST_SOURCES = {
  today: {
    label: 'Bugün',
    primary: '/data/lists/latest.json',
    fallback: '/data/lists/sample-latest.json',
  },
  tomorrow: {
    label: 'Yarın',
    primary: '/data/lists/upcoming.json',
    fallback: '/data/lists/sample-upcoming.json',
  },
};

const state = {
  matches: [],
  selectedMatchId: null,
  cache: new Map(),
  source: 'today',
  listMeta: null,
};

const listContainer = document.querySelector('#match-list');
const detailRoot = document.querySelector('#detail-root');
const refreshButton = document.querySelector('#refresh-list');
const listMetaEl = document.querySelector('#list-meta');
const tabButtons = document.querySelectorAll('[data-list-source]');

refreshButton?.addEventListener('click', () => {
  loadMatchList(true, state.source);
});

tabButtons.forEach((btn) =>
  btn.addEventListener('click', () => {
    const sourceKey = btn.getAttribute('data-list-source');
    loadMatchList(true, sourceKey);
  }),
);

function highlightActiveTab() {
  tabButtons.forEach((btn) => {
    const key = btn.getAttribute('data-list-source');
    btn.classList.toggle('active', key === state.source);
  });
}

function renderListMeta() {
  if (!state.listMeta) {
    listMetaEl.textContent = '';
    return;
  }
  const { dataDate, view, total } = state.listMeta;
  const viewLabel = LIST_SOURCES[state.source]?.label ?? LIST_SOURCES[view]?.label ?? view;
  listMetaEl.innerHTML = `
    <span>Tarih: <strong>${dataDate || '—'}</strong></span>
    <span>Görünüm: ${viewLabel || '—'}</span>
    <span>Toplam Maç: ${total ?? state.matches.length}</span>
  `;
}

async function fetchWithFallback(primary, fallback) {
  try {
    const res = await fetch(primary);
    if (res.ok) {
      return await res.json();
    }
    if (!fallback) {
      throw new Error(`İstek başarısız: ${res.status}`);
    }
  } catch (error) {
    if (!fallback) {
      throw error;
    }
  }

  const fallbackRes = await fetch(fallback);
  if (!fallbackRes.ok) {
    throw new Error('Primary ve yedek veri kaynakları yüklenemedi.');
  }
  return fallbackRes.json();
}

async function loadMatchList(force = false, sourceKey = 'today') {
  if (!LIST_SOURCES[sourceKey]) {
    throw new Error(`Bilinmeyen kaynak: ${sourceKey}`);
  }

  if (state.matches.length && !force && state.source === sourceKey) {
    return;
  }

  state.source = sourceKey;
  highlightActiveTab();
  listContainer.innerHTML = '<p class="placeholder">Maç listesi yükleniyor...</p>';
  try {
    const { primary, fallback } = LIST_SOURCES[sourceKey];
    const data = await fetchWithFallback(primary, fallback);
    state.matches = data.matches ?? [];
    state.listMeta = {
      dataDate: data.dataDate,
      view: data.view ?? sourceKey,
      total: data.totalMatches ?? state.matches.length,
    };
    renderMatchList();
    renderListMeta();
    if (state.matches.length) {
      selectMatch(state.matches[0].matchId);
    }
  } catch (error) {
    listContainer.innerHTML = `<p class="placeholder">Maç listesi getirilemedi: ${error.message}</p>`;
    state.listMeta = null;
    renderListMeta();
  }
}

function renderMatchList() {
  if (!state.matches.length) {
    listContainer.innerHTML =
      '<p class="placeholder">Hiç veri yok. <code>npm run data:sample</code> veya yeni scrape komutunu çalıştırabilirsiniz.</p>';
    return;
  }

  listContainer.innerHTML = state.matches
    .map((match) => {
      const isActive = state.selectedMatchId === match.matchId;
      return `<article class="match-item${isActive ? ' active' : ''}" data-match-id="${match.matchId}">
        <div class="match-meta">
          <span>${match.league}</span>
          <span>${match.kickoffTime || ''}</span>
        </div>
        <div class="match-teams">
          <strong>${match.homeTeam}</strong>
          <span>${match.awayTeam}</span>
        </div>
      </article>`;
    })
    .join('');

  listContainer.querySelectorAll('.match-item').forEach((element) => {
    element.addEventListener('click', () => {
      const matchId = Number(element.dataset.matchId);
      selectMatch(matchId);
    });
  });
}

async function selectMatch(matchId) {
  if (!matchId || state.selectedMatchId === matchId) {
    return;
  }
  state.selectedMatchId = matchId;
  renderMatchList();

  const selectedMatch = state.matches.find((m) => m.matchId === matchId);
  detailRoot.innerHTML = `<p class="placeholder">#${matchId} maç detayı yükleniyor...</p>`;

  try {
    const detail = await loadMatchDetail(matchId);
    renderMatchDetail(detail);
  } catch (error) {
    detailRoot.innerHTML = `<div class="info-card">
      <h3>Detay yüklenemedi</h3>
      <p>${error.message}</p>
      <p>
        Detay JSON'u oluşturmak için:
        <code>npm run scrape:detail -- ${matchId} --home="${selectedMatch?.homeTeam || ''}" --away="${
      selectedMatch?.awayTeam || ''
    }" &gt; data/matches/${matchId}.json</code>
      </p>
    </div>`;
  }
}

async function loadMatchDetail(matchId) {
  if (state.cache.has(matchId)) {
    return state.cache.get(matchId);
  }

  const primary = `/data/matches/${matchId}.json`;
  const fallback = `/data/matches/sample-${matchId}.json`;

  const detail = await fetchWithFallback(primary, fallback);
  state.cache.set(matchId, detail);
  return detail;
}

function renderMatchDetail(detail) {
  const scoreboard = detail.scoreboard
    ? renderScoreboard(detail.scoreboard)
    : '<p class="placeholder">Skorboard verisi bulunamadı.</p>';

  const highlight = renderCardSection(
    'Öne Çıkan Tahminler',
    detail.highlightPredictions,
    renderHighlightCard,
  );
  const detailedPredictions = renderCardSection(
    'Detaylı Tahminler',
    detail.detailPredictions,
    renderDetailedCard,
  );

  const odds = detail.oddsTrends?.length
    ? `<section>
        <h2>Oran Trend Analizi</h2>
        ${detail.oddsTrends
          .map(
            (group) => `<div class="info-card">
              <h4>${group.title}</h4>
              ${group.cards
                .map(
                  (card) => `<div class="sub-card">
                    <h5>${card.title}</h5>
                    <ul>
                      ${card.rows
                        .map(
                          (row) =>
                            `<li><strong>${row.label}:</strong> ${row.values.filter(Boolean).join(
                              ' · ',
                            )}</li>`,
                        )
                        .join('')}
                    </ul>
                  </div>`,
                )
                .join('')}
            </div>`,
          )
          .join('')}
      </section>`
    : '';

  const upcoming = detail.upcomingMatches?.length
    ? `<section>
        <h2>Gelecek Maçlar</h2>
        <div class="card-grid">
          ${detail.upcomingMatches
            .map(
              (team) => `<div class="info-card">
                <h4>${team.team}</h4>
                <p class="placeholder">${team.role || ''}</p>
                <ul>
                  ${team.matches
                    .map(
                      (fixture) =>
                        `<li>
                          <strong>${fixture.opponent}</strong>
                          <div>${fixture.competition || ''}</div>
                          <small>${fixture.dateText || ''} ${fixture.tag ? `· ${fixture.tag}` : ''}</small>
                        </li>`,
                    )
                    .join('')}
                </ul>
              </div>`,
            )
            .join('')}
        </div>
      </section>`
    : '';

  detailRoot.innerHTML = `
    ${scoreboard}
    ${highlight}
    ${detailedPredictions}
    ${odds}
    ${upcoming}
  `;
}

function renderScoreboard(board) {
  const badgeMarkup = board.statusBadges
    ?.filter(Boolean)
    .map((badge) => `<span class="badge">${badge}</span>`)
    .join('') || '';

  const infoRow = board.info?.length
    ? `<div class="info-row">${board.info.map((chip) => `<span>${chip}</span>`).join('')}</div>`
    : '';

  return `<section class="scoreboard">
    <div class="scoreboard-header">
      <span>${board.leagueLabel || 'Lig bilgisi yok'}</span>
      <div>${badgeMarkup}</div>
    </div>
    <div class="scoreboard-grid">
      ${renderTeamBlock(board.homeTeam, true)}
      <div class="team-block">
        <div class="score-value">${formatScore(board.homeTeam?.score)}</div>
        <div class="score-value">${formatScore(board.awayTeam?.score)}</div>
        <small>${board.halftimeScore ? `Devre: ${board.halftimeScore}` : ''}</small>
      </div>
      ${renderTeamBlock(board.awayTeam, false)}
    </div>
    ${infoRow}
  </section>`;
}

function renderTeamBlock(team, isHome) {
  if (!team) {
    return '<div class="team-block"><em>Takım bilgisi yok</em></div>';
  }
  return `<div class="team-block">
    <div class="badge">${isHome ? 'Ev Sahibi' : 'Deplasman'}</div>
    <h3>${team.name || '-'}</h3>
  </div>`;
}

function formatScore(value) {
  return typeof value === 'number' && !Number.isNaN(value) ? value : '-';
}

function renderCardSection(title, items = [], renderer) {
  if (!items.length) {
    return '';
  }
  return `<section>
    <h2>${title}</h2>
    <div class="card-grid">
      ${items.map(renderer).join('')}
    </div>
  </section>`;
}

function renderHighlightCard(card) {
  return `<div class="info-card">
    <h4>${card.title || '-'}</h4>
    <p class="score-value">${card.pickCode || '---'}</p>
    <p>Başarı: ${card.successRate ?? '—'}%</p>
    <p>Güven: ${card.rating}/${card.ratingMax}</p>
    ${card.locked ? '<small class="badge">Premium içerik</small>' : ''}
  </div>`;
}

function renderDetailedCard(card) {
  return `<div class="info-card">
    <h4>${card.title || '-'}</h4>
    <p>Güven göstergesi: ${card.confidence ?? '—'}%</p>
    <ul>
      ${card.outcomes
        .map((outcome) => `<li><strong>${outcome.label}:</strong> ${outcome.valuePercent ?? '—'}%</li>`)
        .join('')}
    </ul>
  </div>`;
}

loadMatchList();
