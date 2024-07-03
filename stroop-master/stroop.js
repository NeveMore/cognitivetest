var version = 'Version 0.3.3, 3/29/13'
var experiment;
var strings = ["红色", "绿色", "蓝色", "黄色", "xxxxx"];
var colors = [
    {name: "red", value: "#f00"}, 
    {name: "green", value: "#0f0"},
    {name: "blue", value: "#00f"}, 
    {name: "yellow", value: "#ff0"}
];
var stimuli = [];
var clicks = 0;

$('.version').text(version);

$.each(strings, function(idx, s){
    $.each(colors, function(idx, c){
        stimuli.push( { text : s, color: c } );
    });
});
    
function cards_equal( a, b ){
    return ( a.text === b.text && a.color.name === b.color.name );
}

function test_shuffle(){
    var reshuffles = 0,
        lastStimulus = stimuli[0];
    for( var c = 0; c < 1000; c++ ){
        var deck = shuffle(stimuli);
        
        // eliminate two identical stimuli in succession
        var clean = false;
        
        while( !clean ){
            clean = true;
            if( lastStimulus && cards_equal( lastStimulus, deck[0] ) ){
                clean = false;
                reshuffles += 1;
                deck = shuffle( stimuli );
            } else {
                for( var i = 1; i < deck.length; i++ ){
                    var a = deck[i-1],
                        b = deck[i];
        
                    if( cards_equal(a, b) ){
                        clean = false;
                        reshuffles += 1;
                        deck = shuffle( stimuli );
                        break;
                    }
                }
            }
        }
    }
    console.log( "test reshuffles", reshuffles );
}

//test_shuffle();

function shuffle(deck) {
    var shuffled = [];
    for (var c in deck) {
        shuffled.splice(Math.floor(Math.random() * (1 + shuffled.length)), 0, deck[c]);
    }
    return shuffled;
}

function five_random_digits(){
    return ('00000' + Math.floor( Math.random() * 99999 )).substr(-5);
}

function start(){
    var d = new Date();
    
    experiment = {};
    experiment.version = version;
    
    // grab settings from control-panel
    $('#control-panel input[name], #control-panel select').each( function(){
        experiment[ $(this).attr('name') ] = 
            $(this).attr('type') === 'number' 
            ? parseFloat($(this).val()) 
            : $(this).val();
    });
    
    // use the date to create a "unique" id and a timestamp
    experiment.id = d.valueOf() + "-" + five_random_digits();
    experiment.timestamp = d.toString();
    
    // array to hold results of test
    experiment.results = [];
    experiment.number_of_sets_conducted = 0;
    
    if( !experiment.subject_name ){
        alert('Please enter subject name.');
    } else if( !experiment.feedback ) {
        alert('Please select feedback condition.');
    } else {
        //console.log(experiment);
        $('#control-panel').fadeOut();
        $('#start').fadeIn();
    }
}

function run_sets(){
    $('#start').hide();
    $('#test').show();
    
    var deck = [], lastStimulus, iteration_data, iteration_start;
    
    function show_stimulus(){
        // abort!
        if( experiment.early_exit ){
            return;
        }
        
        // pull first card from deck
        if( deck.length === 0 ){
            if( experiment.number_of_sets_conducted < experiment.number_of_sets ){
                experiment.number_of_sets_conducted += 1;    
                //console.log("New Deck", experiment.number_of_sets_conducted );
                deck = shuffle(stimuli);
                
                // eliminate two identical stimuli in succession
                var clean = true,
                    reshuffles = 0;
                while( !clean ){
                    clean = true;
                    if( lastStimulus && cards_equal( lastStimulus, deck[0] ) ){
                        clean = false;
                        reshuffles += 1;
                        deck = shuffle( stimuli );
                    } else {
                        for( var i = 1; i < deck.length; i++ ){
                            var a = deck[i-1],
                                b = deck[i];
                    
                            if( cards_equal(a, b) ){
                                clean = false;
                                reshuffles += 1;
                                deck = shuffle( stimuli );
                                break;
                            }
                        }
                    }
                }
                save_data();
            } else {
                // we're done
                $('#test').hide();
                $('#end').fadeIn();
                save_data();
                return;
            }
        }
        
        $('#stimulus').hide();
        
        setTimeout( function(){
                lastStimulus = deck.shift();
                iteration_data = {
                    text: lastStimulus.text,
                    color: lastStimulus.color.name,
                    responses: []
                };
                zero_timer();
                $('#stimulus')
                    .text( lastStimulus.text )
                    .css('color', lastStimulus.color.value )
                    .show();
                $('#responses button').on('click', handle_response);
            },
            experiment.delay_before_stimulus * 1000.0
        ); 
        
        //console.log(lastStimulus.text, lastStimulus.color.name);
    }
    
    function show_feedback( msg, proceed ){
        if( proceed ){
            $('#stimulus').hide();
        } else {
            proceed = false;
        }
        $('#feedback')
            .text( msg )
            .show()
            .fadeOut( experiment.feedback_duration * 1000, proceed );
    }
    
    function save_and_proceed(){       
        $('#responses button').off('click');
        experiment.results.push( iteration_data );
        show_stimulus();
    }
    
    function handle_response(evt){
        var response = {};
        
        response.color = $(evt.target).text();
        response.correct = response.color === iteration_data.color;
        response.time = get_response_time();
        iteration_data.responses.push( response );
        
        switch( experiment.feedback ){
            case "Force Correct":
                if( response.correct ){
                    show_feedback("Correct", save_and_proceed );
                } else {
                    show_feedback("Incorrect");
                }
                break;
            case "Feedback":
                if( response.correct ){
                    show_feedback( "Correct", save_and_proceed );
                } else {
                    show_feedback( "Incorrect", save_and_proceed );
                }
                break;
            case "No Feedback":
                save_and_proceed();
                break;
            default:
                alert("Error: bad feedback condition!");
        }
        
        //console.log( response );
        
        evt.stopPropagation();
    }
    
    function zero_timer(){
        iteration_start = new Date();
    }
    
    function get_response_time(){
        var d = new Date();
        return d.valueOf() - iteration_start.valueOf();
    }
    
    show_stimulus();
}

