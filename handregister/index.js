/**
     * 创建场景对象Scene
     */
var scene = new THREE.Scene();

/**
 * 创建网格模型，并添加到场景
 */
var geometry = new THREE.BoxGeometry(5, 5, 5); //创建一个立方体几何对象Geometry
var material = new THREE.MeshLambertMaterial({
    //color: 0xff00ff,  //颜色 16进制
    color: 0xFF0000,
    opacity:0.5,      //透明度 0-1
    transparent:true, //开启透明度，默认关闭
    wireframe:false   //线框，默认关闭
}); //材质对象Material
var mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
scene.add(mesh); //网格模型添加到场景中

// var geometry2 = new THREE.BoxGeometry(25, 50, 50); //创建一个球体几何对象
// var material2 = new THREE.MeshLambertMaterial({
//     color: 0xffffff,
//     opacity:0.9,      //透明度 0-1
//     transparent:true  //开启透明度
// }); //材质对象Material2

// var mesh2 = new THREE.Mesh(geometry2,material2)
// mesh2.translateX(-100);
// mesh2.translateZ(-30);
// // mesh2.translateY(30); //球体网格模型沿Y轴正方向平移
// scene.add(mesh2)

/**
 * 辅助坐标系  参数1000表示坐标系大小
 */


/**
 * 光源设置
 */
    //点光源
var point = new THREE.PointLight(0xfffffff);
point.position.set(100, 100, 100); //点光源位置
scene.add(point); //点光源添加到场景中
//环境光
var ambient = new THREE.AmbientLight(0x444444);
scene.add(ambient);


/**
 * 相机设置
 */
var width = window.innerWidth; //窗口宽度
var height = window.innerHeight; //窗口高度
var k = width / height; //窗口宽高比
var s = 50; //三维场景显示范围控制系数，系数越大，显示的范围越大
//创建相机对象
// var camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
var camera = new THREE.PerspectiveCamera( 45, width / height, 1, 1000 );
camera.position.set(50, 50, 150); //设置相机位置
camera.lookAt(scene.position); //设置相机方向(指向的场景对象)position

/**
 * 创建渲染器对象
 */
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);//设置渲染区域尺寸
renderer.setClearColor(0xffffff, 1); //设置背景颜色
document.body.appendChild(renderer.domElement); //body元素中插入canvas对象

//系统坐标系绘制-----------------------------------------
var axesHelper = new THREE.AxesHelper(12); 
scene.add(axesHelper);           

//网格线绘制
var grid = new THREE.GridHelper(240, 240, 0xFF0000, 0x444444);            
grid.material.opacity = 0.4;
grid.material.transparent = true;
grid.rotation.x = Math.PI/2.0;
scene.add(grid);


function render() {
    console.log(camera.position)
    renderer.render(scene,camera);//执行渲染操作
}
render();
//坐标转换

const convertCoodsToThree = (mouseX, mouseY, mouseZ = 0) => {
    const x = (mouseX / window.innerWidth) * 2 - 1;
    const y = -(mouseY / window.innerHeight) * 2 + 1;
    var vec = new THREE.Vector3(); 
    var pos = new THREE.Vector3();
    vec.set(x, y, 0.5);
    vec.unproject(camera.current);
    vec.sub(camera.current.position).normalize();
    var distance = (mouseZ - camera.current.position.z) / vec.z;
    pos.copy(camera.current.position).add(vec.multiplyScalar(distance));
    return [pos.x, pos.y, pos.z];
  };



export function mvMode(x,y,z){
    console.log("x="+x+"y="+y+"z="+z)
    mesh.translateX(x*3)
    mesh.translateY(-y*3)
    mesh.translateZ(-z*3)

    //获取模型世界坐标

    //模型世界坐标转屏幕坐标

    //更改此屏幕坐标

    //屏幕坐标转世界坐标

    console.log(camera.position)
    render();
}
export function mvCam(x,y,z){
    console.log("x="+x+"y="+y+"z="+z)
    camera.position.x += x
    camera.position.y -= y
    // camera.position.z = z*10
    console.log(camera.position)
    render();
}
var size = 1
export function setSize(code){
    console.log("code:"+code)
    if(code == 6){
        size -= 0.1
        mesh.scale.set(size,size,size)
    }else if(code == 7){
        size += 0.1
        mesh.scale.set(size,size,size)
    }
    
    console.log(camera.position)
    render();
}
let angle = 0
const R = 100; //相机圆周运动的半径
export function rotateCam() {
    angle += 0.01;
    // 相机y坐标不变，在XOZ平面上做圆周运动
    camera.position.x = R * Math.cos(angle);
    camera.position.z = R * Math.sin(angle);
    //renderer.render(scene, camera);
    camera.lookAt(mesh.position.x,mesh.position.y,mesh.position.z)
    render()
    //requestAnimationFrame(render);
}

//mvMode(100,100,100);