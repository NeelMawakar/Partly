(() => {
  const data = window.MOCK;
  // The mock data is set in the week of Oct 22, 2026.
  const TODAY = new Date("2026-10-22T09:00:00");

  const state = { tab: "listings", thread: null };
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const clamp = (n) => Math.max(0, Math.min(1, n));
  const byId = (id) => data.listings.find((l) => l.id === id);
  const money = (n) => `$${n.toLocaleString()}`;
  const fmtDate = (iso, opts = { month: "short", day: "numeric" }) => new Date(iso).toLocaleDateString(undefined, opts);
  const fmtTime = (iso) => new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const fmtStamp = (iso) => `${fmtDate(iso)}, ${fmtTime(iso)}`;
  const shortDest = () => data.intake.destination.split(",")[0];

  const STATUS = {
    none: "Not contacted", sent: "Message sent", replied: "Landlord replied",
    booked: "Viewing booked", noreply: "No reply yet",
  };
  const pill = (s) => `<span class="pill ${s}">${STATUS[s]}</span>`;

  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => (t.hidden = true), 3200);
  }

  // ---- Scoring ------------------------------------------------------------

  function score(l) {
    const { budget, maxCommute, moveIn } = data.intake;
    const w = data.weights;
    const lateDays = (new Date(l.available) - new Date(moveIn)) / 864e5;
    const parts = {
      price: clamp((budget * 1.15 - l.rent) / (budget * 0.6)),
      commute: clamp((maxCommute * 1.2 - l.commute) / (maxCommute * 1.2 - 5)),
      reviews: clamp((l.reviews - 2.5) / 2.5) * Math.min(1, 0.6 + l.reviewCount / 25),
      moveIn: lateDays <= 0 ? 1 : clamp(1 - lateDays / 30),
    };
    const total = Object.keys(parts).reduce((s, k) => s + parts[k] * w[k], 0);
    const weightSum = Object.values(w).reduce((a, b) => a + b, 0) || 1;
    return Math.round((total / weightSum) * 100);
  }

  function problems(l) {
    const out = [];
    if (l.rent > data.intake.budget) out.push(`${money(l.rent - data.intake.budget)} over budget`);
    if (l.commute > data.intake.maxCommute) out.push(`${l.commute - data.intake.maxCommute} min over your commute limit`);
    return out;
  }

  function ranked() {
    return data.listings
      .map((l) => ({ l, s: score(l), p: problems(l) }))
      .sort((a, b) => (a.p.length > 0) - (b.p.length > 0) || b.s - a.s);
  }

  const routeClass = (r) => (/green/i.test(r) ? "green" : /orange/i.test(r) ? "orange" : /bus/i.test(r) ? "bus" : "walk");

  // ---- Sidebar ------------------------------------------------------------

  function renderIntake() {
    const i = data.intake;
    $("i-budget").value = i.budget;
    $("i-dest").value = i.destination;
    $("i-move").value = i.moveIn;
    $("i-commute").value = i.maxCommute;
    $("i-commute-val").textContent = `${i.maxCommute} min`;
  }

  function renderWeights() {
    const labels = { price: "Price", commute: "Commute", reviews: "Reviews", moveIn: "Move-in" };
    $("weights").innerHTML = Object.entries(data.weights)
      .map(
        ([k, v]) => `<div class="weight-row">
          <label for="w-${k}">${labels[k]}</label>
          <input id="w-${k}" type="range" min="0" max="100" step="5" value="${v}" data-weight="${k}">
          <output for="w-${k}" id="wo-${k}">${v}</output></div>`
      )
      .join("");
  }

  // ---- Header -------------------------------------------------------------

  function renderHeader() {
    const r = ranked();
    const fits = r.filter((x) => !x.p.length).length;
    const i = data.intake;
    $("headline").textContent = `${fits} apartment${fits === 1 ? "" : "s"} fit your search`;
    $("subhead").textContent = `Under ${money(i.budget)} · within ${i.maxCommute} min of ${shortDest()} · move in ${fmtDate(i.moveIn + "T12:00", { month: "short", day: "numeric", year: "numeric" })}`;
    const count = (s) => data.listings.filter((l) => l.outreach === s).length;
    const messaged = data.listings.filter((l) => l.outreach !== "none").length;
    $("summary").innerHTML = `
      <span class="chip"><b>${messaged}</b> landlords messaged</span>
      <span class="chip"><b>${count("replied") + count("booked")}</b> replied</span>
      <span class="chip"><b>${data.viewings.length}</b> viewings</span>`;
    const tabCounts = { listings: data.listings.length, outreach: messaged, viewings: data.viewings.length };
    document.querySelectorAll(".tab").forEach((t) => {
      const label = { listings: "Listings", outreach: "Landlord messages", viewings: "Viewings" }[t.dataset.tab];
      t.innerHTML = `${label}<span class="count">${tabCounts[t.dataset.tab]}</span>`;
      t.setAttribute("aria-selected", t.dataset.tab === state.tab);
    });
    ["listings", "outreach", "viewings"].forEach((v) => ($(`view-${v}`).hidden = v !== state.tab));
  }

  // ---- Listings -----------------------------------------------------------

  function actionFor(l) {
    if (l.outreach === "none") return `<button class="btn small primary" data-act="message" data-id="${l.id}">Message landlord</button>`;
    if (l.outreach === "replied") return `<button class="btn small primary" data-act="book" data-id="${l.id}">Book viewing</button>`;
    if (l.outreach === "booked") return `<button class="btn small" data-act="show-viewing">See viewing</button>`;
    return `<button class="btn small" data-act="thread" data-id="${l.id}">Open messages</button>`;
  }

  function renderListings() {
    const rows = ranked();
    $("view-listings").innerHTML = `<div class="listings">${rows
      .map(({ l, s, p }) => `
      <article class="card ${p.length ? "out" : ""}">
        <div class="score" style="--pct:${s}" title="Match score ${s} of 100"><span>${s}</span></div>
        <div class="card-main">
          <div class="card-title"><h2>${esc(l.title)}</h2>${pill(l.outreach)}</div>
          <div class="addr">${esc(l.address)} · ${esc(l.area)}</div>
          <div class="facts">
            <span class="commute ${routeClass(l.route)}"><span class="bar"></span><b>${l.commute} min</b>&nbsp;${esc(l.route)}</span>
            <span><span class="stars">★ ${l.reviews.toFixed(1)}</span> <span class="muted">(${l.reviewCount} student reviews)</span></span>
            <span><b>${l.beds ? `${l.beds} bd` : "Studio"}</b> · ${l.baths} ba · <b>${l.sqft}</b> sq ft</span>
            <span>Available <b>${fmtDate(l.available + "T12:00")}</b></span>
          </div>
          <p class="quote">“${esc(l.reviewQuote)}”</p>
          <div class="tags">${l.amenities.map((a) => `<span class="tag">${esc(a)}</span>`).join("")}</div>
          ${p.map((x) => `<div class="flag">${esc(x)}</div>`).join("")}
        </div>
        <div class="card-side">
          <div class="price">${money(l.rent)}<small>/mo</small></div>
          <div class="source">via ${esc(l.source)}</div>
          ${actionFor(l)}
        </div>
      </article>`)
      .join("")}</div>`;
  }

  // ---- Outreach -----------------------------------------------------------

  function threads() {
    return data.listings.filter((l) => l.outreach !== "none");
  }

  function renderOutreach() {
    const list = threads();
    if (!list.length) {
      $("view-outreach").innerHTML = `<div class="empty">No landlords contacted yet. Use “Message landlord” on a listing to start.</div>`;
      return;
    }
    if (!state.thread || !list.some((l) => l.id === state.thread)) state.thread = list[0].id;
    const cur = byId(state.thread);
    const msgs = data.messages[cur.id] || [];
    const last = (id) => (data.messages[id] || []).slice(-1)[0];
    const foot = [];
    if (cur.outreach === "replied") foot.push(`<button class="btn primary" data-act="book" data-id="${cur.id}">Book viewing</button>`);
    if (cur.outreach === "sent" || cur.outreach === "noreply") foot.push(`<button class="btn" data-act="followup" data-id="${cur.id}">Send follow-up</button>`);
    $("view-outreach").innerHTML = `
      <div class="outreach">
        <div class="panel">${list
          .map((l) => `<button type="button" class="thread-item" data-act="thread" data-id="${l.id}" aria-current="${l.id === cur.id}">
            <span class="name">${esc(l.landlord)}</span>${pill(l.outreach)}
            <span class="sub muted">${esc(l.address)}${last(l.id) ? ` · ${fmtDate(last(l.id).at)}` : ""}</span></button>`)
          .join("")}</div>
        <section class="panel">
          <div class="thread-head">
            <div><h2>${esc(cur.landlord)}</h2><div class="muted">${esc(cur.address)} · ${money(cur.rent)}/mo</div></div>
            ${pill(cur.outreach)}
          </div>
          <div class="messages">${msgs
            .map((m) => `<div class="msg ${m.from}"><div class="msg-label">${m.from === "partly" ? "Partly, for you" : esc(cur.landlord)}</div>${esc(m.text)}<time>${fmtStamp(m.at)}</time></div>`)
            .join("") || `<div class="muted">No messages yet.</div>`}</div>
          ${foot.length ? `<div class="thread-foot">${foot.join("")}</div>` : ""}
        </section>
      </div>`;
  }

  // ---- Viewings -----------------------------------------------------------

  function renderViewings() {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(TODAY);
      d.setDate(d.getDate() + i);
      return d;
    });
    const sameDay = (a, b) => a.toDateString() === b.toDateString();
    const sorted = [...data.viewings].sort((a, b) => new Date(a.at) - new Date(b.at));
    $("view-viewings").innerHTML = `
      <div class="days">${days
        .map((d, i) => `<div class="day ${i === 0 ? "today" : ""}">
          <div class="day-head"><span>${i === 0 ? "Today" : d.toLocaleDateString(undefined, { weekday: "short" })}</span><span class="date">${d.getDate()}</span></div>
          ${sorted
            .filter((v) => sameDay(new Date(v.at), d))
            .map((v) => {
              const l = byId(v.listing);
              return `<div class="event ${v.tentative ? "tentative" : ""}"><b>${fmtTime(v.at)}</b>${esc(l.address.split(",")[0])}${v.tentative ? "<br><span class=\"muted\">Waiting to confirm</span>" : ""}</div>`;
            })
            .join("")}
        </div>`)
        .join("")}</div>
      <div class="panel agenda">${sorted.length
        ? sorted
            .map((v) => {
              const l = byId(v.listing);
              return `<div class="agenda-row">
                <time>${fmtDate(v.at, { weekday: "short", month: "short", day: "numeric" })}, ${fmtTime(v.at)}</time>
                <div><b>${esc(l.title)}</b><div class="muted">${esc(l.address)} · ${l.commute} min to ${esc(shortDest())} · ${money(l.rent)}/mo</div></div>
                ${v.tentative ? `<span class="pill replied">Waiting to confirm</span>` : `<span class="pill booked">Confirmed</span>`}
              </div>`;
            })
            .join("")
        : `<div class="empty">No viewings yet.</div>`}</div>`;
  }

  function render() {
    renderHeader();
    renderListings();
    renderOutreach();
    renderViewings();
  }

  // ---- Simulated agent actions (mock only) ----------------------------------

  const stamp = (offsetMin = 0) => new Date(Date.now() + offsetMin * 6e4).toISOString();

  function messageLandlord(l) {
    data.messages[l.id] = data.messages[l.id] || [];
    data.messages[l.id].push({
      from: "partly", at: stamp(),
      text: `Hi, I'm interested in ${l.address} for a ${fmtDate(data.intake.moveIn + "T12:00", { month: "long", day: "numeric" })} move-in. Is it still available, and could I schedule a viewing this week?`,
    });
    l.outreach = "sent";
    render();
    toast(`Messaged ${l.landlord}`);
    setTimeout(() => {
      data.messages[l.id].push({ from: "landlord", at: stamp(1), text: "Hi! Yes, it's available. I can show it Tuesday at 4pm or Wednesday at 6pm." });
      l.outreach = "replied";
      render();
      toast(`${l.landlord} replied`);
    }, 2500);
  }

  function bookViewing(l) {
    const slot = new Date(TODAY);
    slot.setDate(slot.getDate() + 5);
    slot.setHours(16, 0, 0, 0);
    data.viewings.push({ listing: l.id, at: slot.toISOString() });
    data.messages[l.id] = data.messages[l.id] || [];
    data.messages[l.id].push({ from: "partly", at: stamp(), text: `${fmtDate(slot.toISOString(), { weekday: "long" })} at 4pm is confirmed. See you then.` });
    l.outreach = "booked";
    render();
    toast(`Viewing booked for ${fmtDate(slot.toISOString(), { weekday: "short", month: "short", day: "numeric" })} at 4:00 PM`);
  }

  function followUp(l) {
    data.messages[l.id].push({ from: "partly", at: stamp(), text: `Following up on my note about ${l.address}. Is it still available?` });
    l.outreach = "sent";
    render();
    toast("Follow-up sent");
  }

  // ---- Events -------------------------------------------------------------

  document.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-tab]");
    if (tab) { state.tab = tab.dataset.tab; renderHeader(); return; }
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const l = btn.dataset.id && byId(btn.dataset.id);
    switch (btn.dataset.act) {
      case "message": messageLandlord(l); break;
      case "book": bookViewing(l); break;
      case "followup": followUp(l); break;
      case "thread": state.thread = l.id; state.tab = "outreach"; render(); break;
      case "show-viewing": state.tab = "viewings"; renderHeader(); break;
    }
  });

  $("i-commute").addEventListener("input", (e) => ($("i-commute-val").textContent = `${e.target.value} min`));

  $("intake").addEventListener("submit", (e) => {
    e.preventDefault();
    const budget = parseInt($("i-budget").value, 10);
    if (!budget || budget < 500) { toast("Enter a monthly budget of at least $500"); $("i-budget").focus(); return; }
    Object.assign(data.intake, {
      budget,
      destination: $("i-dest").value.trim() || data.intake.destination,
      moveIn: $("i-move").value || data.intake.moveIn,
      maxCommute: parseInt($("i-commute").value, 10),
    });
    state.tab = "listings";
    render();
    toast("Search updated");
  });

  $("weights").addEventListener("input", (e) => {
    const k = e.target.dataset.weight;
    if (!k) return;
    data.weights[k] = parseInt(e.target.value, 10);
    $(`wo-${k}`).textContent = e.target.value;
    renderListings();
  });

  renderIntake();
  renderWeights();
  render();
})();