function save_data(){
    localStorage[ experiment.id ] = JSON.stringify(experiment);
}

function show_data(){
    var data = '';

    Object.keys(localStorage).forEach((key) => {
      var value = localStorage.getItem(key);
      data = data + value + "\n";
    });

    var rowsData = process_data(data);

    // Convert the array to CSV string, handling commas in data
    var csvContent = rowsData.map((row) => 
      row.map((field) => 
        (typeof field === 'string' && field.includes(',')) ? `"${field}"` : field
      ).join(",")
    ).join("\n");
    
    // Create a Blob object with the CSV content and the appropriate MIME type
    var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    
    // Create a URL for the Blob object
    var url = URL.createObjectURL(blob);
    
    // Create an anchor element and simulate a click to start the download
    var downloadLink = $("<a></a>")
      .attr("href", url)
      .attr("download", "data.csv") // Specify the file name here
      .appendTo("body");
    
    downloadLink[0].click();
    
    // Remove the temporary link and revoke the object URL to free up memory
    downloadLink.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 100);
    
    $('#data').show();
    $('#data textarea').text( data ).select();
}

function process_data (rawdata){
    rawdata = '[' + rawdata.replace(/}\s*{/g, '},\n{') + ']';
    
    console.log( rawdata);
    rawdata = JSON.parse(rawdata);
    
    console.log(rawdata);
    
    var rows = [];
    rows.push([
        // experiment info
        'subject_name',
        'timestamp',
        'version',
        'delay_before_stimulus',
        'feedback',
        'feedback_duration',
        'id',
        'number_of_sets',
        'number_of_sets_conducted',
        
        // stimulus
        'stimulus_color',
        'stimulus_text',
        
        // responses
        'response',
        'correct',
        'time'
    ]);
    $.each(rawdata, function(i, subject){
        $.each(subject.results, function( j, result ){
            $.each(result.responses, function( seq, response ){
                rows.push( [
                    subject['subject_name'],
                    subject['timestamp'],
                    subject['version'],
                    subject['delay_before_stimulus'],
                    subject['feedback'],
                    subject['feedback_duration'],
                    subject['id'],
                    subject['number_of_sets'],
                    subject['number_of_sets_conducted'],
                    result['color'],
                    result['text'],
                    response['color'],
                    response['correct'],
                    response['time']
                ] );
            });
        });
    });
    
    return rows;
}

function end(){
    // clear name field
    if( experiment ){
        save_data();
        experiment.early_exit = true;
    }
    $('input[name=subject_name]').val('');
    $('#start,#test,#data').hide();
    $('#end').fadeOut();
    $('#control-panel').fadeIn();
}

// test if range slider supported, hide if not
function hide_sliders(){
    var test = document.createElement('input');
    try {
      test.type = 'range';
      if (test.type == 'range'){
        return;
      }
    } catch (e) {
    }
    $('input[type=range]').hide();
}

$(function(){
    hide_sliders();
    $('.number_of_sets_field').val( 2 );
    $('.number_of_sets_field').on('change', function(){
        $('.number_of_sets_field').val( $(this).val() );
    });
    
    $('#run_trial').on('click', start);
    
    $('#start button.start').on('click', run_sets);
    $('#show_data').on('click', show_data);
    $('.exit').hide().on('click', end);
    
    // blocking selection
    $('body')
        .css({'-moz-user-select': 'none', '-webkit-user-select': 'none' })
        .on('selectstart', false);
    // except for inputs
    $('input,textarea')
        .css({'-moz-user-select': '', '-webkit-user-select': '' })
        .on('selectstart', function(evt){ evt.stopPropagation(); });
    
    setInterval( function(){ if( clicks > 0 ){ clicks -= 1; } }, 1000 );
    $('body').on('click', function(){
        clicks += 1;
        //console.log(clicks);
        if( clicks > 2 ){
            clicks = 0;
            $('.exit').show();
            setTimeout( function(){ $('.exit').fadeOut() }, 5000 );
        }
    });
    // multi-touch pinch to exit
    document.body.addEventListener("gesturechange", function(evt){
        if( evt.scale < 0.5 ){
            $('.exit').show();
            setTimeout( function(){ $('.exit').fadeOut() }, 5000 );
        }
    }, false);
});
