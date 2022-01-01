function preview() {
    frame.src = URL.createObjectURL(document.getElementById('inputFile').files[0]);
}

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
$(document).ready(function (e) {
    $('#upload').on('click', function () {
        removeGraph();
        var form_data = new FormData();
        form_data.append('file', document.getElementById('inputFile').files[0])
        $('body').addClass('busy'); // add loading spinner 

        $.ajax({
            url: 'upload', // point to server-side URL
            dataType: 'json', // what to expect back f
            cache: false,
            contentType: false,
            processData: false,
            data: form_data,
            type: 'post',
            success: function (response) { // display success response
                $('body').removeClass('busy'); // remove loading spinner

                $('#is_dog_msg').html('');
                $('#msg').html('');
                // dog detected
                if (response.is_detected[0].is_dog) {
                    $('#is_dog_msg').html('<p class="h3">Dog Detected!</p>');
                    loadGraph(response);
                    // no dog detected
                } else {
                    // human detected
                    if (response.is_detected[1].is_human == true) {
                        $('#is_dog_msg').html('<p class="h3">Human Detected!</p>');
                        loadGraph(response);
                    // no human detected
                    } else if (response.is_detected[1].is_human == false){
                        $('#is_dog_msg').html('<p class="h3">Not a Dog or Human!</p>');
                    }  
                }
            },
            error: function (response) {
                $('#is_dog_msg').html(response.message); // display error response
            }
        });
    });
});

function removeGraph () {
    d3.select('#my_dataviz').selectAll('*').remove();
    d3.select('#is_dog_msg').html('');
}
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
function loadGraph (response) {
    // get column width

    const margin = {top: 10, right: 15, bottom: 60, left: 40};
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // append the svg object to the body of the page
    var svg = d3.select('#my_dataviz')
        .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

    var data = response.dog_breeds;

    // creat X and Y scales. Scaleband for bars.
    const y = d3.scaleLinear()
                .domain([0, 100])
                .rangeRound([height, 0]);
    
    const x = d3.scaleBand()
                .domain(data.map(d => d.breed))
                .range([0, width])
                .padding(0.1);

    // add X and Y axis to the SVG object
    const xAxis = svg.append('g')
                    .attr('class', 'x axis path text')
                    .attr('transform', 'translate(0,' + height + ')')
                    .call(d3.axisBottom(x))
                    .selectAll("text")
                    .call(wrap, x.bandwidth());
    
    const yAxis = svg.append('g')
                    .attr('class', 'y axis text')
                    .call(d3.axisLeft(y));
                    

    // create bars
    const bars = svg.selectAll('.bar')
                    .data(data)
                    .enter().append('rect')
                    .attr('class', 'bar')
                    .attr('y', d => y(0))
                    .attr('height', y(0) - height)
                    .attr('x', d => x(d.breed))
                    .attr('width', x.bandwidth())
                    .style('fill', '#FCAC0D')
                    .style('opacity', 0.9);
    
    // mouseover event listener
    bars.on('mouseover', function() {
        d3.select(this)
            .style('fill', '#000000')
            .style('opacity', 0.5);
    });

    // mouseout event listener
    bars.on('mouseout', function() {
        d3.select(this)
            .style('fill', '#FCAC0D')
            .style('opacity', 0.9);
    });

    // animate bars
    bars.transition().duration(800)
        .attr('height', d => height - y((d.prob * 100).toFixed(2)))
        .attr('y', d => y((d.prob * 100).toFixed(2)))
        .ease(d3.easeCubic);

    // Apend text to the bars
    const text = svg.selectAll('.prob')
                    .data(data)
                    .enter().append('text')
                    .attr('y', d => y((d.prob * 100).toFixed(2)))
                    .attr('x', d => x(d.breed))
                    .attr('dy', -6)
                    .attr('dx', (x.bandwidth() / 2) + 5)
                    .text(d => (d.prob * 100).toFixed(2) + '%')
                    .style('text-anchor', 'middle')
                    .style('fill', '#000000')
                    .style('font-weight', 'bold')
                    .style('font-family', 'Roboto Slab');
}

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
function wrap(text, width) {
    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em")
    while (word = words.pop()) {
        line.push(word)
        tspan.text(line.join(" "))
        if (tspan.node().getComputedTextLength() > width) {
            line.pop()
            tspan.text(line.join(" "))
            line = [word]
            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", `${++lineNumber * lineHeight + dy}em`).text(word)
            }
        }
    })
}

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
$('#inputfile').bind('change', function() {
    let fileSize = this.files[0].size/1024/1024;
    if (fileSize > 1) {
      $("#inputfile").val(null);
      alert('File is too large. Max file size is 1MB.');
      return
    }

    let ext = $('#inputfile').val().split('.').pop().toLowerCase();
    if($.inArray(ext, ['jpg','jpeg']) == -1) {
      $("#inputfile").val(null);
      alert('JPEG and JPG files only!');
    }
});

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});
