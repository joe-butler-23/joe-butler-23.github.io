function createClusterPlot(data, elementId) {
  const grouped = groupBy(data, d => d.ObesityClass);

  const plotData = Object.entries(grouped).map(([label, points]) => ({
    x: points.map(p => p.PC1),
    y: points.map(p => p.PC2),
    text: points.map(p => `Cluster: ${p.Cluster}<br>Class: ${p.ObesityClass}`),
    mode: "markers",
    type: "scatter",
    name: label,
    marker: { size: 8, opacity: 0.7 },
    hoverinfo: "text"
  }));

  const layout = {
    title: "PCA-Based Clustering of Obesity Risk Profiles",
    xaxis: { title: "Principal Component 1" },
    yaxis: { title: "Principal Component 2" },
    margin: { l: 40, r: 40, b: 60, t: 60 },
    legend: { title: { text: "Obesity Class" } },
    hovermode: "closest",
    plot_bgcolor: "#fff",
    paper_bgcolor: "#fff"
  };

  Plotly.newPlot(elementId, plotData, layout, { responsive: true });
}

function groupBy(arr, fn) {
  return arr.reduce((acc, item) => {
    const key = fn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}
