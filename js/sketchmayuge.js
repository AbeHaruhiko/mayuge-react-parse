var drawNodes = []; 
var svgWrapper = null; 
var start = null; 
var outline = null; 
var offset = null; 
 
// $('#svgArea').svg({onLoad: function(svg) { 
//         svgWrapper = svg; 
//         var surface = svg.rect(0, 0, '100%', '100%', {id: 'surface', fill: 'white'}); 
//         $(surface).mousedown(startDrag).mousemove(dragging).mouseup(endDrag); 
//         resetSize(svg, '100%', '100%'); 
//     } 
// }); 
 
/* Remember where we started */ 
function startDrag(event) { 
    // offset = ($.browser.msie ? {left: 0, top: 0} : $('#svgArea').offset()); 
    offset = (!$.support.opacity ? {left: 0, top: 0} : $('#svgArea').offset()); 
    // if (!$.browser.msie) { 
    if ($.support.opacity) { 
        offset.left -= document.documentElement.scrollLeft || document.body.scrollLeft; 
        offset.top -= document.documentElement.scrollTop || document.body.scrollTop; 
    } 
    start = {X: event.clientX - offset.left, Y: event.clientY - offset.top}; 
    event.preventDefault(); 
} 
 
/* Provide feedback as we drag */ 
function dragging(event) { 
    if (!start) { 
        return; 
    } 
    if (!outline) { 
        outline = svgWrapper.rect(0, 0, 0, 0, 
            {fill: 'none', stroke: '#c0c0c0', strokeWidth: 1, strokeDashArray: '2,2'}); 
        $(outline).mouseup(endDrag); 
    } 
    svgWrapper.change(outline, {x: Math.min(event.clientX - offset.left, start.X), 
        y: Math.min(event.clientY - offset.top, start.Y), 
        width: Math.abs(event.clientX - offset.left - start.X), 
        height: Math.abs(event.clientY - offset.top - start.Y)});
    event.preventDefault(); 
} 
 
/* Draw where we finish */ 
function endDrag(event) { 
    if (!start) { 
        return; 
    } 
    $(outline).remove(); 
    outline = null; 
    var end = {X: event.clientX - offset.left, Y:event.clientY - offset.top};
    if (start.X != end.X) {
        // 開始／終了の予定X座標が同じ場合はなにもしない（幅がない）
        drawShape(start.X, start.Y, end.X, end.Y); 

        var $scope = angular.element('#content').scope();
        // $scope.export2canvas();
        if ($scope.conf.autoSave) {
          $scope.savePNG();
        }
    }
    start = null; 
    event.preventDefault(); 

} 
 
/* Draw the selected element on the canvas */ 
function drawShape(x1, y1, x2, y2) { 
    var left = Math.min(x1, x2); 
    var top = Math.min(y1, y2); 
    var right = Math.max(x1, x2); 
    var bottom = Math.max(y1, y2); 
    var settings = {fill: $('#fill').val(), stroke: $('#stroke').val(), 
        strokeWidth: $('#swidth').val()}; 
    var shape = $('#shape').val(); 
    var node = null; 


    var scale = ((right - left)/95);
    var $scope = angular.element('#content').scope();
    var mayugeColor = $('select[name="colorpicker4mayuge"]').val();
    var rinkakuColor = $('select[name="colorpicker4rinkaku"]').val();
    var rinkakuWidth = $('select[name="rinkakuWidth"]').val();
    if ($scope.conf.optionsLR == "r") {
        node = svgWrapper.group({class_: "draggable", transform: "translate(" + right + "," + bottom + ")"});
        svgWrapper.use(node, "#path-r-mayuge-" + $scope.conf.mayugeType, {fill: mayugeColor, transform: "scale(" + scale + ")", stroke: rinkakuColor, strokeWidth: rinkakuWidth});
    } else {
        node = svgWrapper.group({class_: "draggable", transform: "translate(" + (right - (right - left)) + "," + bottom + ")"});
        svgWrapper.use(node, "#path-r-mayuge-" + $scope.conf.mayugeType, {fill: mayugeColor, transform: "scale(-" + scale + "," + scale + ")", stroke: rinkakuColor, strokeWidth: rinkakuWidth});
    }


    var makeSVGElementDraggable = svgDrag.setupCanvasForDragging();
    makeSVGElementDraggable(node);
    // node.addEventListener("mouseup", $scope.export2canvas);
    node.addEventListener("dblclick", function() {$scope.removeMayuge($(node));});
    $scope.export2canvas();
    // if ($scope.conf.autoSave) {
    //   $scope.savePNG();
    // }


    drawNodes[drawNodes.length] = node; 
    // $(node).mousedown(startDrag).mousemove(dragging).mouseup(endDrag); 
    $('#svgArea').focus(); 
}; 
 
/* Remove the last drawn element */ 
$('#undo').click(function() { 
    if (!drawNodes.length) { 
        return; 
    } 
    svgWrapper.remove(drawNodes[drawNodes.length - 1]); 
    drawNodes.splice(drawNodes.length - 1, 1); 
}); 
 
/* Clear the canvas */ 
$('#clear2').click(function() { 
    while (drawNodes.length) { 
        $('#undo').trigger('click'); 
    } 
}); 
 
/* Convert to text */ 
$('#toSVG').click(function() { 
    alert(svgWrapper.toSVG()); 
});