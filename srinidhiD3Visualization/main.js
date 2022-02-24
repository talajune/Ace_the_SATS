// Global function called when select element is changed
function onCategoryChanged() {
    var select = d3.select('#categorySelect').node();
    // Get current value of select element
    var category = select.options[select.selectedIndex].value;
    // Update chart with the selected category of letters
    updateChart(category);
}

// recall that when data is loaded into memory, numbers are loaded as strings
// this function helps convert numbers into string during data preprocessing
function dataPreprocessor(row) {
    return {
        State_code: row.STATEFIPS,
        County_code: +row.COUNTYFIPS,
        Year: +row.YEAR,
        Month: +row.MONTH,
        Measurement: +row.MEASUREMENT,
        Mean_measurement: +row.MEAN_MEASUREMENT,
        Std_dev_measurement: +row.STDDEV_MEASUREMENT,
        Measurement_dev_real: +row.MEASUREMENT_DEVIATION_REAL,
        Measurement_dev_std_dev: +row.MEASUREMENT_DEVIATION_STDDEV,
        Comparison_ind: +row.COMPARISON_INDEX
    };
}

var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 60, r: 40, b: 30, l: 500};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// Compute the spacing for bar bands based on all 538 occupations
var barBand = chartHeight / 112;
var barHeight = barBand * .7;

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

// A map with arrays for each category of letter sets
var statesMap = {
    '1' : '01',
    '2' : '02',
    '4' : '04',
    '5' : '05',
    '6' : '06',
    '8' : '08',
    '9' : '09',
    '10' : '10',
    '11' : '11',
    '12' : '12',
    '13' : '13',
    '15' : '15',
    '16' : '16',
    '17' : '17',
    '18' : '18',
    '19' : '19',
    '20' : '20',
    '21' : '21',
    '22' : '22',
    '23' : '23',
    '24' : '24',
    '25' : '25',
    '26' : '26',
    '27' : '27',
    '28' : '28',
    '29' : '29',
    '30' : '30',
    '31' : '31',
    '32' : '32',
    '33' : '33',
    '34' : '34',
    '35' : '35',
    '36' : '36',
    '37' : '37',
    '38' : '38',
    '39' : '39',
    '40' : '40',
    '41' : '41',
    '42' : '42',
    '44' : '44',
    '45' : '45',
    '46' : '46',
    '47' : '47',
    '48' : '48',
    '49' : '49',
    '50' : '50',
    '51' : '51',
    '53' : '53',
    '54' : '54',
    '55' : '55',
    '56' : '56'
};

d3.csv('temperature_data.csv', dataPreprocessor).then(function(dataset) {
    // Create global variables here and intialize the chart
    temperatures = dataset;
    // console.log(temperatures);

    var subgroups = [temperatures.columns[4], temperatures.columns[4] - temperatures.columns[7]];
    console.log(subgroups);

    var groups = d3.map(temperatures, function(d){return(d.County_code)}).keys()
    console.log(groups);

    xScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, function(d) { return d.Measurement; })])
    .range([0, chartWidth]);

    // **** Your JavaScript code goes here ****

    var xAxis = d3.axisTop(xScale).ticks(6).tickFormat(function(d) {
        return + (d);
    })

    var xAxisBottom = d3.axisBottom(xScale).ticks(6).tickFormat(function(d) {
        return + (d);
    })



    // axis
    svg.append('g')
    .attr("transform", "translate(500, 50)")
    .call(xAxis);

    svg.append('g')
    .attr("transform", "translate(500, 4170)")
    .call(xAxisBottom);

    svg.append('text')
    .attr('x', 500)
    .attr('y', 20)
    .attr('fill', 'white')
    .text('Weekly Wage ($1000)');

    var legend = d3.select("#my_dataviz")

// Handmade legend
    legend.append("text").attr('x', 190).attr('y', 100).text('Legend').attr('font-size', '20px').attr('font-weight', 'bold').attr('fill', 'white');
    legend.append("circle").attr("cx",170).attr("cy",130).attr("r", 6).style("fill", "#013F94")
    legend.append("circle").attr("cx",170).attr("cy",160).attr("r", 6).style("fill", "#C7E6F9")
    legend.append("text").attr("x", 190).attr("y", 130).text("Male Workers").style("font-size", "15px").attr("alignment-baseline","middle").attr('fill', 'white')
    legend.append("text").attr("x", 190).attr("y", 160).text("Female Workers").style("font-size", "15px").attr("alignment-baseline","middle").attr('fill', 'white')

    //hoverChart(incomes);


    // Update the chart for all letters to initialize
    updateChart('1');
});

function hoverChart(dataset) {
    // for each player..
    for (i = 0; i < dataset.length; i++) {
        var x = scaleYear(dataset[i]['year'])
        var y = scaleHomeruns(dataset[i]['homeruns'])

        // identify their position
        var position = 'translate(' + x + ', ' + y + ')'
        var group = d3.select('svg').append('g')

        // group.attr('transform', position)
        //     .attr('align-items', 'center')

        // group.append('circle')
        //     .attr('r', '2px')
        //     .style('fill', '#3ca0d9')

        // and put their name by it
        group.append('text')
            .text(dataset[i]['name'])
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .attr('fill', 'white');
    }
}


function updateChart(filterKey) {
    var filteredJobs = temperatures.filter(function(d){
        return statesMap[filterKey].includes(d.State_code);
    });
    // Create a filtered array of letters based on the filterKey

    // **** Draw and Update your chart here ****
    var bars = chartG.selectAll('.bar')
    .data(filteredJobs, function(d) {
        return d.County_code;
    })

    var barEnter = bars.enter()
        .append("g")
        .attr('class', 'bar');

        barEnter.merge(bars)
        .attr('transform', function(d, i) {
            return 'translate(' + [0, i * barBand + 4] + ')';
        })

        barEnter.append('rect')
        .attr('width', function(d) {
            return xScale(d.Measurement);
        })
        .attr('height', barHeight)
        .attr('fill', '#013F94');

        barEnter.append('rect')
        .attr('width', function(d) {
            return xScale(d.Measurement - d.Measurement_dev_real);
        })
        .attr('height', barHeight)
        .attr('fill', '#C7E6F9');

        barEnter.append('text')
        .attr('x', 10)
        .attr('dy', '0.93m')
        .html(function(d) {
            return ("21st century temperature: $" + d.Measurement + ", 20th century temperature: $" + d.Measurement - d.Measurement_dev_real);
        })
        .attr('class', 'hover-label')
        .attr('fill', '#ffffde');

        barEnter.append('text')
        .attr('x', -490)
        .attr('dy', '0.93m')
        .attr('fill', 'white')
        .attr('font-weight', '200')
        .text(function(d) {
            return d.County_code;
        })

    bars.exit().remove();
}

// Remember code outside of the data callback function will run before the data loads