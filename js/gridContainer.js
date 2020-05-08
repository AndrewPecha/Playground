function moveTo(e, target) {
    var targetElement = $('#' + target);
    var movingElement = $(e);        

    var newWidth = targetElement.width() * .5;
    var newHeight = targetElement.height() * .5;

    movingElement.width(newWidth);
    movingElement.height(newHeight);

    var targetPosition = targetElement.position();

    var targetElementMidpointX = targetElement.width() / 2;
    var movingElementMidpointX = newWidth / 2;
    targetPosition.left = targetElementMidpointX - movingElementMidpointX + targetPosition.left;

    var targetElementMidpointY = targetElement.height() / 2;
    var movingElementMidpointY = newHeight / 2;
    targetPosition.top = targetElementMidpointY - movingElementMidpointY + targetPosition.top;

    movingElement.offset(targetPosition);
}

function repeatFr(iterations) {
    var returnString = "";

    for(var i = 0; i < iterations; i++){
        returnString += " 1fr";
    }

    return returnString;
}

function buildCellPositions(selector, settings) {    
    var columnLengthsParsed = $('#gridContainer').css('grid-template-columns').split(" ");
    var columnLengths = [];
    
    for(var i = 0; i < columnLengthsParsed.length; i++) {
        columnLengths[i] = parseInt(columnLengthsParsed[i].replace("px", ""));
    }    

    var columnHeightsParsed = selector.css('grid-template-rows').split(" ");
    var columnHeights = [];
    
    for(var i = 0; i < columnHeightsParsed.length; i++) {
        columnHeights[i] = parseInt(columnHeightsParsed[i].replace("px", ""));
    }

    var cellPositions = [];
    var parentContainerPosition = selector.position();
    
    
    for(var i = 0; i < columnHeights.length; i++) {
        var top;
        if(i === 0)
            top = 0;
        
        else {
            top = 0;
            for(var j = 0; j < i; j++) {
                top += columnHeights[j];
            }
        }
        
        for(var j = 0; j < columnLengths.length; j++) {
            var currentCellPosition = (i * columnLengths.length) + j;
            var left;
            
            if (j === 0)
                left = 0;

            else {
                left = 0;
                for (var k = 0; k < j; k++) {
                    left += columnLengths[k];
                }
            }

            cellPositions[currentCellPosition] = { top: top + parentContainerPosition.top, left: left + parentContainerPosition.left};            
        }
    }

    var cellSizes = [];
    for(var i = 0; i < columnLengths.length; i++) {       
        for(var j = 0; j < columnHeights.length; j++) {
            var currentCellPosition = (i * columnHeights.length) + j;
            
            cellSizes[currentCellPosition] = { width: columnLengths[i], height: columnHeights[j]};            
        }
    }

    for(var i = 0; i < cellPositions.length; i++) {
        var currentPosition = cellPositions[i];
        var width = cellSizes[i].width;
        var height = cellSizes[i].height;
        if(settings.data[i] !== undefined){
            selector
                .parent()
                .append($("<div>")
                .attr('data-content-available', 'true')
                .addClass('absoluteBorder')
                .html(settings.data[i])
                .offset(currentPosition)
                .width(width)
                .height(height)
                .click(function() {moveTo(this, settings.destinationContainer)}));
        }

        else {
            selector
                .parent()
                .append($("<div>")
                .attr('data-content-available', 'false')
                .addClass('absoluteBorder')
                .html(settings.data[i])
                .offset(currentPosition)
                .width(width)
                .height(height)
                .click(function() {moveTo(this, settings.destinationContainer)}));
        }        
    }
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
            destinationContainer: '',
            absolutePositionedDivs: false
        }, options);

        this.data('gridSettings', settings);
        $("<style type='text/css'> #" + elementId + 
            " { width: "+ settings.width +"; height: "+ settings.width +"; border: 1px solid red; display: grid; justify-items: center; grid-template-rows: repeat("+ settings.rows +", 1fr); grid-template-columns: repeat("+ settings.columns +", 1fr);} " +
            ".gridSvg { width: 99%; height: 99%;} </style>")
            .appendTo("head");

        var totalCells = settings.rows * settings.columns;
        if (settings.absolutePositionedDivs) {
            buildCellPositions(this, settings)
        }
        else {
            for(var i = 0; i < totalCells; i++) {                
                if(settings.data[i] !== undefined){
                    this.append($("<div>").attr('data-content-available', 'true').addClass('border').click(function() {moveTo(this, settings.destinationContainer)}).html(settings.data[i]));
                }
                else {
                    this.append($("<div>").attr('data-content-available', 'false').addClass('border') .click(function() {moveTo(this, settings.destinationContainer)}));
                }
            }
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