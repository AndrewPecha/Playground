function repeatFr(iterations) {
    var returnString = "";

    for(var i = 0; i < iterations; i++){
        returnString += " 1fr";
    }

    return returnString;
}

(function ($) {

    $.fn.createGridContainer = function (options) {

        var elementId = this.attr('id');

        if (elementId === undefined)
            throw "selector must have an id to create grid container"

        var settings = $.extend({
            data: [],
            rows: 2,
            columns: 3,
            width: '500px',
            height: '500px',
            destinationContainer: ''
        }, options);

        this.data('gridSettings', settings);
        $("<style type='text/css'> #" + elementId + 
            " { width: "+ settings.width +"; height: "+ settings.width +"; border: 1px solid red; display: grid; justify-items: center; grid-template-rows: repeat("+ settings.rows +", 1fr); grid-template-columns: repeat("+ settings.columns +", 1fr);} " +
            ".gridSvg { width: 99%; height: 99%;} </style>")
            .appendTo("head");

        var totalCells = settings.rows * settings.columns;
        for(var i = 0; i < totalCells; i++) {
            if(settings.data[i] !== undefined)
                this.append("<div class='border'>"+ settings.data[i] +"</div>")

            else
                this.append("<div class='border'></div>")
        }

        return this;
        
    };            

    // var rows = Math.floor(Math.sqrt(settings.sections));
    // var columns = Math.ceil(Math.sqrt(settings.sections));

    // for (var i = 0; i < rows; i++) {
    //     for (let j = 0; j < columns; j++) {

    //     }
    // }

}(jQuery));