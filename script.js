document.addEventListener("DOMContentLoaded", function () {

  const subjects = [
    { name: "Mathematics", score: 85 },
    { name: "English", score: 78 },
    { name: "Science", score: 90 },
    { name: "Math", score: 70 },
    { name: "Biology", score: 86 },
    { name: "History", score: 88 }
  ];

  const canvas = document.getElementById("gradesChart");
  const ctx = canvas.getContext("2d");

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: subjects.map(s => s.name),
      datasets: [{
        data: subjects.map(s => s.score),
        borderWidth: 3,
        borderColor: "#ffffff",
        backgroundColor: subjects.map((s, i) => {

          const darkColors = [
            "#003caa",
            "#006b2e",
            "#b34700",
            "#5600aa",
            "#99001f",
            "#006a8f"
          ];

          const lightColors = [
            "#66b3ff",
            "#66ff99",
            "#ffc266",
            "#c266ff",
            "#ff6688",
            "#80e0ff"
          ];

          const gradient = ctx.createLinearGradient(
            canvas.width / 2,
            0,
            canvas.width / 2,
            canvas.height
          );

          gradient.addColorStop(0, darkColors[i]);
          gradient.addColorStop(0.5, lightColors[i]);
          gradient.addColorStop(1, lightColors[i]);

          return gradient;
        }]
      }]
    },
    options: {
      cutout: "60%",
      plugins: {
        legend: {
          position: "top"
        }
      }
    }
  });

});
