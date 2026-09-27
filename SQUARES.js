"use strict";

var canvas;
var gl;

var points = [];

var numTimesToSubdivide = 0;

var colorR = 1.0;
var colorG = 0.0;
var colorB = 0.0;
var colorLocation;

var bufferId;
var numPoints = 0;
var vPositionLocation;

function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 20000000, gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    vPositionLocation = vPosition;
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorLocation = gl.getUniformLocation( program, "uColor" );
    gl.uniform4f( colorLocation, colorR, colorG, colorB, 1.0 );

    document.getElementById("slider").onchange = function(event) {
        numTimesToSubdivide = parseInt(event.target.value);
        updateSquare();
    };

    document.getElementById("rSlider").oninput = function(event) {
        colorR = parseInt(event.target.value) / 255.0;
        gl.uniform4f( colorLocation, colorR, colorG, colorB, 1.0 );
    };
    document.getElementById("gSlider").oninput = function(event) {
        colorG = parseInt(event.target.value) / 255.0;
        gl.uniform4f( colorLocation, colorR, colorG, colorB, 1.0 );
    };
    document.getElementById("bSlider").oninput = function(event) {
        colorB = parseInt(event.target.value) / 255.0;
        gl.uniform4f( colorLocation, colorR, colorG, colorB, 1.0 );
    };

    updateSquare();
    render();
};

function updateSquare()
{
    points = [];

    var vertices = [
        vec2( -1, -1 ),
        vec2( -1,  1 ),
        vec2(  1,  1 ),
        vec2(  1, -1 )
    ];
    divideSquare( vertices[0], vertices[1], vertices[2], vertices[3],
                    numTimesToSubdivide);

    numPoints = points.length;

    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(points) );
    gl.vertexAttribPointer( vPositionLocation, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPositionLocation );

    points = [];
}

function square( a, b, c , d )
{
    points.push( a, b, c );
    points.push( a, c, d );
}

function divideSquare( a, b, c, d, count )
{
    if ( count === 0 ) {
        square( a, b, c, d );
    }
    else {

        //bisect the sides

        var ab1 = mix( a, b, 1.0/3.0 );
        var ab2 = mix( a, b, 2.0/3.0 );
        
        var bc1 = mix( b, c, 1.0/3.0 );
        var bc2 = mix( b, c, 2.0/3.0 );

        var dc1 = mix( d, c, 1.0/3.0 );
        var dc2 = mix( d, c, 2.0/3.0 );

        var ad1 = mix( a, d, 1.0/3.0 );
        var ad2 = mix( a, d, 2.0/3.0 );

        var p1 = mix( ab1, dc1, 1.0/3.0 );
        var p2 = mix( ab1, dc1, 2.0/3.0 );
        var p3 = mix( ab2, dc2, 1.0/3.0 );
        var p4 = mix( ab2, dc2, 2.0/3.0 );

        --count;

        // new squares

        divideSquare( a, ab1, p1, ad1, count );
        divideSquare( ab1, ab2, p3, p1, count );
        divideSquare( ab2, b, bc1, p3, count );
        divideSquare( ad1, p1, p2, ad2, count );
        divideSquare( p3, bc1, bc2, p4, count );
        divideSquare( ad2, p2, dc1, d, count );
        divideSquare( p2, p4, dc2, dc1, count );
        divideSquare( p4, bc2, c, dc2, count );
    }
}

window.onload = init;

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, numPoints );
    window.requestAnimationFrame(render);
}