// correlation-heatmap.js

const correlationData = [
  { variable1: "Age", variable2: "TUE", correlation: -0.297 },
  { variable1: "CH2O", variable2: "FAF", correlation: 0.167 },
  { variable1: "Age", variable2: "FAF", correlation: -0.145 },
  { variable1: "FAF", variable2: "NCP", correlation: 0.130 },
  { variable1: "FAF", variable2: "TUE", correlation: 0.059 },
  { variable1: "CH2O", variable2: "NCP", correlation: 0.057 },
  { variable1: "Age", variable2: "CH2O", correlation: -0.045 },
  { variable1: "Age", variable2: "NCP", correlation: -0.044 },
  { variable1: "NCP", variable2: "TUE", correlation: 0.036 },
  { variable1: "CH2O", variable2: "TUE", correlation: 0.012 }
];

// Get unique variables
const variables = Array.from(
  new Set([
    ...correlationData.map(d => d.variable1),
    ...correlationData.map(d => d.variable2)
  ])
);

// Create a complete matrix
const matrix = [];
variables.forEach(v1 => {
  variables.forEach(v2 => {
    if (v1 === v2) {
      matrix.push({ variable1: v1, variable2: v2, correlation: 1.0 });
    } else {
      const found = correlationData.find(
        d => (d.variable1 === v1 && d.variable2 === v2) ||
             (d.variable1 === v2 && d.variable2 === v1)
      );
      matrix.push({
        variable1: v1,
        variable2: v2,
        correlation: found ? found.correlation : 0
      });
    }
  });
});

function createCorrelationHeatmap(elementId) {
  const margin = { top: 50, right: 80, bottom: 100, left: 100 },
        width = 600,
        height = 600;

  const svg = d3.select(`#${elementId}`)
    .append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(variables)
    .range([0, width])
    .padding(0.05);

  const y = d3.scaleBand()
    .domain(variables)
    .range([0, height])
    .padding(0.05);

  const colorScale = d3.scaleSequential()
    .interpolator(d3.interpolateRdBu)
    .domain([1, -1]);

  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");

  svg.append("g")
    .call(d3.axisLeft(y));

  const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("background", "rgba(255,255,255,0.9)")
    .style("padding", "8px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  svg.selectAll()
    .data(matrix)
    .enter()
    .append("rect")
    .attr("x", d => x(d.variable1))
    .attr("y", d => y(d.variable2))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .style("fill", d => colorScale(d.correlation))
    .on("mouseover", function(event, d) {
      d3.select(this).style("stroke", "#000").style("stroke-width", "1px");
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(
        `<strong>${d.variable1} vs ${d.variable2}</strong><br>Correlation: ${d.correlation.toFixed(3)}`
      )
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      d3.select(this).style("stroke", "none");
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // Add color legend
  const defs = svg.append("defs");
  const linearGradient = defs.append("linearGradient")
    .attr("id", "correlation-gradient")
    .attr("x1", "0%").attr("y1", "100%")
    .attr("x2", "0%").attr("y2", "0%");

  linearGradient.append("stop").attr("offset", "0%").attr("stop-color", colorScale(1));
  linearGradient.append("stop").attr("offset", "50%").attr("stop-color", colorScale(0));
  linearGradient.append("stop").attr("offset", "100%").attr("stop-color", colorScale(-1));

  svg.append("rect")
    .attr("x", width + 20)
    .attr("y", 0)
    .attr("width", 20)
    .attr("height", height)
    .style("fill", "url(#correlation-gradient)");

  const legendScale = d3.scaleLinear()
    .domain([-1, 1])
    .range([height, 0]);

  svg.append("g")
    .attr("transform", `translate(${width + 40}, 0)`)
    .call(d3.axisRight(legendScale).ticks(5).tickFormat(d3.format(".1f")));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .style("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "600")
    .text("Correlation Heatmap of Obesity Risk Factors");
}
