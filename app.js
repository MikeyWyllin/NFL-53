(() => {
  const DATA = window.NFL53_DATA;
  const POSITION_ORDER = ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "CB", "S", "OTHER"];
  const EXCLUDED_SELECTION_GROUPS = new Set(["K", "P", "LS"]);
  const MAX_MISSES = 3;

  function addMoreDemoPlayers() {
    const extraPlayers = {
      CAR: {
        "car_christian_mccaffrey": { name: "Christian McCaffrey", position: "RB" },
        "car_dj_moore": { name: "DJ Moore", position: "WR" },
        "car_kelvin_benjamin": { name: "Kelvin Benjamin", position: "WR" },
        "car_brandon_lafell": { name: "Brandon LaFell", position: "WR" },
        "car_robbie_anderson": { name: "Robbie Anderson", position: "WR" },
        "car_ian_thomas": { name: "Ian Thomas", position: "TE" },
        "car_travelle_wharton": { name: "Travelle Wharton", position: "G" },
        "car_jeff_otah": { name: "Jeff Otah", position: "T" },
        "car_taylor_moton": { name: "Taylor Moton", position: "T" },
        "car_matt_kalil": { name: "Matt Kalil", position: "T" },
        "car_maake_kemoeatu": { name: "Maake Kemoeatu", position: "DT" },
        "car_mike_rucker": { name: "Mike Rucker", position: "DE" },
        "car_kris_jenkins": { name: "Kris Jenkins", position: "DT" },
        "car_james_anderson": { name: "James Anderson", position: "LB" },
        "car_jon_beason": { name: "Jon Beason", position: "LB" },
        "car_chris_harris": { name: "Chris Harris", position: "S" },
        "car_captain_munnerlyn": { name: "Captain Munnerlyn", position: "CB" },
        "car_james_bradberry": { name: "James Bradberry", position: "CB" },
        "car_mike_minter": { name: "Mike Minter", position: "S" },
        "car_john_kasay": { name: "John Kasay", position: "K" },
        "car_todd_sauerbrun": { name: "Todd Sauerbrun", position: "P" }
      },
      WAS: {
        "was_mark_brunell": { name: "Mark Brunell", position: "QB" },
        "was_jason_campbell": { name: "Jason Campbell", position: "QB" },
        "was_patrick_ramsey": { name: "Patrick Ramsey", position: "QB" },
        "was_antonio_gibson": { name: "Antonio Gibson", position: "RB" },
        "was_terry_mclaurin": { name: "Terry McLaurin", position: "WR" },
        "was_jamison_crowder": { name: "Jamison Crowder", position: "WR" },
        "was_rod_gardner": { name: "Rod Gardner", position: "WR" },
        "was_jordan_reed": { name: "Jordan Reed", position: "TE" },
        "was_morgan_moses": { name: "Morgan Moses", position: "T" },
        "was_brandon_scherff": { name: "Brandon Scherff", position: "G" },
        "was_randy_thomas": { name: "Randy Thomas", position: "G" },
        "was_jon_jansen": { name: "Jon Jansen", position: "T" },
        "was_casey_rabach": { name: "Casey Rabach", position: "C" },
        "was_jonathan_allen": { name: "Jonathan Allen", position: "DT" },
        "was_daron_payne": { name: "Daron Payne", position: "DT" },
        "was_chase_young": { name: "Chase Young", position: "DE" },
        "was_montez_sweat": { name: "Montez Sweat", position: "DE" },
        "was_rocky_mcintosh": { name: "Rocky McIntosh", position: "LB" },
        "was_carlos_rogers": { name: "Carlos Rogers", position: "CB" },
        "was_shawn_springs": { name: "Shawn Springs", position: "CB" },
        "was_laron_landry": { name: "LaRon Landry", position: "S" },
        "was_kendall_fuller": { name: "Kendall Fuller", position: "CB" }
      },
      NE: {
        "ne_drew_bledsoe": { name: "Drew Bledsoe", position: "QB" },
        "ne_damien_harris": { name: "Damien Harris", position: "RB" },
        "ne_james_white": { name: "James White", position: "RB" },
        "ne_stevan_ridley": { name: "Stevan Ridley", position: "RB" },
        "ne_deion_branch": { name: "Deion Branch", position: "WR" },
        "ne_troy_brown": { name: "Troy Brown", position: "WR" },
        "ne_david_givens": { name: "David Givens", position: "WR" },
        "ne_aaron_hernandez": { name: "Aaron Hernandez", position: "TE" },
        "ne_jermaine_wiggins": { name: "Jermaine Wiggins", position: "TE" },
        "ne_nate_solder": { name: "Nate Solder", position: "T" },
        "ne_joe_thuney": { name: "Joe Thuney", position: "G" },
        "ne_david_andrews": { name: "David Andrews", position: "C" },
        "ne_sebastian_vollmer": { name: "Sebastian Vollmer", position: "T" },
        "ne_ted_washington": { name: "Ted Washington", position: "DT" },
        "ne_rob_ninkovich": { name: "Rob Ninkovich", position: "LB" },
        "ne_chandler_jones": { name: "Chandler Jones", position: "DE" },
        "ne_jamie_collins": { name: "Jamie Collins", position: "LB" },
        "ne_donta_hightower": { name: "Dont'a Hightower", position: "LB" },
        "ne_malcolm_butler": { name: "Malcolm Butler", position: "CB" },
        "ne_logan_ryan": { name: "Logan Ryan", position: "CB" },
        "ne_patrick_chung": { name: "Patrick Chung", position: "S" },
        "ne_matthew_slater": { name: "Matthew Slater", position: "WR" }
      },
      BAL: {
        "bal_elvis_grbac": { name: "Elvis Grbac", position: "QB" },
        "bal_lamar_jackson": { name: "Lamar Jackson", position: "QB" },
        "bal_willis_mcgahee": { name: "Willis McGahee", position: "RB" },
        "bal_todd_heap": { name: "Todd Heap", position: "TE" },
        "bal_derek_mason": { name: "Derrick Mason", position: "WR" },
        "bal_mark_clayton": { name: "Mark Clayton", position: "WR" },
        "bal_breshad_perriman": { name: "Breshad Perriman", position: "WR" },
        "bal_mark_andrews": { name: "Mark Andrews", position: "TE" },
        "bal_ben_grubbs": { name: "Ben Grubbs", position: "G" },
        "bal_orlando_brown": { name: "Orlando Brown Jr.", position: "T" },
        "bal_ronnie_stanley": { name: "Ronnie Stanley", position: "T" },
        "bal_kelechi_osemele": { name: "Kelechi Osemele", position: "G" },
        "bal_kelly_gregg": { name: "Kelly Gregg", position: "DT" },
        "bal_adalius_thomas": { name: "Adalius Thomas", position: "LB" },
        "bal_bart_scott": { name: "Bart Scott", position: "LB" },
        "bal_cj_mosley": { name: "C.J. Mosley", position: "LB" },
        "bal_marlon_humphrey": { name: "Marlon Humphrey", position: "CB" },
        "bal_jimmy_smith": { name: "Jimmy Smith", position: "CB" },
        "bal_earl_thomas": { name: "Earl Thomas", position: "S" },
        "bal_eric_weddle": { name: "Eric Weddle", position: "S" },
        "bal_matt_stover": { name: "Matt Stover", position: "K" }
      }
    };

    for (const [team, players] of Object.entries(extraPlayers)) {
      Object.assign(DATA.players, players);
      const existing = new Set(DATA.franchiseEligible[team] || []);
      for (const id of Object.keys(players)) existing.add(id);
      DATA.franchiseEligible[team] = [...existing];
    }
  }

  addMoreDemoPlayers();

  const state = {
    round: null,
    board: [],
    correctIds: new Set(),
    selectedIds: new Set(),
    wrongIds: new Set(),
    correctPickedIds: new Set(),
    missedIds: new Set(),
    totalScore: 0,
    roundScore: 0,
    roundsCleared: 0,
    roundNumber: 0,
    totalCorrect: 0,
    totalMisses: 0,
    roundMisses: 0,
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
    misses: document.querySelector("#misses"),
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
    state.totalMisses = 0;
    state.runOver = false;
    state.usedRoundKeys = new Set();
    startRound(randomRound());
  }

  function startRound(round = randomRound()) {
    const built = buildRound(round);
    state.round = round;
    state.board = built.board;
    state.correctIds = built.rosterIds;
    state.selectedIds = new Set();
    state.wrongIds = new Set();
    state.correctPickedIds = new Set();
    state.missedIds = new Set();
    state.roundScore = 0;
    state.roundMisses = 0;
    state.submitted = false;
    state.revealed = false;
    state.roundNumber += 1;
    state.usedRoundKeys.add(rosterKey(round));
    els.searchBox.value = "";

    const team = DATA.teams[round.team];
    els.roundTitle.textContent = `${round.year} ${team.name}`;
    els.roundSub.textContent = `Select any players you think were on this roster. Only wrong selections count as misses.`;
    setMessage("Select your answers. Misses only happen when you pick a player who was not on the roster.");
    render();
  }

  function randomRound() {
    const remaining = DATA.rounds.filter(round => !state.usedRoundKeys.has(rosterKey(round)));
    const pool = remaining.length ? remaining : DATA.rounds;
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
    state.missedIds = new Set([...state.correctIds].filter(id => !state.selectedIds.has(id)));
    state.roundMisses = state.wrongIds.size;
    state.roundScore = scoreForCorrect(state.correctPickedIds.size);
    state.totalScore += state.roundScore;
    state.totalCorrect += state.correctPickedIds.size;
    state.totalMisses += state.roundMisses;
    state.submitted = true;

    if (state.roundMisses >= MAX_MISSES) {
      state.runOver = true;
      setMessage(`Game over. ${state.roundMisses} wrong picks on this team. Final run score: ${formatNumber(state.totalScore)}.`, "bad");
      saveLeaderboard("LOSS");
    } else {
      state.roundsCleared += 1;
      setMessage(`Round scored. +${formatNumber(state.roundScore)} points. ${state.roundMisses}/3 wrong picks. Unselected roster players are not penalties.`, "good");
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
    els.misses.textContent = `${state.roundMisses}/${MAX_MISSES}`;
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
    const missed = state.revealed && state.missedIds.has(player.id);
    const revealed = state.revealed && player.isCorrect;
    const classes = ["player-btn"];
    if (selected && !state.submitted) classes.push("selected");
    if (correctPicked) classes.push("correct");
    if (wrongPicked) classes.push("wrong");
    if (missed) classes.push("missed");
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
      setMessage("Submit your round first. Then reveal shows unpicked correct players. They do not count as misses.", "warn");
      return;
    }
    state.revealed = true;
    setMessage("Unpicked correct players are outlined. This does not change your score or miss count.", "warn");
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
      totalMisses: state.totalMisses,
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
