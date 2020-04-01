const {mat4, vec3} = glMatrix;
function main() {

  // Inisiasi kanvas WebGL
  var leftCanvas = document.getElementById("leftCanvas");
  var leftGL = leftCanvas.getContext("webgl");

  var rightCanvas = document.getElementById("rightCanvas");
  var rightGL = rightCanvas.getContext("webgl");

  // Angle to move per second
  var LEFT_ANGLE_PER_FRAME = 0.5;
  var RIGHT_ANGLE_PER_FRAME_X = 0.25;
  var RIGHT_ANGLE_PER_FRAME_Y = 0.75;
  // Initialize rotation angle
  var leftAngle = 0.0;
  var rightAngleX = 0.0;
  var rightAngleY = 0.0;

  // Inisiasi verteks persegi
  var rectangleVertices = [
    -0.5,  0.5,
    -0.5, -0.5,
    0.5, -0.5,
    0.5,  0.5
  ];

  // Inisiasi verteks kubus
  var cubeVertices = [];
  var cubePoints = [
    [-0.5,  0.5,  0.5],   // A, 0
    [-0.5, -0.5,  0.5],   // B, 1
    [ 0.5, -0.5,  0.5],   // C, 2 
    [ 0.5,  0.5,  0.5],   // D, 3
    [-0.5,  0.5, -0.5],   // E, 4
    [-0.5, -0.5, -0.5],   // F, 5
    [ 0.5, -0.5, -0.5],   // G, 6
    [ 0.5,  0.5, -0.5]    // H, 7 
  ];

  var cubeColors = [
      [],
      [1.0, 0.0, 0.0],    // merah
      [0.0, 1.0, 0.0],    // hijau
      [0.0, 0.0, 1.0],    // biru
      [1.0, 1.0, 1.0],    // putih
      [1.0, 0.5, 0.0],    // oranye
      [1.0, 1.0, 0.0],    // kuning
      []
  ];

  function quad(a, b, c, d) {
    var indices = [a, b, c, c, d, a];
    for (var i=0; i<indices.length; i++) {
      for (var j=0; j<3; j++) {
          cubeVertices.push(cubePoints[indices[i]][j]);
      }
      for (var j=0; j<3; j++) {
          cubeVertices.push(cubeColors[a][j]);
      }
    }
  }

  quad(1, 2, 3, 0); // Kubus depan
  quad(2, 6, 7, 3); // Kubus kanan
  quad(3, 7, 4, 0); // Kubus atas
  quad(4, 5, 1, 0); // Kubus kiri
  quad(5, 4, 7, 6); // Kubus belakang
  quad(6, 2, 1, 5); // Kubus bawah

  // Inisiasi VBO (Vertex Buffer Object)
  var leftVertexBuffer = leftGL.createBuffer();
  leftGL.bindBuffer(leftGL.ARRAY_BUFFER, leftVertexBuffer);
  leftGL.bufferData(leftGL.ARRAY_BUFFER, new Float32Array(rectangleVertices), leftGL.STATIC_DRAW);
  leftGL.bindBuffer(leftGL.ARRAY_BUFFER, null);

  var rightVertexBuffer = rightGL.createBuffer();
  rightGL.bindBuffer(rightGL.ARRAY_BUFFER, rightVertexBuffer);
  rightGL.bufferData(rightGL.ARRAY_BUFFER, new Float32Array(cubeVertices), rightGL.STATIC_DRAW);
  rightGL.bindBuffer(rightGL.ARRAY_BUFFER, null);

  // Definisi Shaders
  var leftVertexShaderCode = `
  attribute vec2 aPosition;
  uniform mat4 uModelMatrix;

  void main(void) {
    gl_Position = uModelMatrix * vec4(aPosition, -0.5, 1.0);
  }
  `

  var leftFragmentShaderCode = `
    precision mediump float;
    void main() {
      gl_FragColor = vec4(0.3, 0.3, 0.3, 1.0);
    }
  `

  var rightVertexShaderCode = `
    attribute vec3 aPosition;
    attribute vec3 aColor;
    uniform mat4 uModelMatrix;
    varying vec3 vColor;

    void main(void) {
      vColor = aColor;
      gl_Position = uModelMatrix * vec4(aPosition.xy, aPosition.z, 1.0);
    }
  `
  
  var rightFragmentShaderCode = `
    precision mediump float;
    varying vec3 vColor;
    void main() {
      gl_FragColor = vec4(vColor, 1.0);
    }
  `

  // Proses kompilasi, penautan (linking), dan eksekusi Shaders
  var vertexShader = leftGL.createShader(leftGL.VERTEX_SHADER);
  leftGL.shaderSource(vertexShader, leftVertexShaderCode);
  leftGL.compileShader(vertexShader);
  var fragmentShader = leftGL.createShader(leftGL.FRAGMENT_SHADER);
  leftGL.shaderSource(fragmentShader, leftFragmentShaderCode);
  leftGL.compileShader(fragmentShader);
  var leftShaderProgram = leftGL.createProgram();
  leftGL.attachShader(leftShaderProgram, vertexShader);
  leftGL.attachShader(leftShaderProgram, fragmentShader);
  leftGL.linkProgram(leftShaderProgram);
  leftGL.useProgram(leftShaderProgram);

  var vertexShader = rightGL.createShader(rightGL.VERTEX_SHADER);
  rightGL.shaderSource(vertexShader, rightVertexShaderCode);
  rightGL.compileShader(vertexShader);
  var fragmentShader = rightGL.createShader(rightGL.FRAGMENT_SHADER);
  rightGL.shaderSource(fragmentShader, rightFragmentShaderCode);
  rightGL.compileShader(fragmentShader);
  var rightShaderProgram = rightGL.createProgram();
  rightGL.attachShader(rightShaderProgram, vertexShader);
  rightGL.attachShader(rightShaderProgram, fragmentShader);
  rightGL.linkProgram(rightShaderProgram);
  rightGL.useProgram(rightShaderProgram);

  // Pengikatan VBO dan pengarahan pointer atribut posisi dan warna
  leftGL.bindBuffer(leftGL.ARRAY_BUFFER, leftVertexBuffer);
  var leftPosition = leftGL.getAttribLocation(leftShaderProgram, "aPosition");
  leftGL.vertexAttribPointer(leftPosition, 2, leftGL.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
  leftGL.enableVertexAttribArray(leftPosition);

  rightGL.bindBuffer(rightGL.ARRAY_BUFFER, rightVertexBuffer);
  var rightPosition = rightGL.getAttribLocation(rightShaderProgram, "aPosition");
  rightGL.vertexAttribPointer(rightPosition, 3, rightGL.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
  rightGL.enableVertexAttribArray(rightPosition);
  var color = rightGL.getAttribLocation(rightShaderProgram, "aColor");
  rightGL.vertexAttribPointer(color, 3, rightGL.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
  rightGL.enableVertexAttribArray(color);
  
  
  // Additional code goes here

  function updateAngle2D(angle) {
    // % 360 to ensure the angle is < 360 degrees.
    return (angle + LEFT_ANGLE_PER_FRAME) % 360;
  }
  
  function updateAngle3DX(angleX) {
    angleX = (angleX - RIGHT_ANGLE_PER_FRAME_X) % 360;
    return angleX;
  }

  function updateAngle3DY(angleY) {
    angleY = (angleY - RIGHT_ANGLE_PER_FRAME_Y) % 360;
    return angleY;
  }

  // Persiapan tampilan layar dan mulai menggambar secara berulang (animasi)
  function render() {
    // Additional Code
    // Rotation 2d for leftGL
    leftAngle = updateAngle2D(leftAngle);
    let leftRadian = Math.PI * leftAngle / 180.0;
    var leftModelMatrix = mat4.fromRotation(mat4.create(), leftRadian, vec3.fromValues(0,0,1));
    var leftUModelMatrix = leftGL.getUniformLocation(leftShaderProgram, 'uModelMatrix');
    leftGL.uniformMatrix4fv(leftUModelMatrix, false, leftModelMatrix);

    rightAngleX = updateAngle3DX(rightAngleX);
    rightAngleY = updateAngle3DY(rightAngleY);
    let rightRadianX = Math.PI * rightAngleX / 180.0;
    let rightRadianY = Math.PI * rightAngleY / 180.0;

    var rightModelMatrix;
    rightModelMatrix = mat4.fromRotation(mat4.create(), rightRadianX, vec3.fromValues(1,0,0));
    rightModelMatrix = mat4.rotate(mat4.create(), rightModelMatrix, rightRadianY, vec3.fromValues(0,1,0));
    var rightUModelMatrix = rightGL.getUniformLocation(rightShaderProgram, 'uModelMatrix');
    rightGL.uniformMatrix4fv(rightUModelMatrix, false, rightModelMatrix);

    leftGL.clear(leftGL.COLOR_BUFFER_BIT);
    leftGL.drawArrays(leftGL.TRIANGLE_FAN, 0, 4);
    rightGL.clear(rightGL.COLOR_BUFFER_BIT | rightGL.DEPTH_BUFFER_BIT);
    rightGL.drawArrays(rightGL.TRIANGLES, 0, 36);
    requestAnimationFrame(render);
  }
  leftGL.clearColor(0.7, 0.7, 0.7, 1.0);
  leftGL.viewport(0, (leftGL.canvas.height - leftGL.canvas.width)/2, leftGL.canvas.width, leftGL.canvas.width);
  rightGL.clearColor(0.0, 0.0, 0.0, 1.0);
  rightGL.enable(rightGL.DEPTH_TEST);
  rightGL.viewport(0, (leftGL.canvas.height - leftGL.canvas.width)/2, rightGL.canvas.width, rightGL.canvas.width);
  render();
}

