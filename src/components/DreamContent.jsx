import React from 'react';
import * as d3 from 'd3';
import { BLACK, WHITE, RED, BLUE } from '../constants/colors';

const DreamContent = ({ data, onNodeInteraction }) => {
  const ref = React.useRef();

  React.useEffect(() => {
    // Clear previous content inside the ref
    while (ref.current && ref.current.firstChild) {
      ref.current.removeChild(ref.current.firstChild);
    }

    // Specify the chart's dimensions.
    const width = 928;
    const height = width;

    // Create the color scale (we'll use this for the stroke width instead of color).
    const strokeWidth = d3.scaleLinear()
      .domain([0, 5])
      .range([2, 6]);

    // Compute the layout.
    const pack = (data) => d3.pack()
      .size([width, height])
      .padding(3)(
        d3.hierarchy(data)
          .sum((d) => d.value)
          .sort((a, b) => b.value - a.value)
      );

    const root = pack(data);

    // Create the SVG container and append it to the ref.
    const svg = d3.select(ref.current)
      .append("svg")
      .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr(
        "style",
        `width: 100%; height: 100%; display: block; background: #000000; cursor: pointer;`
      );

    // Append the nodes.
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(root.descendants().slice(1))
      .join("circle")
      .attr("fill", BLACK)
      .attr("stroke", d => d.data.isFolder ? BLUE : RED)
      .attr("stroke-width", (d) => strokeWidth(d.depth))
      .attr("pointer-events", "all")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke", WHITE);
        console.log("DreamContent: Node mouseover", d.data.name);
        if (onNodeInteraction) {
          onNodeInteraction({
            type: "mouseover",
            node: d.data,
            event: event,
          });
        }
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("stroke", RED);
        console.log("DreamContent: Node mouseout", d.data.name);
        if (onNodeInteraction) {
          onNodeInteraction({
            type: "mouseout",
            node: d.data,
            event: event,
          });
        }
      })
      .on("click", (event, d) => {
        event.stopPropagation();
        event.preventDefault();
        console.log("DreamContent: Node clicked", d.data.name);
        if (onNodeInteraction) {
          console.log("DreamContent: Calling onNodeInteraction");
          onNodeInteraction({
            type: "click",
            node: d.data,
            event: event,
          });
        } else {
          console.log("DreamContent: onNodeInteraction is not defined");
        }
        if (focus !== d) zoom(event, d);
      });

    // Add a click event listener to the entire SVG
    svg.on("click", (event) => {
      event.stopPropagation();
      console.log("DreamContent: SVG background clicked");
    });

    // Add a click event listener to the entire SVG
    svg.on("click", (event) => {
      console.log("DreamContent: SVG clicked");
      event.stopPropagation();
    });

    // Append the text labels.
    const label = svg
      .append("g")
      .style("font", "10px sans-serif")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(root.descendants())
      .join("text")
      .style("fill", WHITE)
      .style("fill-opacity", (d) => (d.parent === root ? 1 : 0))
      .style("display", (d) => (d.parent === root ? "inline" : "none"))
      .text((d) => d.data.name);

    // Create the zoom behavior and set the initial focus.
    svg.on("click", (event) => zoom(event, root));
    let focus = root;
    let view;
    zoomTo([focus.x, focus.y, focus.r * 2]);

    // Zoom functions.
    function zoomTo(v) {
      const k = width / v[2];

      view = v;

      label.attr(
        "transform",
        (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
      );
      node.attr(
        "transform",
        (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
      );
      node.attr("r", (d) => d.r * k);
    }

    function zoom(event, d) {
      const focus0 = focus;

      focus = d;

      const transition = svg
        .transition()
        .duration(event.altKey ? 7500 : 750)
        .tween("zoom", () => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
          return (t) => zoomTo(i(t));
        });

      label
        .filter(function (d) {
          return d.parent === focus || this.style.display === "inline";
        })
        .transition(transition)
        .style("fill-opacity", (d) => (d.parent === focus ? 1 : 0))
        .on("start", function (d) {
          if (d.parent === focus) this.style.display = "inline";
        })
        .on("end", function (d) {
          if (d.parent !== focus) this.style.display = "none";
        });
    }
  }, [data, onNodeInteraction]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

export default DreamContent;
