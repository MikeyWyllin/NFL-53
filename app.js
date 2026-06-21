(() => {
  const DATA = window.NFL53_DATA;
  if (!DATA || !DATA.players || !DATA.rosters || !DATA.teams) {
    document.body.innerHTML = '<main class="shell"><section class="game-card"><h1>53</h1><p class="message bad">Game data did not load. Make sure production-data.js is uploaded in the same folder as index.html.</p></section></main>';
    return;
  }
  const POSITION_ORDER = ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "CB", "S", "OTHER"];
  const EXCLUDED_SELECTION_GROUPS = new Set(["K", "P", "LS"]);
  const MAX_MISSES = 3;

  // Real build only. Do not inject demo players into production data.

  const state = {
    round: null,
    board: [],
    correctIds: new Set(),
    selectedIds: new Set(),
    wrongIds: new Set(),
    correctPickedIds: new Set(),
    unpickedIds: new Set(),
    totalScore: 0,
    roundScore: 0,
    roundsCleared: 0,
    roundNumber: 0,
    totalCorrect: 0,
    totalWrongPicks: 0,
    roundWrongPicks: 0,
    submitted: false,
    runOver: false,
    revealed: false,
    usedRoundKeys: new Set()
  };

  const els = {
    newGameBtn: document.querySelector("#newGameBtn"),
    resetBtn: document.querySelector("#resetBtn"),
    revealBtn: document.querySelector("#revealBtn"),
    clearLeaderboardBtn: document.querySelector("#clearLeaderboardBtn"),
    submitBtn: document.querySelector("#submitBtn"),
    nextRoundBtn: document.querySelector("#nextRoundBtn"),
    searchBox: document.querySelector("#searchBox"),
    roundTitle: document.querySelector("#roundTitle"),
    roundSub: document.querySelector("#roundSub"),
    score: document.querySelector("#score"),
    reward: document.querySelector("#reward"),
    streak: document.querySelector("#streak"),
    wrongPicks: document.querySelector("#misses"),
    correct: document.querySelector("#correct"),
    poolSize: document.querySelector("#poolSize"),
    message: document.querySelector("#message"),
    board: document.querySelector("#board"),
    leaderboard: document.querySelector("#leaderboard")
  };

  function rosterKey(round) {
    return `${round.team}_${round.year}`;
  }

  function normalizePosition(pos = "") {
    const p = String(pos).toUpperCase().trim();
    if (["QB", "RB", "FB", "WR", "TE", "CB", "S"].includes(p)) {
      if (p === "FB") return "RB";
      return p;
    }
    if (["K", "PK", "KICKER"].includes(p)) return "K";
    if (["P", "PUNTER"].includes(p)) return "P";
    if (["LS", "LONG SNAPPER", "LONGSNAPPER"].includes(p)) return "LS";
    if (["C", "G", "T", "OT", "OG", "LT", "LG", "RG", "RT", "OL"].includes(p)) return "OL";
    if (["DE", "DT", "NT", "DL", "EDGE"].includes(p)) return "DL";
    if (["LB", "MLB", "ILB", "OLB"].includes(p)) return "LB";
    if (["FS", "SS", "DB"].includes(p)) return "S";
    return "OTHER";
  }

  function isSelectionEligible(player) {
    return player && !EXCLUDED_SELECTION_GROUPS.has(normalizePosition(player.position));
  }

  function buildRound(round) {
    const key = rosterKey(round);
    const rosterIdsRaw = new Set(DATA.rosters[key] ?? []);
    const masterIds = new Set(DATA.franchiseEligible[round.team] ?? []);
    const mergedIds = [...new Set([...rosterIdsRaw, ...masterIds])];

    const board = mergedIds
      .filter(id => isSelectionEligible(DATA.players[id]))
      .map(id => {
        const player = DATA.players[id];
        return {
          id,
          name: player.name,
          rawPosition: player.position,
          group: normalizePosition(player.position),
          isCorrect: rosterIdsRaw.has(id)
        };
      })
      .sort((a, b) => {
        const groupSort = POSITION_ORDER.indexOf(a.group) - POSITION_ORDER.indexOf(b.group);
        if (groupSort !== 0) return groupSort;
        return a.name.localeCompare(b.name);
      });

    const rosterIds = new Set(board.filter(player => player.isCorrect).map(player => player.id));
    return { board, rosterIds };
  }

  function startRun() {
    state.totalScore = 0;
    state.roundScore = 0;
    state.roundsCleared = 0;
    state.roundNumber = 0;
    state.totalCorrect = 0;
    state.totalWrongPicks = 0;
    state.runOver = false;
    state.usedRoundKeys = new Set();
    try {
      startRound(randomRound());
    } catch (error) {
      console.error(error);
      setMessage("Real data did not load. Check that production-data.js is in the same folder as index.html.", "bad");
    }
  }

  function startRound(round = randomRound()) {
    const built = buildRound(round);
    state.round = round;
    state.board = built.board;
    state.correctIds = built.rosterIds;
    state.selectedIds = new Set();
    state.wrongIds = new Set();
    state.correctPickedIds = new Set();
    state.unpickedIds = new Set();
    state.roundScore = 0;
    state.roundWrongPicks = 0;
    state.submitted = false;
    state.revealed = false;
    state.roundNumber += 1;
    state.usedRoundKeys.add(rosterKey(round));
    els.searchBox.value = "";

    const team = DATA.teams[round.team];
    els.roundTitle.textContent = `${round.year} ${team.name}`;
    const teamCount = DATA.teams ? Object.keys(DATA.teams).length : 0;
    const roundCount = allPlayableRounds().length;
    els.roundSub.textContent = `Select players you think were on this roster. Wrong picks only. ${teamCount} teams · ${roundCount} possible rounds.`;
    setMessage("Submit when done. Wrong picks are selected players who were not on the roster. Unpicked roster players do not hurt you.");
    render();
  }

  function allPlayableRounds() {
    const map = new Map();

    // Use every roster key in production-data.js so the game pulls from all 32 teams,
    // not just the small demo rounds array.
    for (const key of Object.keys(DATA.rosters || {})) {
      const match = key.match(/^([A-Z0-9]+)_(\d{4})$/);
      if (!match) continue;
      const [, team, year] = match;
      if (!DATA.teams || !DATA.teams[team]) continue;
      map.set(key, { team, year: Number(year) });
    }

    // Keep this only as fallback in case a future data file stores rounds directly.
    for (const round of DATA.rounds || []) {
      if (!round || !round.team || !round.year) continue;
      if (!DATA.teams || !DATA.teams[round.team]) continue;
      map.set(rosterKey(round), { team: round.team, year: Number(round.year) });
    }

    return [...map.values()].filter(round => {
      const built = buildRound(round);
      return built.board.length > 0 && built.rosterIds.size > 0;
    });
  }

  function randomRound() {
    const rounds = allPlayableRounds();
    if (!rounds.length) {
      throw new Error("No playable rounds found. production-data.js may not be loading.");
    }
    const remaining = rounds.filter(round => !state.usedRoundKeys.has(rosterKey(round)));
    const pool = remaining.length ? remaining : rounds;
    if (!remaining.length) state.usedRoundKeys = new Set();
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function togglePlayer(id) {
    if (!state.round || state.submitted || state.runOver) return;
    if (state.selectedIds.has(id)) state.selectedIds.delete(id);
    else state.selectedIds.add(id);
    render();
  }

  function submitRound() {
    if (!state.round || state.submitted || state.runOver) return;
    if (state.selectedIds.size === 0) {
      setMessage("Select at least one player before submitting.", "warn");
      return;
    }

    state.wrongIds = new Set([...state.selectedIds].filter(id => !state.correctIds.has(id)));
    state.correctPickedIds = new Set([...state.selectedIds].filter(id => state.correctIds.has(id)));
    // Unpicked correct players are saved only for reveal. They NEVER count as wrong picks.
    state.unpickedIds = new Set([...state.correctIds].filter(id => !state.selectedIds.has(id)));
    state.roundWrongPicks = state.wrongIds.size;
    state.roundScore = scoreForCorrect(state.correctPickedIds.size);
    state.totalScore += state.roundScore;
    state.totalCorrect += state.correctPickedIds.size;
    state.totalWrongPicks += state.roundWrongPicks;
    state.submitted = true;

    if (state.roundWrongPicks >= MAX_MISSES) {
      state.runOver = true;
      setMessage(`Game over. ${state.roundWrongPicks} wrong picks on this team. Final run score: ${formatNumber(state.totalScore)}.`, "bad");
      saveLeaderboard("LOSS");
    } else {
      state.roundsCleared += 1;
      setMessage(`Round scored. +${formatNumber(state.roundScore)} points. ${state.roundWrongPicks}/3 wrong picks. Unpicked roster players were ignored.`, "good");
    }
    render();
  }

  function scoreForCorrect(correctCount) {
    if (!correctCount) return 0;
    return Math.pow(2, Math.min(correctCount, 53)) - 1;
  }

  function render() {
    renderMetrics();
    renderBoard();
    renderActions();
    renderLeaderboard();
  }

  function renderMetrics() {
    els.score.textContent = formatNumber(state.totalScore);
    els.reward.textContent = formatNumber(state.roundScore);
    els.streak.textContent = state.roundsCleared;
    els.wrongPicks.textContent = `${state.roundWrongPicks}/${MAX_MISSES}`;
    els.correct.textContent = state.submitted
      ? `${state.correctPickedIds.size}/${state.correctIds.size}`
      : `${state.selectedIds.size}`;
    els.poolSize.textContent = state.board.length;
  }

  function renderActions() {
    els.submitBtn.disabled = !state.round || state.submitted || state.runOver;
    els.nextRoundBtn.classList.toggle("hidden", !(state.submitted && !state.runOver));
    els.nextRoundBtn.disabled = !(state.submitted && !state.runOver);
  }

  function renderBoard() {
    if (!state.round) {
      els.board.innerHTML = "";
      return;
    }

    const query = els.searchBox.value.trim().toLowerCase();
    const filtered = state.board.filter(player => {
      return !query || player.name.toLowerCase().includes(query) || player.group.toLowerCase().includes(query);
    });

    const groups = new Map();
    for (const group of POSITION_ORDER) groups.set(group, []);
    filtered.forEach(player => groups.get(player.group).push(player));

    els.board.innerHTML = [...groups.entries()]
      .filter(([, players]) => players.length)
      .map(([group, players]) => `
        <section class="position-group">
          <h3>${group} <span class="muted">${players.length}</span></h3>
          <div class="player-list">
            ${players.map(player => playerButtonHtml(player)).join("")}
          </div>
        </section>
      `).join("");

    els.board.querySelectorAll("button[data-player-id]").forEach(btn => {
      btn.addEventListener("click", () => togglePlayer(btn.dataset.playerId));
    });
  }

  function playerButtonHtml(player) {
    const selected = state.selectedIds.has(player.id);
    const correctPicked = state.submitted && state.correctPickedIds.has(player.id);
    const wrongPicked = state.submitted && state.wrongIds.has(player.id);
    const unpicked = state.revealed && state.unpickedIds.has(player.id);
    const revealed = state.revealed && player.isCorrect;
    const classes = ["player-btn"];
    if (selected && !state.submitted) classes.push("selected");
    if (correctPicked) classes.push("correct");
    if (wrongPicked) classes.push("wrong");
    if (unpicked) classes.push("unpicked");
    if (revealed) classes.push("revealed");
    const disabled = state.submitted || state.runOver ? "disabled" : "";
    return `<button class="${classes.join(" ")}" data-player-id="${player.id}" ${disabled}>
      ${escapeHtml(player.name)}
      <small>${escapeHtml(player.rawPosition)}</small>
    </button>`;
  }

  function revealAnswers() {
    if (!state.round) return;
    if (!state.submitted) {
      setMessage("Submit first. Reveal only shows correct players you left unpicked. They do not count against you.", "warn");
      return;
    }
    state.revealed = true;
    setMessage("Outlined players were correct answers you left unpicked. They are NOT wrong picks and do not change score.", "warn");
    render();
  }

  function resetCurrentRound() {
    if (!state.round || state.submitted || state.runOver) return;
    state.selectedIds = new Set();
    setMessage("Round selections cleared.");
    render();
  }

  function setMessage(text, type = "") {
    els.message.textContent = text;
    els.message.className = `message ${type}`.trim();
  }

  function saveLeaderboard(result) {
    const key = "nfl53_leaderboard_v2";
    const team = DATA.teams[state.round.team];
    const run = {
      result,
      finalTeam: `${state.round.year} ${team.name}`,
      score: state.totalScore,
      roundsCleared: state.roundsCleared,
      totalCorrect: state.totalCorrect,
      totalWrongPicks: state.totalWrongPicks,
      date: new Date().toISOString()
    };
    const current = JSON.parse(localStorage.getItem(key) || "[]");
    current.push(run);
    current.sort((a, b) => b.score - a.score || b.roundsCleared - a.roundsCleared || b.totalCorrect - a.totalCorrect);
    localStorage.setItem(key, JSON.stringify(current.slice(0, 10)));
    renderLeaderboard();
  }

  function renderLeaderboard() {
    const runs = JSON.parse(localStorage.getItem("nfl53_leaderboard_v2") || "[]");
    els.leaderboard.innerHTML = runs.length
      ? runs.map(run => `<li><strong>${formatNumber(run.score)}</strong> — ${run.roundsCleared} teams cleared · ${run.totalCorrect} correct · ended on ${escapeHtml(run.finalTeam)}</li>`).join("")
      : `<li>No runs yet.</li>`;
  }

  function clearLeaderboard() {
    localStorage.removeItem("nfl53_leaderboard_v2");
    renderLeaderboard();
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("en-US").format(value);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  els.newGameBtn.addEventListener("click", startRun);
  els.resetBtn.addEventListener("click", resetCurrentRound);
  els.revealBtn.addEventListener("click", revealAnswers);
  els.clearLeaderboardBtn.addEventListener("click", clearLeaderboard);
  els.submitBtn.addEventListener("click", submitRound);
  els.nextRoundBtn.addEventListener("click", () => startRound(randomRound()));
  els.searchBox.addEventListener("input", renderBoard);

  renderLeaderboard();
})();
