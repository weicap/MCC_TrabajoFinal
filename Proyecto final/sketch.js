var root;
var pointP = [17.9777, 129.0812];
var data_diabetes=[];
var arra=[];

function setup () {
    var width = 600;
    var height = 250;
    let kdTreeCanvas = createCanvas (width , height ) ;
    kdTreeCanvas.parent("KdTreeCanvas");

    background (0) ;

 ///////punto prueba   
	
    fill(254, 255, 51);
    circle(pointP[0],height-pointP[1],20);
    textSize(11);
    //text(pointP[0]+ ',' + pointP[1], 140+ 5, height - 90);
	
////////punto prueba end

    for (var x = 200; x < width; x += width / 10) {
        for (var y = 200; y < height; y += height / 5) {
            stroke (125 , 125 , 51) ;
            strokeWeight (0.1) ;
            line (x, 0, x, height );
            line (0 , y, width , y);
        }
    }

    var Diabetes_data = new DataClass();
    data_diabetes = Diabetes_data.r_Pca_diabetes      
    datos_Prueba(data_diabetes);    
}

function graficarclosetPoint(roots=root){
    console.log('pc');
    var nearestPoint=closest_point(roots,pointP).node.point;
    fill(222, 15, 15);
    circle(nearestPoint[0],height-nearestPoint[1],10);
    console.log("El nodo mas cercano es: "+nearestPoint);
}

function datos_Prueba(datas){
    // console.log('av4',datas);
    for(let i = 0; i < datas.length; ++i) {
        x = datas[i][0];
        y = datas[i][1];
        fill(57, 255, 20);
        circle(x, height - y, 4);
        textSize(8);
    }
return
}

function drawGraph(dotString) {
    //console.log(dotString);
    let graphOptions = "node [fontsize=10 width=0.6 shape=circle style=filled fixedsize=shape] \n"
    let diagramText = "digraph G { \n" + dotString + "}";
    let viz = new Viz();

    viz.renderSVGElement("digraph G { " + graphOptions + dotString + "}")
        .then(function (element) {
            //console.log('viz')
            var parentTree = document.getElementById('KdTreeSvg');
            parentTree.innerHTML = element.outerHTML;
            //console.log('viz')
            let dotText = document.getElementById('DotText');
            dotText.innerText = diagramText;
        })
        .catch(error => {
            //console.log(error);
        });
}


function graficarKNN(){
    console.log('f2');
    var cantidadK= document.getElementById("cantidadKnn").value;
    var knn=findKNN(root,pointP,parseInt(cantidadK)).nearestNodes;
    console.log(knn.length);
    for(let i=0;i<knn.length;i++){
        fill(222, 15, 15);
        circle(knn[i].point[0],height-knn[i].point[1],6); //200-y para q se dibuje apropiadamente 
        console.log(knn[i].point);
        console.log(knn[i].point[2]);
    }
}

function rangeCir(){
    var fe = [];
    var pon = pointP//[140, 90];
    //var h = [50, 100];
    var radio= document.getElementById("radio").value;
    
    range_query_circle(root,pon,radio,fe);
    fill(0,255,0,40);
    circle(pon[0],height-pon[1],radio*2)
}


function rangeRec(){
    var fe = [];
    var pon = pointP//[140, 90];
    var l1= document.getElementById("lado1").value;
    var l2= document.getElementById("lado2").value;
    var h = [l1, l2];
    var radio = 50;

    range_query_rect(root,pon,h,fe);
    fill(0,255,0,40);
    rect(pon[0]-h[0],height-pon[1]-h[1],h[0]*2,h[1]*2)

    for (let i = 0; i < fe.length; i++){
        fill(0, 255, 0);
        circle(fe[i][0], height - fe[i][1], 7); //200-y para q se dibuje apropiadamente
        textSize(10);
        text(fe[i][0] + ',' + fe[i][1], fe[i][0] + 5, height - fe[i][1]); //200-y para q se dibuje apropiadamente
    }
}


document.getElementsByClassName("holamundos")[0].addEventListener("click", e => {
	e.preventDefault();
	console.log('prueba click');
	document.getElementsByClassName("holamundostex")[0].value = "hola mundo";
	//document.getElementsByClassName("value")[0].value = "";
});

