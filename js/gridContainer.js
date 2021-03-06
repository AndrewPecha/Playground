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

function moveToGridContainer(e, sourceContainerId, targetContainerId) {
    var movingElement = $(e);
    var targetContainer = $('#' + targetContainerId);
    var targetGridCell = getNextAvailableCell(targetContainer);
    if(targetGridCell === undefined) {
        console.log('no cell available in grid container ' + targetContainerId);
        return;
    }
    var sourceContainer = $('#' + sourceContainerId);
    var sourceGridCell = sourceContainer.children().closestToOffset(movingElement);

    var newWidth = targetGridCell.width();
    var newHeight = targetGridCell.height();
    movingElement.width(newWidth);
    movingElement.height(newHeight);

    var targetPosition = targetGridCell.offset();

    movingElement.offset(targetPosition);
    movingElement.unbind('click').click(function() { moveToGridContainer(this, targetContainerId, targetContainer.data('gridSettings').destinationContainerId) });
    sourceGridCell.attr('data-content-available', false);
    targetGridCell.attr('data-content-available', true);
    movingElement.attr('data-current-container', targetContainerId);
}

function getNextAvailableCell(gridContainer) {
    var targetCells = gridContainer.children();
    for(var i = 0; i < targetCells.length; i++) {
        if(targetCells.eq(i).attr('data-content-available') === 'false'){
            return targetCells.eq(i);
        }            
    }
}

function repeatFr(iterations) {
    var returnString = "";

    for(var i = 0; i < iterations; i++){
        returnString += " 1fr";
    }

    return returnString;
}

function buildCells(selector, settings, sourceContainerId) {    
    var columnLengthsParsed = $('#' + sourceContainerId).css('grid-template-columns').split(" ");
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

            cellPositions[currentCellPosition] = { top: top + parentContainerPosition.top, left: left + parentContainerPosition.left };            
        }
    }

    var cellSizes = [];
    for(var i = 0; i < columnLengths.length; i++) {       
        for(var j = 0; j < columnHeights.length; j++) {
            var currentCellPosition = (i * columnHeights.length) + j;
            
            cellSizes[currentCellPosition] = { width: columnLengths[i], height: columnHeights[j] };            
        }
    }

    for(var i = 0; i < cellPositions.length; i++) {
        var currentPosition = cellPositions[i];
        var width = cellSizes[i].width;
        var height = cellSizes[i].height;
        //if data exists for this cellPosition
        if(settings.data[i] !== undefined) {
            var cellDiv = $("<div/>")
                .addClassIfExists(settings.cellClass)                    
                .offset(currentPosition)
                .width(width)
                .height(height)
                .attr('data-current-container', sourceContainerId)
                .click(function() { moveToGridContainer(this, sourceContainerId, settings.destinationContainerId); })
                .click(settings.data[i].function === undefined ? function() { return false; } : settings.data[i].function)
                .attr('data-cell-value', settings.data[i].value);

            if(settings.data[i].content !== undefined) {
                cellDiv
                    .append($("<div/>")
                        .addClass("GCCellContent")
                        .html(settings.data[i].content))
                    .append($("<div/>")
                        .addClass("GCCellText")
                        .html(settings.data[i].text));
            }
            else {
                cellDiv.html(settings.data[i].text);
            }

            selector
                .parent()
                .append(cellDiv);
        }               
    }
}

function rebuildCellPositions(elementId, data) {
    var selector = $('#' + elementId);
    var settings = selector.data('gridSettings');
    settings.data = data;
    selector.data('gridSettings', settings);
    $('#' + elementId).html('');

    buildCells(selector, settings, elementId);
}

function buildCellContainers(selector, settings) {
    var totalCells = settings.rows * settings.columns;
    for(var i = 0; i < totalCells; i++) {
        selector.append($("<div>").addClass('cellContainer').addClassIfExists(settings.cellContainerClass).attr('data-content-available', settings.data[i] !== undefined));
    }
}

(function ($) {

    $.fn.createGridContainer = function (options) {        

        var elementId = this.attr('id');
        if(this.data('gridSettings') !== undefined) {
            this.html('');
            if(this.data('gridSettings').gridContainerClass)
                this.removeClass(this.data('gridSettings').gridContainerClass);

            $('[data-current-container='+  elementId  +']').remove();
        }

        if (elementId === undefined)
            throw "selector must have an id to create grid container"

        var settings = $.extend({
            //possible options for data: text, content, value, function, 
            data: [],
            rows: options.data === undefined ? 2 : Math.ceil(options.data.length/(Math.floor(Math.sqrt(options.data.length)))),
            columns: options.data  === undefined ? 3 : Math.floor(Math.sqrt(options.data.length)),
            width: '500px',
            height: '500px',
            destinationContainerId: '',
            redraw: function(data) { rebuildCellPositions(elementId, data); },
            cellClass: undefined,
            cellContainerClass: undefined,
            gridContainerClass:  undefined
        }, options);

        this.data('gridSettings', settings);
        this.addClassIfExists(settings.gridContainerClass)
        $("<style type='text/css'> #" + elementId + 
            " { width: "+ settings.width +"; height: "+ settings.height +"; display: grid; justify-items: center; grid-template-rows: repeat("+ settings.rows +", 1fr); grid-template-columns: repeat("+ settings.columns +", 1fr);} " +
            ".cellContainer { width: 100%; height: 100%; }" +
            ".gridSvg { width: 99%; height: 100% }" +
            ".GCCellContent { width: 100%; height: 80%; position: relative; }" +
            ".GCCellText { width: 100%; height: 15%; position: relative; }</style>")
            .appendTo("head");
        
        buildCells(this, settings, elementId);          
        buildCellContainers(this, settings);        

        return this;        
    };

    $.fn.addClassIfExists = function(classToAdd) {
        if(classToAdd) {
            this.addClass(classToAdd)
        }

        return this;
    }

    //function modified from https://stackoverflow.com/a/2337775/8484685
    $.fn.closestToOffset = function(movingElement) {
        var el = null,
            elOffset,
            x = $(movingElement).offset().left,
            y = $(movingElement).offset().top,
            xMid = x + $(movingElement).width() / 2,
            yMid = y + $(movingElement).height() / 2,
            distance,
            dx,
            dy,
            minDistance;
        this.each(function() {
            var $t = $(this);
            elOffset = $t.offset();
            right = elOffset.left + $t.width();
            bottom = elOffset.top + $t.height();
    
            if (                
                //check if the offset middle is contained within one of the elements
                xMid >= elOffset.left &&
                xMid <= right &&
                yMid >= elOffset.top &&
                yMid <= bottom
            ) {
                el = $t;
                return false;
            }
    
            //if closest element is not found by midpoint calculation, find closest container by offsets
            //this may not be applicable to the grid container library since by design the movingContainer midpoint will always be withing a cellContainer..
            var offsets = [
                [elOffset.left, elOffset.top],
                [right, elOffset.top],
                [elOffset.left, bottom],
                [right, bottom],
            ];
            for (var off in offsets) {
                dx = offsets[off][0] - x;
                dy = offsets[off][1] - y;
                distance = Math.sqrt(dx * dx + dy * dy);
                if (minDistance === undefined || distance < minDistance) {
                    minDistance = distance;
                    el = $t;
                }
            }
        });
        return el;
    };

}(jQuery));