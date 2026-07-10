let subjects = JSON.parse(localStorage.getItem("subjects")) || [
  { name: "Math", score: 99 },
  { name: "History", score: 93 },
  { name: "Science", score: 88 },
  { name: "Biology", score: 86 }
];

let chartInstance = null;
let currentChartType = "doughnut";

/* =========================
   SAVE
========================= */

function save() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
}

/* =========================
   COLOR SHADING
========================= */

function shadeColor(color, percent) {
  let R = parseInt(color.substring(1,3),16);
  let G = parseInt(color.substring(3,5),16);
  let B = parseInt(color.substring(5,7),16);

  R = Math.min(255, Math.max(0, parseInt(R * (100 + percent) / 100)));
  G = Math.min(255, Math.max(0, parseInt(G * (100 + percent) / 100)));
  B = Math.min(255, Math.max(0, parseInt(B * (100 + percent) / 100)));

  return "#" +
    R.toString(16).padStart(2, '0') +
    G.toString(16).padStart(2, '0') +
    B.toString(16).padStart(2, '0');
}

/* =========================
   RENDER CHART
========================= */

function renderChart() {

  const canvas = document.getElementById("gradesChart");
  const ctx = canvas.getContext("2d");

  if (chartInstance) chartInstance.destroy();

  const baseColors = [
    "#0a84ff",
    "#34c759",
    "#ff9500",
    "#af52de",
    "#ff3b30",
    "#5ac8fa",
    "#ffd60a"
  ];

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: subjects.map(s => s.name),
      datasets: [{
        data: subjects.map(s => s.score),
        borderColor: "rgba(255,255,255,0.4)",
        borderWidth: 2,
        hoverOffset: 8,
        backgroundColor: function(context) {

          const chart = context.chart;
          const meta = chart.getDatasetMeta(0);
          const arc = meta.data[context.dataIndex];
          if (!arc) return baseColors[context.dataIndex];

          const { x, y, innerRadius, outerRadius } = arc;
          const base = baseColors[context.dataIndex % baseColors.length];

          const gradient = ctx.createRadialGradient(
            x, y, innerRadius,
            x, y, outerRadius
          );

          // darker inner
          gradient.addColorStop(0, shadeColor(base, -30));

          // original mid
          gradient.addColorStop(0.6, base);

          // lighter outer
          gradient.addColorStop(1, shadeColor(base, 35));

          return gradient;
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      animation: {
        animateRotate: true,
        duration: 1200,
        easing: "easeOutExpo"
      },
      plugins: {
        legend: {
          display: true
        }
      }
    }
  });
}

/* =========================
   PAGE RENDER
========================= */

function render() {
  renderChart();
}

render();
