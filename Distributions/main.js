
    const w = 500, h = 300, marginH = 40, marginW = 50;

    const scaleX = d3.scaleLinear().range([marginW, w-marginW]);
    const scaleY = d3.scaleLinear().range([h-marginH, marginH]);
    const color  = d3.scaleOrdinal(d3.schemeDark2);

    const axisX = d3.axisBottom(scaleX)
            .tickSize(h - marginH*2 + 10)
            .tickPadding(2);
    const axisY = d3.axisLeft(scaleY)
            .tickSize(w - marginW*2 + 10)
            .tickPadding(2);
            

    const format = d3.format("$,.0f");

    const data = {
        continents: new Set()
    }

    d3.csv("HDI_2022.csv", function(row) {
        if(row.HDI_2022 >0 && row.GNI_per_capita >0) {
            data.continents.add(row.Continent);
            return {
                name: row.Country,
                continent: row.Continent,
                hdi: +row.HDI_2022,
                gni: +row.GNI_per_capita,
                life_ex: +row.Life_expectancy
            }
        }
    })
    .then(function(dataset) {
        data.continents = [...data.continents].sort((a,b,) => d3.ascending(a,b));
        data.countries = dataset;
        scaleY.domain(d3.extent(dataset, d => d.gni));
        scaleX.domain(d3.extent(dataset, d => d.life_ex));
        console.log(data)
        drawAxes();
        draw();
        drawTooltips();
    });

    function drawTooltips() {
        const tooltip = d3.select("svg")
                .append("g")
                .attr("class", "tooltip")
                .attr("opacity", 0);

        tooltip.append("rect")
                .attr("width", 80)
                .attr("height", 45)
                .attr("rx", 3).attr("ry", 3)
                .attr("x", -3).attr("y", -10);
        tooltip.append("text").attr("class", "name");
        tooltip.append("text").attr("class", "life exp").attr("y", 15);
        tooltip.append("text").attr("class", "gni").attr("y", 30);
    }

    function drawAxes() {
        const xG = d3.select("svg").append("g").attr("class", "x-axis")
                .attr("transform", `translate(${[0,marginH]})`)
                .call(axisX);

        const yG = d3.select("svg").append("g").attr("class", "y-axis")
                .attr("transform", `translate(${[w-marginW,0]})`)
                .call(axisY);

        d3.select("svg").append("text").attr("class","label")
                .text("Life expectancy")
                .attr("transform", `translate(${[w/2,h-3]})`)
        d3.select("svg").append("text").attr("class","label")
                .text("Annual GNI per capita 2022 (USD)")
                .attr("transform", `translate(${[3,h/2]}) rotate(90)`)

    }

    function draw() {
        d3.select("svg").selectAll("circle.dot")
                .data(data.countries)
                .join("circle").attr("class", "dot")
                .attr("r", 1.5)
                .attr("cx", d => scaleX(d.life_ex))
                .attr("cy", d => scaleY(d.gni))
                .style("fill", d => color(d.continent))
                .on("mouseenter", showDetails)
                .on("mouseleave", clearDetails);

        const legend = d3.select("svg")
                .append("g").attr("class", "legend")
                .attr("transform", `translate(${[85, 50]})`);

        legend.selectAll("g.item")
                .data(data.continents)
                .join("g").attr("class", "item")
                .on("mouseenter", showContinents)
                .on("mouseleave", clearContinents)
                .each(function(d, i) {
                    d3.select(this)
                            .append("rect")
                            .attr("y", i * 10)
                            .attr("height", 8)
                            .attr("width", 20)
                            .style("fill", color(d));

                    d3.select(this)
                            .append("text")
                            .attr("y", i * 10)
                            .attr("x", 24)
                            .text(d);
                });

     }

    function showContinents(d) {
        d3.selectAll(".item").classed("fade", k => k != d)
        d3.selectAll(".dot").classed("show", k => k.continent == d);
    }

    function clearContinents() {
        d3.selectAll(".item").classed("fade", false)
        d3.selectAll(".dot").classed("show", false);
    }

    function showDetails(d) {
        d3.select(this).attr("r", 4);
        d3.select(".tooltip").attr("opacity", 1)
                .attr("transform", `translate(${[10 + scaleX(d.life_ex), scaleY(d.gni) - 12]})`)

        const text1 = d3.select(".tooltip .name").text(d.name);
        const text2 = d3.select(".tooltip .gni").text("GNI: " + format(d.gni));
        const text3 = d3.select(".tooltip .life_ex").text("Life expectancy: " + d.life_ex);

        const boxWidth = 6 + d3.max([text1.node().getComputedTextLength(),
                                     text2.node().getComputedTextLength(),
                                     text3.node().getComputedTextLength()]);

        d3.select(".tooltip rect").attr("width", boxWidth);
    }

    function clearDetails(d) {
        d3.select(this).attr("r", 1.5);
        d3.select(".tooltip").attr("opacity", 0)
    }
