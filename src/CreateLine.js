import { Group } from "three"
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


export default class CreateLine {
    // p1,p2 两点
    constructor(p1, p2) {
        this.activeLabel = null
        this.activeLine = null
        this.xyzLabel = new Group()
        this.xyzLine = new Group()
        this.startPoint = p1
        this.endPoint = p2
        this.wrapGroup = new Group()
        this.labelRenderer = null
        this.pointGroup = new Group()

        this.lineColor = {
            'x': new THREE.Color(0xff0000),
            'y': new THREE.Color(0x66ff00),
            'z': new THREE.Color(0x0099cc),
            'all': new THREE.Color(0x000000)
        }

        this.lineId = 0;
        this.markers = [] // [1:{},2:{}]
        this.init()
    }
    drawPoint(p, isStart = false) {
        if (!p) return
        const material = new THREE.SpriteMaterial({ color: Math.random() * 0xffffff, depthTest: false });
        const sprite = new THREE.Sprite(material);
        sprite.isSpriteMaterial = false
        let name = ''
        // if (!this.startPoint) {
        //     this.startPoint = p
        //     name = 'start-point'
        // } else {
        //     this.endPoint = p
        //     name = 'end-point'
        // }
        if (isStart) {
            this.startPoint = p
            name = 'start-point'
        } else {
            this.endPoint = p
            name = 'end-point'
        }

        // this.wrapGroup.add(sprite)

        const { x, y, z } = p
        let point = this.pointGroup.getObjectByName(name);
        // console.log('--name', name, point, this.pointGroup);
        if (point) {
            console.log('point1', name);
            sprite.position.set(x, y, z)
        } else {
            console.log('point2', name);
            sprite.scale.set(0.01, 0.01, 0.01)
            sprite.position.set(x, y, z)
            sprite.name = name
            this.pointGroup.add(sprite)
        }
        return sprite
    }
    init() {
        this.drawPoint(this.startPoint, true)

        // this.wrapGroup.add(this.activeLine)
        this.wrapGroup.add(this.xyzLabel)
        this.wrapGroup.add(this.xyzLine)
        this.wrapGroup.add(this.pointGroup)
    }
    getWrapGroup() {
        return this.wrapGroup
    }


    initLine(p1, p2) {
        if (!p1 || !p2) return
        if (p1.equals(p2)) return
        this.startPoint = p1
        this.endPoint = p2
        let py = new THREE.Vector3(p1.x, p2.y, p1.z);
        let pz = new THREE.Vector3(p1.x, p2.y, p2.z);
        const xHelper = [pz, p2]
        const yHelper = [p1, py]
        const zHelper = [py, pz]

        let line = this.drawLine(p1, p2, 'all')
        let linex = this.drawLine(xHelper[0], xHelper[1], 'x');
        let liney = this.drawLine(yHelper[0], yHelper[1], 'y');
        let linez = this.drawLine(zHelper[0], zHelper[1], 'z');

        this.xyzLine.add(linex, liney, linez)
        this.wrapGroup.add(line)

        let label = this.drawLabel(p1, p2, 'all')
        this.wrapGroup.add(label)
        let labelx = this.drawLabel(xHelper[0], xHelper[1], 'x');
        let labely = this.drawLabel(yHelper[0], yHelper[1], 'y');
        let labelz = this.drawLabel(zHelper[0], zHelper[1], 'z');
        this.xyzLabel.add(labelx, labely, labelz)
    }
    // 清空当前辅助线
    clearHelper() {
        this.xyzLabel.children.forEach((item) => item.visible = false)
        this.xyzLine.children.forEach((item) => item.visible = false)
    }
    // 显示当前辅助线,清空其他辅助线
    showHelper() {
        this.xyzLabel.children.forEach((item) => item.visible = true)
        this.xyzLine.children.forEach((item) => item.visible = true)
    }
    // 控制辅助线的显隐
    changeHelperVisible(visible) {
        this.xyzLabel.children.forEach((item) => item.visible = visible)
        this.xyzLine.children.forEach((item) => item.visible = visible)
    }
    // 动态创建label
    drawLabel(p1, p2, status = 'all') {
        const labelName = {
            'x': 'label x-label',
            'y': 'label y-label',
            'z': 'label z-label',
            'all': 'label active-label'
        }
        const name = labelName[status]
        let dis = this.getDistance(p1, p2)
        let pos = this.getCenterPos(p1, p2)
        let label = this.wrapGroup.getObjectByName(name);
        if (label) {
            const text = status === 'all' ? '~' : status + ':'
            label.element.textContent = text + dis;
            // label.element.innerHTML = '222<br/>333'
            label.position.set(pos.x, pos.y, pos.z);
        } else {
            label = this.createLabel('~' + dis, pos, name);
            label.name = name;
            // this.wrapGroup.add(label);
        }
        return label
    }
    getPoints() {
        return this.pointGroup
    }
    // 创建label
    createLabel(text, pos, name) {
        const div = document.createElement('div');
        div.className = name;
        div.textContent = text;
        div.style.zIndex = '-1'
        const divLabel = new CSS2DObject(div);
        divLabel.position.set(pos.x, pos.y, pos.z);
        return divLabel;
    }
    // 动态创建线
    drawLine(p1, p2, status = 'all') {
        const labelName = {
            'x': 'x-line',
            'y': 'y-line',
            'z': 'z-line',
            'all': 'active-line'
        }
        const name = labelName[status]
        let line = this.wrapGroup.getObjectByName(name);
        let pos = this.getNumberArr(p1, p2)
        if (line) {
            line.geometry.setPositions(pos)
        } else {
            line = this.createLine(p1, p2, status);
            line.name = name;
        }
        return line
    }
    // 创建line
    createLine(p1, p2, status = 'all') {
        // 红色代表 X 轴.绿色代表 Y 轴.蓝色代表 Z 轴.
        const color = this.lineColor
        const vertices = this.getNumberArr(p1, p2)
        const geometry = new LineGeometry();
        geometry.setPositions(vertices);
        // geometry.setAttribute('position', vertices);
        // geometry.setColors(new Float32Array([r, g, b]))

        const matLine = new LineMaterial({
            color: color[status],
            linewidth: 0.002, // in world units with size attenuation, pixels otherwise
            // vertexColors: false, // 以顶点颜色为准
            //resolution:  // to be set by renderer, eventually
            dashed: false,
            // alphaToCoverage: true,
            depthTest: false
        });

        const line = new Line2(geometry, matLine);
        // line.computeLineDistances();

        if (status === 'all') {
            line.onBeforeRender = function () {
                const positions = line.geometry.attributes.position.array
                const v0 = new THREE.Vector3(
                    positions[0],
                    positions[1],
                    positions[2]
                )
                const v1 = new THREE.Vector3(
                    positions[3],
                    positions[4],
                    positions[5]
                )
                // console.log('----', line, v0, v1);
            }
        }

        return line
    }
    getNumberArr(p1, p2) {
        const positions = [p1.x, p1.y, p1.z, p2.x, p2.y, p2.z]
        return new Float32Array(positions)
        return positions
        return new THREE.Float32BufferAttribute(positions, 3)
    }
    // 求两点之间的中心
    getCenterPos(p1, p2) {
        let pos = new THREE.Vector3().copy(p1);
        // let dis = pos.distanceTo(p2).toFixed(2)
        pos.add(p2);
        pos.multiplyScalar(0.5);
        return pos
    }
    // 求两点距离
    getDistance(p1, p2) {
        let pos = new THREE.Vector3().copy(p1);
        let dis = pos.distanceTo(p2).toFixed(2)
        return dis
    }




}