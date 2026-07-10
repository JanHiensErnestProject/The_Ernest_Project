let subjects = JSON.parse(localStorage.getItem("subjects")) || [
  { name: "Math", score: 99 },
  { name: "History", score: 93 },
  { name: "Science", score: 88 },
  { name: "Biology", score: 86 }
];

let editIndex = null;
let chartInstance = null;
let currentChartType = "doughnut";

function save() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
}

function calculateAverage() {
  const total = subjects.reduce((sum, s) => sum + s.score, 0);
  return subjects.length ? Math.round(total / subjects.length) : 0;
}

/* ===============================
   ADVANCED GRADIENT PLUGIN
================================ */

const advancedGradientPlugin = {
  id: "advancedGradientPlugin",
  beforeDraw(chart) {
    if (chart.config.type !== "doughnut") return;

    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    if (!meta?.data?.length) return;

    const baseColors = [
      "#0a84ff",
      "#34c759",
      "#ffcc00",
      "#af52de",
      "#ff3b30",
      "#5ac8fa"
    ];

    meta.data.forEach((arc, index) => {

      const { x, y, innerRadius, outerRadius, startAngle, endAngle } = arc;
      const base = baseColors[index % baseColors.length];

      const midAngle = (startAngle + endAngle) / 2;

      ctx.save();

      // Clip to this arc only
      ctx.beginPath();
      ctx.arc(x, y, outerRadius, startAngle, endAngle);
      ctx.arc(x, y, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.clip();

      /* -----------------------------
         1️⃣ RADIAL FADE (inner→outer)
      ----------------------------- */

      const radial = ctx.createRadialGradient(
        x, y, innerRadius,
        x, y, outerRadius
      );

      radial.addColorStop(0, shade(base, -25));
      radial.addColorStop(1, shade(base, 35));

      ctx.fillStyle = radial;
      ctx.fillRect(
        x - outerRadius,
        y - outerRadius,
        outerRadius * 2,
        outerRadius * 2
      );

      /* -----------------------------
         2️⃣ ANGULAR FADE (edge→middle)
      ----------------------------- */

      const conic = ctx.createConicGradient(startAngle, x, y);

      const sliceSize = endAngle - startAngle;

      conic.addColorStop(0, shade(base, -35));
      conic.addColorStop(0.5, base);
      conic.addColorStop(1, shade(base, -35));

      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = conic;
      ctx.fillRect(
        x - outerRadius,
        y - outerRadius,
        outerRadius * 2,
        outerRadius * 2
      );

      ctx.restore();
    });

    // Prevent default dataset drawing
    chart.data.datasets[0].backgroundColor = "transparent";
  }
};

Chart.register(advancedGradientPlugin);

/* ===============================
   COLOR SHADER
================================ */

function shade(color, percent) {
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

/* ===============================
   RENDER CHART
================================ */

function renderChart() {

  const ctx = document.getElementById("gradesChart").getContext("2d");

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: currentChartType,
    data: {
      labels: subjects.map(s => s.name),
      datasets: [{
        data: subjects.map(s => s.score),
        backgroundColor: "transparent",
        borderColor: "#ffffff",
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      rotation: -90,
      animation: {
        animateRotate: true,
        duration: 1400,
        easing: "easeOutExpo"
      },
      plugins: {
        legend: { display: true }
      }
    }
  });
}

/* ===============================
   PAGE RENDER
================================ */

function render() {
  renderChart();
}

render();
