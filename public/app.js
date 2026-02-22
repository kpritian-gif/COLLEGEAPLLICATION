(function() {
  "use strict";

  var VIEWS = ["home", "apply", "programs", "about", "contact", "gallery", "success", "admin"];
  var DEFAULT_VIEW = "home";

  var programsData = [
    { icon: "💻", title: "CSE – Computer Science & Engineering", desc: "B.Tech CSE. Programming, data structures, algorithms, software engineering.", dept: "CSE" },
    { icon: "🤖", title: "CSE (AIML)", desc: "B.Tech CSE with specialization in Artificial Intelligence & Machine Learning.", dept: "CSE" },
    { icon: "📡", title: "ECE – Electronics & Communication", desc: "B.Tech ECE. Circuits, signals, communication systems, embedded systems.", dept: "ECE" },
    { icon: "🏗️", title: "Civil Engineering", desc: "B.Tech Civil. Structures, construction, environmental engineering.", dept: "CIVIL" },
    { icon: "⚡", title: "EEE – Electrical & Electronics", desc: "B.Tech EEE. Power systems, machines, control systems.", dept: "EEE" },
    { icon: "🔧", title: "Mechanical Engineering", desc: "B.Tech Mechanical. Thermodynamics, design, manufacturing, automation.", dept: "Mechanical" },
    { icon: "📊", title: "CSE (Data Science)", desc: "B.Tech CSE with specialization in Data Science.", dept: "CSE" }
  ];

  var galleryImages = [
    { url: "https://kpritech.ac.in/wp-content/uploads/2024/12/College.jpg", alt: "KPRIT – Kommuri Pratap Reddy Institute of Technology" },
    { url: "https://kpritech.ac.in/wp-content/uploads/2025/05/kprit-college-nature-5-scaled.webp", alt: "KPRIT Ghanpur Campus" },
    { url: "https://kpritech.ac.in/wp-content/uploads/2025/05/kprit-college-nature-3-scaled.webp", alt: "KPRIT Green Campus" },
    { url: "https://kpritech.ac.in/wp-content/uploads/2025/05/kprit-college-nature-7-scaled.webp", alt: "KPRIT Campus" },
    { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", alt: "KPRIT Library" },
    { url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80", alt: "KPRIT Student Life" }
  ];

  function getRoute() {
    var hash = (window.location.hash || "#").slice(1).toLowerCase();
    if (hash === "") return DEFAULT_VIEW;
    return VIEWS.indexOf(hash) !== -1 ? hash : DEFAULT_VIEW;
  }

  function showView(name) {
    var i, viewEl, link;
    for (i = 0; i < VIEWS.length; i++) {
      viewEl = document.getElementById("view-" + VIEWS[i]);
      if (viewEl) viewEl.classList.toggle("active", VIEWS[i] === name);
    }
    document.querySelectorAll(".nav-link").forEach(function(el) {
      link = el.getAttribute("data-route");
      if (link === name) el.classList.add("nav-active"); else el.classList.remove("nav-active");
    });
    document.title = (name === "home" ? "KPRIT" : name.charAt(0).toUpperCase() + name.slice(1)) + " – KomMuri Pratap Reddy Institute of Technology";
    if (name === "admin") loadAdminOnce();
    if (name === "programs") renderPrograms();
    if (name === "gallery") renderGallery();
  }

  function renderPrograms() {
    var grid = document.getElementById("programsGrid");
    if (!grid || grid.children.length) return;
    programsData.forEach(function(p) {
      var card = document.createElement("article");
      card.className = "program-card";
      card.innerHTML = "<div class=\"program-icon\">" + p.icon + "</div><h2>" + p.title + "</h2><p>" + p.desc + "</p><a href=\"#apply\" class=\"program-link nav-link\" data-route=\"apply\">Apply for " + (p.dept || p.title.split("–")[0].trim()) + " →</a>";
      grid.appendChild(card);
    });
  }

  function renderGallery() {
    var grid = document.getElementById("galleryGrid");
    if (!grid || grid.children.length) return;
    galleryImages.forEach(function(img) {
      var div = document.createElement("div");
      div.className = "gallery-item";
      var alt = (img.alt || "Campus").replace(/"/g, "&quot;");
      div.innerHTML = "<img src=\"" + img.url + "\" alt=\"" + alt + "\" loading=\"lazy\" onerror=\"this.src='https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80'\">";
      grid.appendChild(div);
    });
  }

  var adminLoaded = false;
  var rawData = [];
  var filteredData = [];
  var sortKey = "";
  var sortDir = 1;

  function getCell(row, key) {
    var v = row[key];
    return v === undefined || v === null ? "" : String(v);
  }

  function loadAdminOnce() {
    if (adminLoaded) {
      applyFilters();
      return;
    }
    adminLoaded = true;
    loadData();
    var searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.addEventListener("input", applyFilters);
    var fc = document.getElementById("filterCourse");
    if (fc) fc.addEventListener("change", applyFilters);
    var fd = document.getElementById("filterDept");
    if (fd) fd.addEventListener("change", applyFilters);
    var btnRefresh = document.getElementById("btnRefresh");
    if (btnRefresh) btnRefresh.addEventListener("click", loadData);
    var btnExport = document.getElementById("btnExport");
    if (btnExport) btnExport.addEventListener("click", exportCSV);
  }

  function buildStats(data) {
    var total = data.length;
    var byCourse = {};
    var byDept = {};
    data.forEach(function(row) {
      var c = getCell(row, "course") || getCell(row, "Course") || "—";
      byCourse[c] = (byCourse[c] || 0) + 1;
      var d = getCell(row, "departme") || getCell(row, "department") || "—";
      byDept[d] = (byDept[d] || 0) + 1;
    });
    var html = "<div class=\"stat-cards\"><div class=\"stat-card\"><span class=\"stat-num\">" + total + "</span><span class=\"stat-label\">Total</span></div>";
    Object.keys(byCourse).slice(0, 5).forEach(function(c) {
      html += "<div class=\"stat-card\"><span class=\"stat-num\">" + byCourse[c] + "</span><span class=\"stat-label\">" + c + "</span></div>";
    });
    html += "</div>";
    var el = document.getElementById("adminStats");
    if (el) el.innerHTML = html;
    var fc = document.getElementById("filterCourse");
    var fd = document.getElementById("filterDept");
    if (fc && fc.options.length === 1) {
      Object.keys(byCourse).forEach(function(c) {
        var opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        fc.appendChild(opt);
      });
    }
    if (fd && fd.options.length === 1) {
      Object.keys(byDept).forEach(function(d) {
        var opt = document.createElement("option");
        opt.value = d;
        opt.textContent = d;
        fd.appendChild(opt);
      });
    }
  }

  function applyFilters() {
    var q = (document.getElementById("searchInput") && document.getElementById("searchInput").value) || "";
    var courseFilter = (document.getElementById("filterCourse") && document.getElementById("filterCourse").value) || "";
    var deptFilter = (document.getElementById("filterDept") && document.getElementById("filterDept").value) || "";
    q = q.trim().toLowerCase();
    filteredData = rawData.filter(function(row) {
      var name = getCell(row, "name").toLowerCase();
      var email = getCell(row, "email").toLowerCase();
      var phone = getCell(row, "phone") + getCell(row, "guardianP");
      var course = getCell(row, "course") || getCell(row, "Course");
      var dept = getCell(row, "departme") || getCell(row, "department");
      if (q && name.indexOf(q) === -1 && email.indexOf(q) === -1 && phone.indexOf(q) === -1) return false;
      if (courseFilter && course !== courseFilter) return false;
      if (deptFilter && dept !== deptFilter) return false;
      return true;
    });
    if (sortKey) {
      filteredData.sort(function(a, b) {
        var va = getCell(a, sortKey);
        var vb = getCell(b, sortKey);
        return sortDir * (va.localeCompare(vb, undefined, { numeric: true }) || 0);
      });
    }
    renderTable(filteredData);
    var countEl = document.getElementById("adminCount");
    if (countEl) countEl.textContent = "Showing " + filteredData.length + " of " + rawData.length + " applications.";
  }

  function renderTable(data) {
    var tableWrap = document.getElementById("tableWrap");
    var dataTable = document.getElementById("dataTable");
    var emptyState = document.getElementById("emptyState");
    if (!data || data.length === 0) {
      tableWrap.style.display = "none";
      emptyState.style.display = "block";
      emptyState.innerHTML = "<div class=\"admin-empty-icon\">📭</div><p>No applications match.</p>";
      return;
    }
    emptyState.style.display = "none";
    tableWrap.style.display = "block";
    var keys = [];
    var seen = {};
    data.forEach(function(row) {
      Object.keys(row).forEach(function(k) {
        if (!seen[k]) { seen[k] = true; keys.push(k); }
      });
    });
    keys.sort();
    var header = "<tr>";
    keys.forEach(function(k) {
      var dir = sortKey === k ? (sortDir === 1 ? " ↑" : " ↓") : "";
      header += "<th data-key=\"" + k + "\" class=\"sortable\">" + k + dir + "</th>";
    });
    header += "</tr>";
    var body = "";
    data.forEach(function(row) {
      body += "<tr>";
      keys.forEach(function(k) {
        body += "<td>" + escapeHtml(getCell(row, k)) + "</td>";
      });
      body += "</tr>";
    });
    dataTable.innerHTML = header + body;
    dataTable.querySelectorAll("th.sortable").forEach(function(th) {
      th.onclick = function() {
        var key = th.getAttribute("data-key");
        if (sortKey === key) sortDir = -sortDir; else { sortKey = key; sortDir = 1; }
        applyFilters();
      };
    });
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  async function loadData() {
    var emptyState = document.getElementById("emptyState");
    if (emptyState) {
      emptyState.style.display = "block";
      emptyState.innerHTML = "<div class=\"admin-empty-icon\">⏳</div><p>Loading…</p>";
    }
    document.getElementById("tableWrap").style.display = "none";
    try {
      var res = await fetch("/applications");
      var data = await res.json();
      rawData = Array.isArray(data) ? data : [];
      buildStats(rawData);
      sortKey = "timestamp";
      sortDir = -1;
      if (rawData.length && rawData[0].timestamp === undefined) sortKey = "";
      document.getElementById("searchInput").value = "";
      document.getElementById("filterCourse").value = "";
      document.getElementById("filterDept").value = "";
      applyFilters();
    } catch (err) {
      if (emptyState) emptyState.innerHTML = "<div class=\"admin-empty-icon\">⚠️</div><p>Server not reachable.</p>";
    }
  }

  function exportCSV() {
    if (filteredData.length === 0) { alert("No data to export."); return; }
    var keys = [];
    var seen = {};
    filteredData.forEach(function(row) {
      Object.keys(row).forEach(function(k) {
        if (!seen[k]) { seen[k] = true; keys.push(k); }
      });
    });
    keys.sort();
    var csv = keys.map(function(k) { return "\"" + String(k).replace(/\"/g, "\"\"") + "\""; }).join(",") + "\n";
    filteredData.forEach(function(r) {
      csv += keys.map(function(k) { return "\"" + String(getCell(r, k)).replace(/\"/g, "\"\"") + "\""; }).join(",") + "\n";
    });
    var a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "krit_applications_" + new Date().toISOString().slice(0, 10) + ".csv";
    a.click();
  }

  function onHashChange() {
    showView(getRoute());
  }

  document.addEventListener("DOMContentLoaded", function() {
    document.body.addEventListener("click", function(e) {
      var a = e.target.closest("a[href^=\"#\"]");
      if (a && a.getAttribute("href").length > 1) {
        e.preventDefault();
        window.location.hash = a.getAttribute("href").slice(1);
      }
      if (e.target.closest(".nav-link")) document.getElementById("mainNav").classList.remove("open");
    });
    var toggle = document.getElementById("navToggle");
    if (toggle) toggle.addEventListener("click", function() {
      document.getElementById("mainNav").classList.toggle("open");
    });
    window.addEventListener("hashchange", onHashChange);
    if (!window.location.hash) window.location.hash = "home";
    onHashChange();

    var scrollBtn = document.getElementById("scrollToTop");
    if (scrollBtn) {
      function toggleScrollBtn() {
        scrollBtn.classList.toggle("visible", window.pageYOffset > 400);
      }
      window.addEventListener("scroll", toggleScrollBtn, { passive: true });
      scrollBtn.addEventListener("click", function() {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    var themeToggle = document.getElementById("themeToggle");
    var THEME_KEY = "krit-theme";
    function getTheme() {
      try { return localStorage.getItem(THEME_KEY) || "dark"; } catch (e) { return "dark"; }
    }
    function setTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "dark");
      if (themeToggle) {
        themeToggle.textContent = theme === "light" ? "🌙" : "☀";
        themeToggle.setAttribute("title", theme === "light" ? "Switch to dark mode" : "Switch to light mode");
        themeToggle.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");
      }
      try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    }
    setTheme(getTheme());
    if (themeToggle) {
      themeToggle.addEventListener("click", function() {
        setTheme(getTheme() === "light" ? "dark" : "light");
      });
    }
  });

  var form = document.getElementById("admissionForm");
  if (form) {
    form.addEventListener("submit", async function(e) {
      e.preventDefault();
      var formData = Object.fromEntries(new FormData(this));
      try {
        var res = await fetch("/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        var result = await res.json();
        if (!res.ok) throw new Error(result.message || "Submit failed");
        this.reset();
        document.querySelectorAll(".valid, .invalid").forEach(function(el) { el.classList.remove("valid", "invalid"); });
        window.location.hash = "success";
      } catch (err) {
        alert("Error submitting. Please try again.");
      }
    });
  }

  setInterval(function() {
    ["datetime", "datetime-apply"].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.textContent = new Date().toLocaleString();
    });
  }, 1000);
})();
