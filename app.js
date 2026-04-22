const riskOrder = ["Critical","High","Moderate","Low"];
const riskColors = {
  Critical: "#ef4444",
  High: "#f59e0b",
  Moderate: "#a78bfa",
  Low: "#22c55e"
};

function uniq(values) {
  return [...new Set(values.filter(v => v !== null && v !== undefined && String(v).trim() !== ""))].sort((a,b) => String(a).localeCompare(String(b)));
}

function fillSelect(id, values) {
  const el = document.getElementById(id);
  el.innerHTML = '<option value="">All</option>' + values.map(v => `<option value="${escapeHtml(String(v))}">${escapeHtml(String(v))}</option>`).join('');
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatInt(x) {
  return Number(x || 0).toLocaleString();
}

function formatMoney(x) {
  return "$" + Number(x || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
}

function formatPct(x) {
  return (100 * Number(x || 0)).toFixed(1) + "%";
}

function mean(arr, accessor) {
  if (!arr.length) return 0;
  let sum = 0, n = 0;
  for (const d of arr) {
    const v = accessor(d);
    if (v !== null && v !== undefined && !Number.isNaN(Number(v))) {
      sum += Number(v);
      n += 1;
    }
  }
  return n ? sum / n : 0;
}

const filterOptions = {
  Contract: uniq(rawData.map(d => d.Contract)),
  InternetService: uniq(rawData.map(d => d.InternetService)),
  PaymentMethod: uniq(rawData.map(d => d.PaymentMethod)),
  risk_band: riskOrder,
  tenure_group: uniq(rawData.map(d => d.tenure_group))
};

function applyFilters() {
  const contract = document.getElementById('fContract').value;
  const internet = document.getElementById('fInternet').value;
  const payment = document.getElementById('fPayment').value;
  const risk = document.getElementById('fRisk').value;
  const tenureGroup = document.getElementById('fTenureGroup').value;
  const search = document.getElementById('fSearch').value.trim().toLowerCase();

  return rawData.filter(d => {
    if (contract && d.Contract !== contract) return false;
    if (internet && d.InternetService !== internet) return false;
    if (payment && d.PaymentMethod !== payment) return false;
    if (risk && d.risk_band !== risk) return false;
    if (tenureGroup && d.tenure_group !== tenureGroup) return false;
    if (search) {
      const hay = [
        d.customerID, d.top_risk_driver_1, d.top_risk_driver_2, d.risk_driver_summary_short,
        d.Contract, d.InternetService, d.PaymentMethod
      ].map(v => String(v || "").toLowerCase()).join(" | ");
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}

function setKpis(data) {
  document.getElementById('kTotal').textContent = formatInt(data.length);
  document.getElementById('kAvgScore').textContent = data.length ? mean(data, d => d.risk_score_0_100).toFixed(1) : "0.0";
  document.getElementById('kAvgProb').textContent = data.length ? formatPct(mean(data, d => d.predicted_probability)) : "0.0%";
  document.getElementById('kHighCritical').textContent = formatInt(data.filter(d => ["High","Critical"].includes(d.risk_band)).length);
  document.getElementById('kActualChurn').textContent = formatInt(data.filter(d => String(d.actual_churn_label) === "Yes").length);
  document.getElementById('kModel').textContent = data.length ? (data[0].selected_model_name || "—") : "—";
  document.getElementById('sTotal').textContent = data.length ? "Filtered records" : "No matching records";
}

function aggregateCount(data, field, orderedLabels=null) {
  const map = new Map();
  for (const d of data) {
    const key = String(d[field] ?? "Missing");
    map.set(key, (map.get(key) || 0) + 1);
  }
  let arr = [...map.entries()].map(([label, value]) => ({label, value}));
  if (orderedLabels) {
    arr = orderedLabels.map(label => ({
      label,
      value: map.get(label) || 0
    }));
  } else {
    arr.sort((a,b) => b.value - a.value);
  }
  return arr;
}

function aggregateMean(data, field) {
  const groups = new Map();
  for (const d of data) {
    const key = String(d[field] ?? "Missing");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(Number(d.risk_score_0_100 || 0));
  }
  return [...groups.entries()]
    .map(([label, vals]) => ({
      label,
      value: vals.reduce((a,b) => a+b, 0) / vals.length
    }))
    .sort((a,b) => b.value - a.value);
}

function renderBars(containerId, items, colorFn, valueFormatter) {
  const el = document.getElementById(containerId);
  if (!items.length || items.every(x => !x.value)) {
    el.innerHTML = '<div class="empty">No data for this view.</div>';
    return;
  }
  const maxVal = Math.max(...items.map(x => x.value), 1);
  el.innerHTML = items.map(item => {
    const width = Math.max(2, (item.value / maxVal) * 100);
    const color = colorFn(item);
    return `
      <div class="bar-row">
        <div class="bar-label" title="${escapeHtml(item.label)}">${escapeHtml(item.label)}</div>
        <div class="bar-wrap">
          <div class="bar-fill" style="width:${width}%; background:${color};">
            ${item.value > 0 ? valueFormatter(item.value) : ""}
          </div>
        </div>
        <div class="bar-value">${valueFormatter(item.value)}</div>
      </div>
    `;
  }).join('');
}

function renderScatter(data) {
  const svg = document.getElementById('scatter');
  const width = 560, height = 320;
  const m = {top: 12, right: 12, bottom: 36, left: 42};
  const innerW = width - m.left - m.right;
  const innerH = height - m.top - m.bottom;

  if (!data.length) {
    svg.innerHTML = `<text x="${width/2}" y="${height/2}" text-anchor="middle">No data for this view.</text>`;
    return;
  }

  const xs = data.map(d => Number(d.tenure || 0));
  const ys = data.map(d => Number(d.MonthlyCharges || 0));
  const xmin = 0, xmax = Math.max(...xs, 1);
  const ymin = 0, ymax = Math.max(...ys, 1);

  const xScale = x => m.left + (x - xmin) / (xmax - xmin || 1) * innerW;
  const yScale = y => m.top + innerH - (y - ymin) / (ymax - ymin || 1) * innerH;

  const axisX = Array.from({length:6}, (_,i) => xmin + (xmax - xmin) * i / 5);
  const axisY = Array.from({length:5}, (_,i) => ymin + (ymax - ymin) * i / 4);

  svg.innerHTML = `
    <rect x="0" y="0" width="${width}" height="${height}" fill="transparent"></rect>
    <line x1="${m.left}" y1="${m.top + innerH}" x2="${m.left + innerW}" y2="${m.top + innerH}" stroke="#64748b"></line>
    <line x1="${m.left}" y1="${m.top}" x2="${m.left}" y2="${m.top + innerH}" stroke="#64748b"></line>
    ${axisX.map(v => `
      <line x1="${xScale(v)}" y1="${m.top + innerH}" x2="${xScale(v)}" y2="${m.top + innerH + 5}" stroke="#64748b"></line>
      <text x="${xScale(v)}" y="${height - 10}" text-anchor="middle">${Math.round(v)}</text>
    `).join('')}
    ${axisY.map(v => `
      <line x1="${m.left - 5}" y1="${yScale(v)}" x2="${m.left}" y2="${yScale(v)}" stroke="#64748b"></line>
      <text x="${m.left - 8}" y="${yScale(v) + 4}" text-anchor="end">${Math.round(v)}</text>
    `).join('')}
    <text x="${width/2}" y="${height - 2}" text-anchor="middle">Tenure (months)</text>
    <text x="12" y="${height/2}" transform="rotate(-90 12 ${height/2})" text-anchor="middle">Monthly Charges</text>
    ${data.slice(0, 1200).map(d => `
      <circle cx="${xScale(Number(d.tenure || 0))}" cy="${yScale(Number(d.MonthlyCharges || 0))}" r="3.2"
        fill="${riskColors[d.risk_band] || '#38bdf8'}" fill-opacity="0.75">
        <title>${escapeHtml(String(d.customerID))} | ${escapeHtml(String(d.risk_band))} | score ${escapeHtml(String(d.risk_score_0_100))}</title>
      </circle>
    `).join('')}
  `;
}

function riskChip(label) {
  const bg = riskColors[label] || '#475569';
  return `<span class="chip" style="background:${bg}22; color:${bg}; border:1px solid ${bg}55;">${escapeHtml(label)}</span>`;
}

function renderTable(data) {
  const rowsEl = document.getElementById('customerRows');
  const tableFoot = document.getElementById('tableFoot');
  if (!data.length) {
    rowsEl.innerHTML = '<tr><td colspan="12" class="empty">No matching records.</td></tr>';
    tableFoot.textContent = '';
    return;
  }

  const sorted = [...data].sort((a,b) => Number(b.risk_score_0_100 || 0) - Number(a.risk_score_0_100 || 0));
  const topRows = sorted.slice(0, 200);

  rowsEl.innerHTML = topRows.map(d => `
    <tr>
      <td>${escapeHtml(d.customerID)}</td>
      <td>${riskChip(d.risk_band)}</td>
      <td>${escapeHtml(String(d.risk_score_0_100 ?? ''))}</td>
      <td>${formatPct(Number(d.predicted_probability || 0))}</td>
      <td>${escapeHtml(String(d.Contract || ''))}</td>
      <td>${escapeHtml(String(d.tenure ?? ''))}</td>
      <td>${formatMoney(Number(d.MonthlyCharges || 0))}</td>
      <td>${escapeHtml(String(d.InternetService || ''))}</td>
      <td>${escapeHtml(String(d.PaymentMethod || ''))}</td>
      <td>${escapeHtml(String(d.top_risk_driver_1 || ''))}</td>
      <td>${escapeHtml(String(d.top_risk_driver_2 || ''))}</td>
      <td>${escapeHtml(String(d.risk_driver_summary_short || ''))}</td>
    </tr>
  `).join('');

  tableFoot.textContent = `Showing top ${formatInt(topRows.length)} of ${formatInt(sorted.length)} filtered customers, sorted by descending risk score.`;
}

function resetFilters() {
  document.getElementById('fContract').value = '';
  document.getElementById('fInternet').value = '';
  document.getElementById('fPayment').value = '';
  document.getElementById('fRisk').value = '';
  document.getElementById('fTenureGroup').value = '';
  document.getElementById('fSearch').value = '';
  renderAll();
}

function downloadFilteredCsv() {
  const data = applyFilters();
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const lines = [];
  lines.push(headers.join(','));
  for (const row of data) {
    const vals = headers.map(h => {
      let val = row[h] == null ? '' : String(row[h]);
      val = val.replaceAll('"', '""');
      if (val.includes(',') || val.includes('\n') || val.includes('\r')) {
        val = '"' + val + '"';
      }
      return val;
    });
    lines.push(vals.join(','));
  }
  const csv = lines.join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'telco_dashboard_filtered_view.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function renderAll() {
  const data = applyFilters();
  setKpis(data);
  renderBars('riskBars', aggregateCount(data, 'risk_band', riskOrder), item => riskColors[item.label] || '#38bdf8', v => formatInt(v));
  renderBars('contractBars', aggregateMean(data, 'Contract'), _ => '#38bdf8', v => Number(v).toFixed(1));
  renderBars('internetBars', aggregateMean(data, 'InternetService'), _ => '#22c55e', v => Number(v).toFixed(1));
  renderBars('paymentBars', aggregateMean(data, 'PaymentMethod'), _ => '#f59e0b', v => Number(v).toFixed(1));
  renderScatter(data);
  renderTable(data);
}

fillSelect('fContract', filterOptions.Contract);
fillSelect('fInternet', filterOptions.InternetService);
fillSelect('fPayment', filterOptions.PaymentMethod);
fillSelect('fRisk', filterOptions.risk_band);
fillSelect('fTenureGroup', filterOptions.tenure_group);
['fContract','fInternet','fPayment','fRisk','fTenureGroup','fSearch'].forEach(id => {
  document.getElementById(id).addEventListener('input', renderAll);
  document.getElementById(id).addEventListener('change', renderAll);
});
window.addEventListener('resize', renderAll);
renderAll();
