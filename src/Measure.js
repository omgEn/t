import CreateLine from "./createLine";
import * as THREE from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';

export default class Measure {
    constructor(that) {
        const { scene, camera, controls, renderer, meshGroup, container, width, height } = that

        this.scene = scene
        this.camera = camera
        this.controls = controls
        this.renderer = renderer
        this.canvas = container
        this.width = width
        this.height = height
        this.lineId = 0;
        this.markers = [] // [1:{},2:{}]
        this.meshGroup = meshGroup

        this.startPoint = 0
        this.endPoint = 0

        this.drawingLine = false
        this.labelRenderer = null
        this.isClickLabel = false
        this.isClickDown = false
        this.activeLine = null
        this.dragControls = null

        this.isDrag = false
        this.dragPoint = ''

        this.init()
        this.animate()

    }
    init() {
        this.canvas.addEventListener('mousedown', this.fnMouseDown.bind(this))
        this.canvas.addEventListener('mouseup', this.fnMouseUp.bind(this))
        this.canvas.addEventListener('mousemove', this.fnMove.bind(this))
        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(this.width, this.height);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0px';
        this.canvas.appendChild(this.labelRenderer.domElement);
        const controls = new OrbitControls(this.camera, this.labelRenderer.domElement);
        this.canvas.addEventListener('resize', this.onWindowResize.bind(this));


    }
    onRay(event) {
        if (!event) return []
        // event.preventDefault()
        let mouse = new THREE.Vector2();
        // 标准设备坐标转空间坐标

        // 计算以画布开始为(0,0)点的鼠标坐标
        const { width, height } = this
        const rect = this.canvas.getBoundingClientRect()
        mouse = {
            x: ((event.clientX - rect.left) * width) / rect.width,
            y: ((event.clientY - rect.top) * height) / rect.height
        }
        // 鼠标在three.js中归一化坐标
        let pickPosition = new THREE.Vector2()
        // 数据归一化
        pickPosition.x = (mouse.x / width) * 2 - 1
        pickPosition.y = (mouse.y / height) * -2 + 1

        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(pickPosition, this.camera);
        let intersects = raycaster.intersectObjects(this.meshGroup.children);
        return intersects || []
    }
    fnMove(event) {
        // if (this.isClickDown) return

        // console.log('fnMove', this.isDrag);
        const intersects = this.onRay(event)
        // console.log('--', this.activeLine, this.markers);

        if (intersects.length && this.activeLine) {
            // console.log('fnmove', 2);
            const point = intersects[0].point
            if (this.isDrag) {
                const name = this.dragPoint
                const obj = this.activeLine.getPoints().children
                console.log('name', name);
                const p1 = obj[0].position, p2 = obj[1].position
                if (name === 'start-point') {
                    this.activeLine.initLine(p2, point)
                } else {
                    this.activeLine.initLine(p1, point)
                }
            } else {
                this.activeLine.initLine(this.startPoint, point)
            }

            // this.markers[i] = this.activeLine

        }
    }
    fnMouseUp(event) {
        console.log('up');
        this.isClickDown = false
        this.controls.enabled = true
    }
    fnMouseDown(event) {
        console.log('down');
        this.isClickDown = true
        // this.controls.enabled = false
        console.log('click');
        if (this.isDrag) return
        // 点击label标签时不触发
        // if (this.isClickLabel) return
        if (event.button === 0) {
            const intersects = this.onRay(event)
            if (!intersects.length) return
            const id = this.lineId
            const obj = intersects[0]
            const point = obj.point
            if (this.startPoint) {
                // 一条线结束
                if (!this.isDrag) {
                    this.endPoint = point
                    const currentId = id - 1
                    const lineObj = this.markers[currentId]
                    const p = lineObj.drawPoint(this.endPoint)
                    lineObj.initLine(this.startPoint, this.endPoint)
                    // this.activeLine = lineObj
                    this.activeLine = null
                    this.labelListener(lineObj, currentId)

                    this.startPoint = null
                    this.markers.slice(0, -1).forEach((item) => {
                        item.changeHelperVisible(false)
                    })
                    this.initDragControls(currentId)
                } else {
                    console.log('2222222222', this.activeLine);
                    const name = this.dragPoint
                    const obj = this.activeLine.getPoints().children
                    const p1 = obj[0].position, p2 = obj[1].position
                    console.log('name', obj);
                    // 拖动可以是拖动两个端点中的一个,不一定是尾巴点
                    if (name === 'start-point') {
                        this.activeLine.drawPoint(point, true)
                        this.activeLine.initLine(p2, point)
                    } else {
                        this.activeLine.drawPoint(point)
                        this.activeLine.initLine(p1, point)
                    }
                    this.activeLine = null
                }


            } else {
                // 一个点开始
                this.startPoint = point
                this.endPoint = null
                this.markers[id] = new CreateLine(this.startPoint, this.endPoint)
                this.activeLine = this.markers[id]
                this.scene.add(this.markers[id].getWrapGroup())
                this.lineId++

            }
            // console.log(this.markers, id);
        }

    }
    labelListener(lineObj, currentId) {
        const o = this.markers[currentId]
        if (!lineObj) return
        const activeLabel = lineObj.getWrapGroup().getObjectByName('label active-label');
        if (!activeLabel) return
        // this.initDragControls(currentId)
        activeLabel.element.addEventListener('mousedown', () => {
            console.log('down');
            // 显示当前点击label的辅助线
            const currentLineGroup = this.markers.filter((item, idx) => idx === currentId)[0]
            currentLineGroup.changeHelperVisible(true)
            // 隐藏其他非点击label的辅助线
            const otherLineGroup = this.markers.filter((item, idx) => idx !== currentId)
            otherLineGroup.forEach((item) => item.changeHelperVisible(false))
            this.isClickLabel = true
            // 端点触发移动事件
            // const points = lineObj.pointGroup
            // console.log('=points', points, lineObj);
            // if (this.dragControls) {
            //     this.dragControls.dispose()
            // }
            // this.dragControls = new DragControls(points.children, this.camera, this.renderer.domElement);
            // // points
            // this.dragControls.addEventListener('drag', () => {
            //     this.renderer.render(this.scene, this.camera);
            // });
            this.initDragControls(currentId)
        }, false)
        activeLabel.element.addEventListener('mouseup', () => {
            console.log('up');
            this.isClickLabel = false
        }, false)
    }
    // 添加拖拽控件
    initDragControls(i) {
        const lineObj = this.markers[i]
        // 添加平移控件
        // var transformControls = new THREE.TransformControls(camera, renderer.domElement);
        // scene.add(transformControls);

        if (this.dragControls) {
            this.dragControls.dispose()
        }
        // 过滤不是 Mesh 的物体,例如辅助网格对象
        // var objects = [];
        // for (let i = 0; i < scene.children.length; i++) {
        //     if (scene.children[i].isMesh) {
        //         objects.push(scene.children[i]);
        //     }
        // }
        this.activeLine = lineObj

        const self = this
        const objects = lineObj.getPoints().children
        console.log('-ob', objects, i, this.markers);
        // 初始化拖拽控件
        this.dragControls = new DragControls(objects, this.camera, this.renderer.domElement);

        this.dragControls.addEventListener('drag', function (event) {

            self.isDrag = true

            // const intersects = self.onRay(event)
            const { position, name } = event.object
            self.dragPoint = name
            return
            console.log('----------event', event);
            // const p = event.object.position
            const p1 = objects[0].position, p2 = objects[1].position
            // console.log('dragmove', p1.isE, event, p);
            // console.log(p);
            self.startPoint = objects[0].position
            // self.fnMove(event, String(i))
            self.controls.enabled = false;

            let raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(position, self.camera);
            let intersects = raycaster.intersectObjects(self.meshGroup.children);
            if (intersects.length) {
                // 拖动可以是拖动两个端点中的一个,不一定是尾巴点
                console.log('-----', self.activeLine.getWrapGroup(), self.markers);
                if (name === 'start-point') {
                    self.activeLine.initLine(p2, position)
                } else {
                    self.activeLine.initLine(p1, position)
                }
            }
        }, true);
        // 鼠标划中
        this.dragControls.addEventListener('hoveron', function (event) {
            // 让变换控件对象和选中的对象绑定
            // transformControls.attach(event.object);
            self.controls.enabled = false
        }, true);
        // 开始拖拽
        this.dragControls.addEventListener('dragstart', function (event) {
            self.isDrag = true
            self.controls.enabled = false;
        }, true);
        // 拖拽结束
        this.dragControls.addEventListener('dragend', function (event) {
            self.isDrag = false
            console.log('---end');
            const { position, name } = event.object
            const p1 = objects[0].position, p2 = objects[1].position
            self.controls.enabled = true;
            let raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(position, self.camera);
            let intersects = raycaster.intersectObjects(self.meshGroup.children);
            if (intersects.length) {
                // 拖动可以是拖动两个端点中的一个,不一定是尾巴点
                if (name === 'start-point') {
                    self.activeLine.drawPoint(position, true)
                    // self.activeLine.initLine(p2, position)
                } else {
                    self.activeLine.drawPoint(position)
                    // self.activeLine.initLine(p1, position)
                }
                self.activeLine = null
            }


            // const p = event.object.position
            // self.activeLine.initLine(self.startPoint, p)
            this.dispose()
        }, true);
        // 鼠标滑过
        this.dragControls.addEventListener('hoveroff', function (event) {
            // 让变换控件对象和选中的对象绑定
            self.isDrag = false
            // transformControls.attach(event.object);
            self.controls.enabled = true
            // self.dragControls.dispose()
        }, true);
    }

    addDragEvent() {
        // render
    }
    animate() {
        const self = this
        function render() {
            requestAnimationFrame(render);
            self.labelRenderer.render(self.scene, self.camera);
        }
        render()
    }
    onWindowResize() {
        this.labelRenderer.setSize(this.width, this.height);
        this.animate()
    }
}