function knn_2(data_diabetes){
    // console.log('1uno');
    var data=[];

    for (let index = 0; index < data_diabetes.length; index++) {


      var newObject = {
        label: data_diabetes[index][2], //5
        x: data_diabetes[index][0],
        y: data_diabetes[index][1]
      }
      data.push(newObject);
      
    }
    var tree = new kdTree(data, distance, ["x", "y"]);
   
    var k = 20; // K neighbors ( Configuramos el número de vecinos más cercanos)
    
    var pointToPredict= [17.9777, 129.0812];
    // console.log(pointToPredict)
        // x: -0.02641380436087745,
        // y:  -0.019325203344133426};
    
    console.log(pointToPredict);
    
    var nearest = tree.nearest(pointToPredict, k);
    console.log(nearest);
    //drawGraph(generate_dot(nearest));
    //Acumulador de cada clase spam y no spam
    var Diabetico=0;
    var Nodiabetico=0;
    for (let index = 0; index < nearest.length; index++) {
      
      if(nearest[index][0].label==1)
      {
        Diabetico++;
      }
      else{
        Nodiabetico++;
      }
    }
    console.log("Vecinos Diabeticos: ",Diabetico);
    console.log("Vecinos No Diabeticos: ",Nodiabetico);
    console.log("------PRONOSTICO-----");
    
    if(Diabetico>Nodiabetico){
      Resul = "El paciente es Diabetico";
      console.log(Resul);
    }
    else{
      Resul = "El paciente es No Diabetico";
      console.log(Resul);
    }
    var inputNombre = document.getElementById("predicttxt");
    inputNombre.value = Resul;
};
function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return dx*dx + dy*dy;
}

var queue ;
function findKNN(node,point,KN){
    KN = KN || 1;
    queue = new BPQ(KN);
    scannedNodes = [];
    console.log(node);
    console.log('f1');
    return KNN(node,point);
}
function KNN(node,point){
    if (node === null) return;
    scannedNodes.push(node);
    // Agregar punto actual a BPQ
    queue.add(node, distanceSquared(node.point, point));
    // Busca de forma recursiva la mitad del árbol que contiene el punto de prueba
    if (point[node.axis] < node.point[node.axis]) {//comprobar la izquierda
        KNN(node.left,point);
        var otherNode = node.right;
    }else {// Comprobar la derecha
        KNN(node.right,point);
        var otherNode = node.left;
    }
    //Si la hiperesfera candidata cruza este plano de división, mira el otro lado del plano examinando el otro subárbol
    var delta = Math.abs(node.point[node.axis] - point[node.axis]);
    if (!queue.isFull() || delta < queue.maxPriority()) {
        KNN(otherNode,point);
    }
    return {
        nearestNodes: queue.values,
        scannedNodes: scannedNodes,
        maxDistance: queue.maxPriority()
    };
}

function BPQ(capacity) {
    this.capacity = capacity;
    this.elements = [];
}
BPQ.prototype.isFull = function() { 
    return this.elements.length === this.capacity; 
};
BPQ.prototype.isEmpty = function() { 
    return this.elements.length === 0; 
};
BPQ.prototype.maxPriority = function() {
    return this.elements[this.elements.length - 1].priority;
};
Object.defineProperty(BPQ.prototype, "values", {
    get: function() { return this.elements.map(function(d) { return d.value; }); }
});
BPQ.prototype.add = function(value, priority) {
    var q = this.elements,d = { value: value, priority: priority };
    if (this.isEmpty()) { 
        q.push(d); 
    } else {
        for (var i = 0; i < q.length; i++){
            if (priority < q[i].priority){
                q.splice(i, 0, d);
                break;
            }else if ( (i == q.length-1) && !this.isFull() ) {
                q.push(d);
            }
        }
    }
    this.elements = q.slice(0, this.capacity);
};
function distanceSquared ( point1 , point2 ){
	var distance = 0;
	for (var i = 0; i < k; i ++)
	distance += Math.pow (( point1 [i] - point2 [i]) , 2) ;
	return Math.sqrt ( distance );
};
