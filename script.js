datasets: [{
  data: subjects.map(s => s.score),
  borderWidth: 3,
  borderColor: "#ffffff",
  backgroundColor: subjects.map((s, i) => {
    const canvas = document.getElementById("gradesChart");
    const ctx = canvas.getContext("2d");

    const darkColors = [
      "#0038a8", // Mathematics
      "#006c30", // English
      "#b34700", // Science
      "#4b0082", // Math
      "#8b0000", // Biology
      "#005f80"  // History
    ];

    const lightColors = [
      "#bcdfff",
      "#caffea",
      "#ffe5c7",
      "#ead6ff",
      "#ffd6d6",
      "#d6f7ff"
    ];

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

    gradient.addColorStop(0, darkColors[i % darkColors.length]);
    gradient.addColorStop(1, lightColors[i % lightColors.length]);

    return gradient;
  })
}]
