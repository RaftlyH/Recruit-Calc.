"use strict";

/*
 * RECRUITMENT CALCULATOR
 * Read in this order:
 *   1. Configuration and data
 *   2. Application state
 *   3. Matching and combination algorithms
 *   4. HTML builders
 *   5. Page rendering
 *   6. User interactions
 *   7. Startup
 *
 * operators.js must load before this file (see index.html).
 */
(() => {
  // 1. CONFIGURATION AND DATA
  // -------------------------
  const MAX_SELECTED_TAGS = 5;
  const MAX_COMBINATION_SIZE = 3;

  const RARITY_TAGS = {
    1: "Robot",
    2: "Starter",
    5: "Senior Operator",
    6: "Top Operator"
  };

  const TAG_GROUPS = {
    Rarity: ["Robot", "Starter", "Senior Operator", "Top Operator"],
    Position: ["Melee", "Ranged"],
    Class: ["Vanguard", "Guard", "Defender", "Sniper", "Caster", "Medic", "Supporter", "Specialist"],
    Affix: ["AoE", "Crowd-Control", "Debuff", "Defense", "DP-Recovery", "DPS", "Elemental", "Fast-Redeploy", "Healing", "Nuker", "Shift", "Slow", "Summon", "Support", "Survival"]
  };

  const RARITY_COLORS = {
    1: "#b7c3c7",
    2: "#a6c68f",
    3: "#8ebee1",
    4: "#bea6e4",
    5: "#e1d188",
    6: "#e8af6d"
  };

  // A small helper saves repeating document.getElementById().
  function getElement(id) {
    return document.getElementById(id);
  }

  // Expand the data records into the complete tags used for matching.
  const operators = window.RECRUITMENT_OPERATORS.map((operator, id) => {
    const fullTags = [
      operator.cls,
      operator.pos,
      ...operator.tags,
      RARITY_TAGS[operator.stars]
    ].filter(Boolean); // Remove undefined rarity tags for 3★ and 4★.

    return {
      ...operator,
      id,
      tags: [...new Set(fullTags)] // Keep each tag only once.
    };
  });

  // 2. APPLICATION STATE
  // --------------------
  // State is the information the app remembers between clicks.
  const state = {
    selectedTags: new Set(["Top Operator"]),
    view: "combos"
  };

  // 3. MATCHING AND COMBINATION ALGORITHMS
  // --------------------------------------
  function findMatches(tags) {
    return operators.filter(operator => {
      // Six-star operators require Top Operator in this combination.
      if (operator.stars === 6 && !tags.includes("Top Operator")) {
        return false;
      }

      // The operator must contain EVERY requested tag.
      return tags.every(tag => operator.tags.includes(tag));
    });
  }

  function generateCombinations(tags) {
    const combinations = [];

    // Recursion builds a group, then tries adding each remaining tag.
    function walk(startIndex, currentGroup) {
      if (currentGroup.length > 0) {
        combinations.push(currentGroup);
      }

      if (currentGroup.length === MAX_COMBINATION_SIZE) {
        return;
      }

      for (let index = startIndex; index < tags.length; index++) {
        walk(index + 1, [...currentGroup, tags[index]]);
      }
    }

    walk(0, []);
    return combinations;
  }

  // These filters change visibility only, not matching or rarity minimums.
  function filterVisibleOperators(list) {
    const query = getElement("search").value.trim().toLocaleLowerCase();
    const showRobots = getElement("robots").checked;
    const showLowRarities = getElement("low").checked;

    return list.filter(operator => {
      if (operator.stars === 1 && !showRobots) return false;
      if ([2, 3].includes(operator.stars) && !showLowRarities) return false;
      return operator.name.toLocaleLowerCase().includes(query);
    });
  }

  function sortOperators(list) {
    const sortByName = getElement("sort").value === "name";

    // Copy the list so sorting does not change its original order.
    return [...list].sort((first, second) => {
      if (sortByName) return first.name.localeCompare(second.name);

      // Rarity descending; name ascending when rarities tie.
      return second.stars - first.stars || first.name.localeCompare(second.name);
    });
  }

  function calculateCombinations(tags) {
    return generateCombinations(tags)
      .map(combinationTags => {
        const matches = findMatches(combinationTags);

        return {
          tags: combinationTags,
          matches,
          visible: filterVisibleOperators(matches),
          // Calculate from ALL matches before hiding any operator cards.
          minimum: matches.length ? Math.min(...matches.map(operator => operator.stars)) : 0
        };
      })
      .filter(combination => combination.matches.length > 0);
  }

  // 4. HTML BUILDERS
  // ----------------
  // Escape text before inserting it into HTML or an attribute.
  function escapeHtml(value) {
    const replacements = {
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    };
    return String(value).replace(/[&<>"']/g, character => replacements[character]);
  }

  function buildTagLabels(tags) {
    return tags.map(tag => `<span class="mini-tag">${escapeHtml(tag)}</span>`).join("");
  }

  function buildOperatorCard(operator) {
    const color = RARITY_COLORS[operator.stars];
    const initials = operator.name
      .replace(/^'/, "")
      .split(/[\s-]/)
      .filter(Boolean)
      .map(word => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return `
      <button class="operator" data-op="${operator.id}"
        style="--accent: ${color}; --glow: ${color}38"
        aria-label="${escapeHtml(operator.name)}, ${operator.stars} stars, ${operator.cls}. Show details.">
        <div class="portrait">
          <span class="class-mark">${operator.cls}</span>
          <span class="monogram" aria-hidden="true">${escapeHtml(initials)}</span>
        </div>
        <div class="op-info">
          <div class="name" title="${escapeHtml(operator.name)}">${escapeHtml(operator.name)}</div>
          <div class="stars">${"★".repeat(operator.stars)}</div>
          <div class="position">${operator.pos} · ${operator.cls}</div>
        </div>
      </button>`;
  }

  function buildOperatorGrid(list) {
    return `<div class="grid">${sortOperators(list).map(buildOperatorCard).join("")}</div>`;
  }

  function buildEmptyResults(message) {
    return `
      <div class="empty">
        <strong>No visible matches.</strong>
        ${escapeHtml(message)}<br>
        <button data-clear-filters>Clear search & show all rarities</button>
      </div>`;
  }

  function buildCombinationCard(combination) {
    return `
      <article class="combo">
        <div class="combo-head">
          <div class="mini-tags">${buildTagLabels(combination.tags)}</div>
          <div class="minimum">
            Lowest match: ${combination.minimum}★
            <small>${combination.visible.length} of ${combination.matches.length} shown</small>
          </div>
        </div>
        ${buildOperatorGrid(combination.visible)}
      </article>`;
  }

  // 5. PAGE RENDERING
  // ------------------
  function renderSelection() {
    const tags = [...state.selectedTags];
    getElement("selection-count").textContent = tags.length;

    document.querySelectorAll("[data-tag]").forEach(button => {
      const isSelected = state.selectedTags.has(button.dataset.tag);
      button.classList.toggle("selected", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });

    getElement("chosen").innerHTML = tags.length
      ? tags.map(tag => `
          <button data-remove="${escapeHtml(tag)}" aria-label="Remove ${escapeHtml(tag)}">
            ${escapeHtml(tag)}<span>×</span>
          </button>`).join("")
      : '<span class="hint">Choose up to five tags to explore combinations.</span>';
  }

  function renderRoster() {
    const visible = filterVisibleOperators(operators);
    getElement("summary").innerHTML = `<b>${visible.length} of ${operators.length} operators</b> shown · tags above do not filter this tab`;

    const breakdown = [6, 5, 4, 3, 2, 1].map(stars => {
      const count = operators.filter(operator => operator.stars === stars).length;
      return `<span class="pool-chip">${stars}★ <b>${count}</b></span>`;
    }).join("");

    getElement("results").innerHTML = `<div class="pool-breakdown">${breakdown}</div>` + (
      visible.length
        ? `<div class="panel">${buildOperatorGrid(visible)}</div>`
        : buildEmptyResults("Try another operator name or restore the rarity filters.")
    );
  }

  function renderDirectMatches(tags, matches, visible) {
    const description = tags.length ? `matching all ${tags.length} selected tags` : "no tags selected";
    getElement("summary").innerHTML = `<b>${visible.length} of ${matches.length} tag matches</b> shown · ${description}`;

    if (tags.length > MAX_COMBINATION_SIZE) {
      getElement("view-note").innerHTML = '<div class="notice">These operators match all selected tags, but an actual recruitment uses at most three. Use Combinations to choose your tags.</div>';
    } else if (tags.length === 0) {
      getElement("view-note").innerHTML = '<div class="notice">Six-star operators require Top Operator and are excluded here until it is selected. Full roster includes all 158 operators.</div>';
    }

    getElement("results").innerHTML = visible.length
      ? `<div class="panel">${buildOperatorGrid(visible)}</div>`
      : buildEmptyResults("Try fewer tags, another operator name, or the Combinations tab.");
  }

  function renderCombinations(tags, combinations, visibleCombinations) {
    if (tags.length === 0) {
      getElement("summary").textContent = "Select up to five tags; each combination uses one to three.";
      getElement("results").innerHTML = '<div class="empty"><strong>Your next recruit starts with a tag.</strong>Select tags above, try a quick selection, or open Full roster to browse all 158 operators.</div>';
      return;
    }

    getElement("summary").innerHTML = `<b>${visibleCombinations.length} of ${combinations.length} combinations</b> shown · highest minimum rarity first`;

    if (tags.includes("Robot") || tags.includes("Starter")) {
      getElement("view-note").innerHTML = '<div class="notice">Robot and Starter matches are included for tag comparison. Recruitment duration affects whether low-rarity operators are available.</div>';
    }

    getElement("results").innerHTML = visibleCombinations.length
      ? visibleCombinations.map(buildCombinationCard).join("")
      : buildEmptyResults("Try fewer tags, another operator name, or restore the rarity filters.");
  }

  // Main render function: refresh the screen after a user action.
  function render() {
    const tags = [...state.selectedTags];
    const combinations = calculateCombinations(tags);
    const visibleCombinations = combinations
      .filter(combination => combination.visible.length > 0)
      .sort((first, second) =>
        second.minimum - first.minimum ||
        first.matches.length - second.matches.length ||
        second.tags.length - first.tags.length ||
        first.tags.join().localeCompare(second.tags.join())
      );
    const directMatches = findMatches(tags);
    const visibleMatches = filterVisibleOperators(directMatches);

    renderSelection();
    getElement("combo-count").textContent = visibleCombinations.length;
    getElement("match-count").textContent = visibleMatches.length;
    getElement("view-note").innerHTML = "";
    getElement("results").setAttribute("aria-labelledby", `${state.view}-tab`);

    for (const view of ["combos", "matches", "roster"]) {
      const active = state.view === view;
      getElement(`${view}-tab`).classList.toggle("active", active);
      getElement(`${view}-tab`).setAttribute("aria-selected", String(active));
    }

    if (state.view === "roster") {
      renderRoster();
    } else if (state.view === "matches") {
      renderDirectMatches(tags, directMatches, visibleMatches);
    } else {
      renderCombinations(tags, combinations, visibleCombinations);
    }
  }

  // 6. USER INTERACTIONS
  // ---------------------
  function toggleTag(tag) {
    getElement("status").textContent = "";

    if (state.selectedTags.has(tag)) {
      state.selectedTags.delete(tag);
    } else if (state.selectedTags.size < MAX_SELECTED_TAGS) {
      state.selectedTags.add(tag);
    } else {
      getElement("status").textContent = "Remove a tag before adding another. Maximum: five.";
      return;
    }

    render();
  }

  function clearDisplayFilters() {
    getElement("search").value = "";
    getElement("robots").checked = true;
    getElement("low").checked = true;
  }

  function showOperatorDetails(id) {
    const operator = operators[id];
    getElement("detail-class").textContent = `${operator.cls} / ${operator.pos}`;
    getElement("detail-name").textContent = operator.name;
    getElement("detail-stars").textContent = "★".repeat(operator.stars);
    getElement("detail-stars").style.color = RARITY_COLORS[operator.stars];
    getElement("detail-tags").innerHTML = buildTagLabels(operator.tags);

    let note = "Included in the EN recruitment snapshot. Actual outcomes depend on retained tags and recruitment duration.";
    if (operator.stars === 6) {
      note = "Requires Top Operator. Set recruitment to 9 hours for the 6★ guarantee.";
    } else if (operator.stars === 1) {
      note = "Robot recruitment depends on a short recruitment duration; tags can drop.";
    }
    getElement("detail-note").textContent = note;
    getElement("detail").showModal();
  }

  function bindEvents() {
    // Event delegation: one listener handles all generated tag buttons.
    getElement("tag-groups").addEventListener("click", event => {
      const button = event.target.closest("[data-tag]");
      if (button) toggleTag(button.dataset.tag);
    });

    getElement("chosen").addEventListener("click", event => {
      const button = event.target.closest("[data-remove]");
      if (button) toggleTag(button.dataset.remove);
    });

    getElement("reset").addEventListener("click", () => {
      state.selectedTags.clear();
      getElement("status").textContent = "";
      render();
    });

    document.querySelectorAll("[data-preset]").forEach(button => {
      button.addEventListener("click", () => {
        state.selectedTags = new Set(button.dataset.preset.split(","));
        state.view = "combos";
        getElement("status").textContent = "";
        clearDisplayFilters();
        render();
      });
    });

    getElement("search").addEventListener("input", render);
    for (const id of ["robots", "low", "sort"]) {
      getElement(id).addEventListener("change", render);
    }

    const views = ["combos", "matches", "roster"];
    views.forEach((view, index) => {
      const tab = getElement(`${view}-tab`);
      tab.addEventListener("click", () => {
        state.view = view;
        render();
      });
      // Standard tab keyboard shortcuts: arrows, Home, and End.
      tab.addEventListener("keydown", event => {
        const targets = {
          ArrowRight: (index + 1) % views.length,
          ArrowLeft: (index + views.length - 1) % views.length,
          Home: 0,
          End: views.length - 1
        };
        if (!(event.key in targets)) return;
        event.preventDefault();
        const nextView = views[targets[event.key]];
        getElement(`${nextView}-tab`).focus();
        state.view = nextView;
        render();
      });
    });

    getElement("results").addEventListener("click", event => {
      if (event.target.closest("[data-clear-filters]")) {
        clearDisplayFilters();
        render();
        return;
      }
      const button = event.target.closest("[data-op]");
      if (button) showOperatorDetails(Number(button.dataset.op));
    });

    const dialog = getElement("detail");
    getElement("close-detail").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => {
      if (event.target !== dialog) return;
      const rectangle = dialog.getBoundingClientRect();
      const outside = event.clientX < rectangle.left || event.clientX > rectangle.right ||
        event.clientY < rectangle.top || event.clientY > rectangle.bottom;
      if (outside) dialog.close();
    });
  }

  // 7. STARTUP
  // ------------
  function initialize() {
    getElement("total-stat").textContent = operators.length;
    getElement("top-stat").textContent = operators.filter(operator => operator.stars === 6).length;
    getElement("senior-stat").textContent = operators.filter(operator => operator.stars === 5).length;
    getElement("roster-count").textContent = operators.length;

    getElement("tag-groups").innerHTML = Object.entries(TAG_GROUPS).map(([group, tags]) => `
      <div class="tag-group">
        <div class="label">${group}</div>
        <div class="tags">
          ${tags.map(tag => `
            <button class="tag ${tag.includes("Operator") ? "special" : ""}"
              data-tag="${escapeHtml(tag)}" aria-pressed="false">${escapeHtml(tag)}</button>
          `).join("")}
        </div>
      </div>
    `).join("");

    bindEvents();
    render();
  }

  initialize();
})();
