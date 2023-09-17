import DeviceDetector from "https://cdn.skypack.dev/device-detector-js@2.2.10";

import { mvMode,setSize,mvCam,rotateCam } from "./index.js";


const mpHands = window;
const drawingUtils = window;
const controls = window;
const controls3d = window;
var timeMarked = new Date().getTime()
var gestureMarked = 0
var gestureMarked1 = 0

let oldLandMark = null;

    // Usage: testSupport({client?: string, os?: string}[])
    // Client and os are regular expressions.
    // See: https://cdn.jsdelivr.net/npm/device-detector-js@2.2.10/README.md for
    // legal values for client and os
testSupport([
    { client: 'Chrome' },
]);

function testSupport(supportedDevices) {
    const deviceDetector = new DeviceDetector();
    const detectedDevice = deviceDetector.parse(navigator.userAgent);
    let isSupported = false;
    for (const device of supportedDevices) {
        if (device.client !== undefined) {
            const re = new RegExp(`^${device.client}$`);
            if (!re.test(detectedDevice.client.name)) {
                continue;
            }
        }
        if (device.os !== undefined) {
            const re = new RegExp(`^${device.os}$`);
            if (!re.test(detectedDevice.os.name)) {
                continue;
            }
        }
        isSupported = true;
        break;
    }
    if (!isSupported) {
        alert(`This demo, running on ${detectedDevice.client.name}/${detectedDevice.os.name}, ` +
            `is not well supported at this time, continue at your own risk.`);
    }
}
// Our input frames will come from here.
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const controlsElement = document.getElementsByClassName('control-panel')[0];
const canvasCtx = canvasElement.getContext('2d');
const config = {
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${mpHands.VERSION}/${file}`;
    }
};
// We'll add this to our control panel later, but we'll save it here so we can
// call tick() each time the graph runs.
const fpsControl = new controls.FPS();
// Optimization: Turn off animated spinner after its hiding animation is done.
const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
    spinner.style.display = 'none';
};
const landmarkContainer = document.getElementsByClassName('landmark-grid-container')[0];
const grid = new controls3d.LandmarkGrid(landmarkContainer, {
    connectionColor: 0xCCCCCC,
    definedColors: [{ name: 'Left', value: 0xffa500 }, { name: 'Right', value: 0x00ffff }],
    range: 0.2,
    fitToGrid: false,
    labelSuffix: 'm',
    landmarkSize: 2,
    numCellsPerAxis: 4,
    showHidden: false,
    centered: false,
});
// 静态 手势
function isFistGesture(landmarks) {
    // 获取食指关键点信息
    const indexFigure1 = landmarks[8];
    const indexFigure2 = landmarks[7];
    const indexFigure3 = landmarks[6];
    const indexFigure4 = landmarks[5];

    //拇指
    const thumb1 = landmarks[4];
    const thumb2 = landmarks[3];
    const thumb3 = landmarks[2];
    const thumb4 = landmarks[1];


    //指尖
    const thumbTip = landmarks[4];
    const middleFingerTip = landmarks[12];
    const ringFingerTip = landmarks[16];
    const pinkyTip = landmarks[20];

    // 获取中指关键点信息
    const middleFinger1 = landmarks[12];
    const middleFinger2 = landmarks[11];
    const middleFinger3 = landmarks[10];
    const middleFinger4 = landmarks[9];

    //获取无名指关键点信息
    const ringFinger1 = landmarks[16];
    const ringFinger2 = landmarks[15];
    const ringFinger3 = landmarks[14];
    const ringFinger4 = landmarks[13];

    //获取小指关键点信息
    const pinky1 = landmarks[20];
    const pinky2 = landmarks[19];
    const pinky3 = landmarks[18];
    const pinky4 = landmarks[17];

    //手腕
    const figure0 = landmarks[0];

    // 判断手势二
    if (
        // //食指
        angle(middleFinger2,middleFinger3,middleFinger4)<(-0.8)
            &&
        //食指 第二 三指节为打直状态
        angle(indexFigure2,indexFigure3,indexFigure4)<(-0.8)
            &&
        //大拇指 第一 二指节弯曲
        (angle(thumb1,thumb2,thumb3)>(-0.9) || angle(thumb2,thumb3,thumb4)>(-0.9))
        //无名指 小指 第二三指节 弯曲
        &&
        //无名指
        angle(ringFinger2,ringFinger3,ringFinger4)>(-0.8)
        &&
        angle(pinky2,pinky3,pinky4)>(-0.8)


    
    ) {
        console.log("手势二识别成功")
        return 2
    }else if (
        //判断手势一

        //食指 第二 三指节为打直状态
        angle(indexFigure2,indexFigure3,indexFigure4)<(-0.8) &&

        //大拇指 第一 二指节弯曲
        (angle(thumb1,thumb2,thumb3)>(-0.9) || angle(thumb2,thumb3,thumb4)>(-0.9))
        &&
        angle(pinky2,pinky3,pinky4)>(-0.8)

        //无名指 小指 第二三指节 弯曲
        &&
        //无名指
        angle(ringFinger2,ringFinger3,ringFinger4)>(-0.5)
        &&
        angle(pinky2,pinky3,pinky4)>(-0.5) &&
        //中指弯曲
        angle(middleFinger2,middleFinger3,middleFinger4)>(-0.5)
        //拇指
 
    ) {
        console.log('手势一识别成功！');
        return 1;
    } else if (

        //食指 中指 无名指打直
        //食指 第二 三指节为打直状态
        angle(indexFigure2,indexFigure3,indexFigure4)<(-0.8) &&
        //中指 第二 三指节为打直状态
        angle(middleFinger2,middleFinger3,middleFinger4)<(-0.8) &&
        //无名指 第二 三指节为打直状态
        angle(ringFinger2,ringFinger3,ringFinger4)<(-0.8) &&

        //拇指 小指弯曲
        (angle(thumb1,thumb2,thumb3)>(-0.9) || angle(thumb2,thumb3,thumb4)>(-0.9))
        &&
        angle(pinky2,pinky3,pinky4)>(-0.8)

    ) {
        console.log("手势三识别成功")
        return 3
    } else if (
        // //手势四

        //食指 第二 三指节为打直状态
        angle(indexFigure2,indexFigure3,indexFigure4)<(-0.8) &&
        //中指 第二 三指节为打直状态
        angle(middleFinger2,middleFinger3,middleFinger4)<(-0.8) &&
        //无名指 第二 三指节为打直状态
        angle(ringFinger2,ringFinger3,ringFinger4)<(-0.8) &&
        //小指 打直
        angle(pinky2,pinky3,pinky4)<(-0.8)&&
        //拇指弯曲
        angle(thumb1,thumb2,thumb3)>(-0.9)

    ) {
        console.log("手势四判断成功")
        return 4
    }else if (

        //食指 第二 三指节为打直状态
        angle(indexFigure2,indexFigure3,indexFigure4)<(-0.8) &&
        //中指 第二 三指节为打直状态
        angle(middleFinger2,middleFinger3,middleFinger4)<(-0.8) &&
        //无名指 第二 三指节为打直状态
        angle(ringFinger2,ringFinger3,ringFinger4)<(-0.8) &&
        //小指 打直
        angle(pinky2,pinky3,pinky4)<(-0.8)&&
        //拇指直
        angle(thumb1,thumb2,thumb3)<(-0.8)

    ) {
        console.log("手势五判断成功")
        return 5
    }else if (

        //食指 第二 三指节为打直状态
        angle(indexFigure2,indexFigure3,indexFigure4)<(-0.8) &&
        //拇指直
        angle(thumb1,thumb2,thumb3)<(-0.8)
        &&
       //无名指
       angle(ringFinger2,ringFinger3,ringFinger4)>(-0.5)
       &&
       angle(pinky2,pinky3,pinky4)>(-0.5) &&
       //中指弯曲
       angle(middleFinger2,middleFinger3,middleFinger4)>(-0.5)
       &&
       angle(indexFigure1,figure0,thumb1)>0.8
       
        

    ) {
        console.log("手势六判断成功")
        return 6
    }else if (

        //食指 第二 三指节为打直状态
        angle(indexFigure2,indexFigure3,indexFigure4)<(-0.8) &&
        //拇指直
        angle(thumb1,thumb2,thumb3)<(-0.8)
        &&
       //无名指
       angle(ringFinger2,ringFinger3,ringFinger4)>(-0.5)
       &&
       angle(pinky2,pinky3,pinky4)>(-0.5) &&
       //中指弯曲
       angle(middleFinger2,middleFinger3,middleFinger4)>(-0.5)
       &&
       angle(indexFigure1,figure0,thumb1)<0.7
       
        

    ) {
        console.log("手势七判断成功")
        return 7
    }


    return false;
}

//x2为顶点
function  angle(p1,p2,p3){
    //顶角为a
    var a = dist3D(p1.x,p1.y,p1.z,p3.x,p3.y,p3.z);
    var b = dist3D(p1.x,p1.y,p2.z,p2.x,p2.y,p2.z);
    var c = dist3D(p3.x,p3.y,p3.z,p2.x,p2.y,p2.z);

    var cosA = (b*b + c*c - a*a)/(2*c*b)
    //console.log("cosA:"+cosA)
    return cosA;
}
function dist2D(x1,y1,x2,y2){
    var a = Math.sqrt( (x1-x2)*(x1-x2)+(y1-y2)*(y1-y2) );
    return a;
}
function dist3D(x1,y1,z1,x2,y2,z2){

    var a = Math.sqrt( (x1-x2)*(x1-x2)+(y1-y2)*(y1-y2)+(z1-z2)*(z1-z2) );
    return a;
}

function moveModel(landmark){
    if(oldLandMark == null){
        oldLandMark = landmark
    }else{
        mvMode(landmark.x - oldLandMark.x,landmark.y - oldLandMark.y,landmark.z - oldLandMark.z)
        
        // gestureMarked = 0
        // gestureMarked1 = 0
        // timeMarked = new Date().getTime()
        
    }

}

function moveCam(landmark){
    if(oldLandMark == null){
        oldLandMark = landmark
    }else{
        mvCam(landmark.x - oldLandMark.x,landmark.y - oldLandMark.y,landmark.z - oldLandMark.z)
        // gestureMarked = 0
        // gestureMarked1 = 0
        // timeMarked = new Date().getTime()
        
    }

}


function yourFunction(num) {
    // 在识别成功时调用的函数逻辑
    // 在这里可以执行你想要的操作
    
    timeMarked = new Date().getTime()
    console.log('指令成功！');
}


function onResults(results) {
    // Hide the spinner.
    document.body.classList.add('loaded');
    // Update the frame rate.
    fpsControl.tick();
    // Draw the overlays.
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    
    if (results.multiHandLandmarks && results.multiHandedness) {
        for (let index = 0; index < results.multiHandLandmarks.length; index++) {
            const classification = results.multiHandedness[index];
            const isRightHand = classification.label === 'Right';
            const landmarks = results.multiHandLandmarks[index];
            drawingUtils.drawConnectors(canvasCtx, landmarks, mpHands.HAND_CONNECTIONS, { color: isRightHand ? '#00FF00' : '#FF0000' });
            drawingUtils.drawLandmarks(canvasCtx, landmarks, {
                color: isRightHand ? '#00FF00' : '#FF0000',
                fillColor: isRightHand ? '#FF0000' : '#00FF00',
                radius: (data) => {
                    return drawingUtils.lerp(data.from.z, -0.15, .1, 10, 1);
                }
            });
            //打印坐标
            //console.log(index, landmarks);
            let t = new Date().getTime()
            let gesture = isFistGesture(landmarks)
            if (gesture) {
                // 调用你的函数
                let timeMark = t
              
                if (timeMarked <= timeMark - 1000) {
                    //单击事件需要刷新时间与手势状态，以接收下一个手势
                    console.log("gesture:"+gesture)
                    console.log("gestureMarked:"+gestureMarked)

                    if(gesture == gestureMarked){
                        let element = document.getElementsByClassName('notion')[0]
                            element.style.display = "block"
                        if(gesture == 5){
                        
                            console.log(timeMark - timeMarked,"================================================================成功调用："+gesture);
                            //平移，传入中指指尖，用指尖的相对移动来移动模型xy轴
                            console.log("传入中指尖参数：{}",landmarks[12])
                            moveModel(landmarks[12])
                        }else if(gesture == 4){
                            console.log(timeMark - timeMarked,"================================================================成功调用："+gesture);
                            //平移，传入中指指尖，用指尖的相对移动来移动模型xy轴
                            console.log("传入中指尖参数：{}",landmarks[12])
                            moveCam(landmarks[12])
                        }else if(gesture == 2){
                            console.log(timeMark - timeMarked,"================================================================成功调用："+gesture);
                            rotateCam()
                        }else {
                            console.log(timeMark - timeMarked,"================================================================成功调用："+gesture);
                            if(gesture == 6 || gesture ==7){
                                setSize(gesture);
                            }
                            
                            gestureMarked = 0
                            gestureMarked1 = 0
                            timeMarked = t
                            yourFunction();
                        }
                    }
                    //长按或拖动等操作需要判断当前手势是否改变
                }
                //与上一帧的手势不同
                if(gesture != gestureMarked1 || gesture == false){
                    console.log("手势变化，gesture："+gesture)
                    console.log("手势变化，gestureMarked1："+gestureMarked1)
                    gestureMarked1 = gesture
                    //刷新时间
                    gestureMarked = gesture
                    timeMarked = t
                    console.log("刷新时间")
                }
                
                // yourFunction();
            }
        }
    }
    canvasCtx.restore();
    if (results.multiHandWorldLandmarks) {
        // We only get to call updateLandmarks once, so we need to cook the data to
        // fit. The landmarks just merge, but the connections need to be offset.
        const landmarks = results.multiHandWorldLandmarks.reduce((prev, current) => [...prev, ...current], []);
        const colors = [];
        let connections = [];
        for (let loop = 0; loop < results.multiHandWorldLandmarks.length; ++loop) {
            const offset = loop * mpHands.HAND_CONNECTIONS.length;
            const offsetConnections = mpHands.HAND_CONNECTIONS.map((connection) => [connection[0] + offset, connection[1] + offset]);
            connections = connections.concat(offsetConnections);
            const classification = results.multiHandedness[loop];
            colors.push({
                list: offsetConnections.map((unused, i) => i + offset),
                color: classification.label,
            });
        }

        grid.updateLandmarks(landmarks, connections, colors);
    } else {
        grid.updateLandmarks([]);

    }
}
const hands = new mpHands.Hands(config);
hands.onResults(onResults);
// Present a control panel through which the user can manipulate the solution
// options.
new controls
    .ControlPanel(controlsElement, {
        selfieMode: true,
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    })
    .add([
        new controls.StaticText({ title: 'MediaPipe Hands' }),
        fpsControl,
        new controls.Toggle({ title: 'Selfie Mode', field: 'selfieMode' }),
        new controls.SourcePicker({
            onFrame: async(input, size) => {
                const aspect = size.height / size.width;
                let width, height;
                if (window.innerWidth > window.innerHeight) {
                    height = window.innerHeight;
                    width = height / aspect;
                } else {
                    width = window.innerWidth;
                    height = width * aspect;
                }
                canvasElement.width = width;
                canvasElement.height = height;
                await hands.send({ image: input });
            },
        }),
        new controls.Slider({
            title: 'Max Number of Hands',
            field: 'maxNumHands',
            range: [1, 4],
            step: 1
        }),
        new controls.Slider({
            title: 'Model Complexity',
            field: 'modelComplexity',
            discrete: ['Lite', 'Full'],
        }),
        new controls.Slider({
            title: 'Min Detection Confidence',
            field: 'minDetectionConfidence',
            range: [0, 1],
            step: 0.01
        }),
        new controls.Slider({
            title: 'Min Tracking Confidence',
            field: 'minTrackingConfidence',
            range: [0, 1],
            step: 0.01
        }),
    ])
    .on(x => {
        const options = x;
        videoElement.classList.toggle('selfie', options.selfieMode);
        hands.setOptions(options);
    });