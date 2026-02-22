(function() {
  "use strict";
  var rawData = [];
  var filteredData = [];
  var sortKey = "";
  var sortDir = 1;

  function getCell(row, key) {
    var v = row[key];
    return v === undefined || v === null ? "" : String(v);
  }

  function buildStats(data) {
    var total = data.length;
    var byCourse = {};
    var byDept = {};
    data.forEach(function(row) {
      var c = getCell(row, "course") || getCell(row, "Course") || "—";
      byCourse[c] = (byCourse[c] || 0) + 1;
      var d = getCell(row, "departme") || getCell(row, "department") || getCell(row, "Department") || "—";
      byDept[d] = (byDept[d] || 0) + 1;
    });
    var html = "<div class=\"stat-cards\">";
    html += "<div class=\"stat-card\"><span class=\"stat-num\">" + total + "</span><span class=\"stat-label\">Total Applications</span></div>";
    Object.keys(byCourse).slice(0, 4).forEach(function(c) {
      html += "<div class=\"stat-card\"><span class=\"stat-num\">" + byCourse[c] + "</span><span class=\"stat-label\">" + c + "</span></div>";
    });
    html += "</div>";
    var el = document.getElementById("adminStats");
    if (el) el.innerHTML = html;
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
      var dept = getCell(row, "departme") || getCell(row, "department") || getCell(row, "Department");
      if (q && name.indexOf(q) === -1 && email.indexOf(q) === -1 && phone.indexOf(q) === -1) return false;
      if (courseFilter && course !== courseFilter) return false;
      if (deptFilter && dept !== deptFilter) return false;
      return true;
    });
    if (sortKey) {
      filteredData.sort(function(a, b) {
        var va = getCell(a, sortKey);
        var vb = getCell(b, sortKey);
        var cmp = va.localeCompare(vb, undefined, { numeric: true });
        return sortDir * (cmp || 0);
      });
    }
    renderTable(filteredData);
    var countEl = document.getElementById("adminCount");
    if (countEl) countEl.textContent = "Showing " + filteredData.length + " of " + rawData.length + " applications.";
  }

  function renderTable(data) {
    var tableWrap = document.getElementById("tableWrap");
    var dataTable = document.getElementById("dataTable");
    if (!data || data.length === 0) {
      tableWrap.style.display = "none";
      document.getElementById("emptyState").style.display = "block";
      document.getElementById("emptyState").innerHTML = "<div class=\"admin-empty-icon\">📭</div><p>No applications match the current filters.</p>";
      return;
    }
    document.getElementById("emptyState").style.display = "none";
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
      th.addEventListener("click", function() {
        var key = th.getAttribute("data-key");
        if (sortKey === key) sortDir = -sortDir; else { sortKey = key; sortDir = 1; }
        applyFilters();
      });
    });
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  async function loadData() {
    var emptyState = document.getElementById("emptyState");
    emptyState.style.display = "block";
    emptyState.innerHTML = "<div class=\"admin-empty-icon\">⏳</div><p>Loading…</p>";
    document.getElementById("tableWrap").style.display = "none";
    try {
      var res = await fetch("/applications");
      var data = await res.json();
      rawData = Array.isArray(data) ? data : [];
      buildStats(rawData);
      sortKey = "timestamp";
      sortDir = -1;
      if (rawData.length && rawData[0]["timestamp"] === undefined) sortKey = "";
      document.getElementById("searchInput").value = "";
      document.getElementById("filterCourse").value = "";
      document.getElementById("filterDept").value = "";
      applyFilters();
    } catch (err) {
      emptyState.innerHTML = "<div class=\"admin-empty-icon\">⚠️</div><p>Could not load applications. Make sure the server is running.</p>";
    }
  }

  function exportCSV() {
    if (filteredData.length === 0) {
      alert("No data to export.");
      return;
    }
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
    a.download = "applications_" + new Date().toISOString().slice(0, 10) + ".csv";
    a.click();
  }

  window.loadData = loadData;
  window.exportCSV = exportCSV;

  document.addEventListener("DOMContentLoaded", function() {
    loadData();
    var searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.addEventListener("input", applyFilters);
    var fc = document.getElementById("filterCourse");
    if (fc) fc.addEventListener("change", applyFilters);
    var fd = document.getElementById("filterDept");
    if (fd) fd.addEventListener("change", applyFilters);
  });
})();
