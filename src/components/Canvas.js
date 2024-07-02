
import React from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader';
import modelCar from '../assets/model/test.glb'; // -com test.fbx 
import modelPowerPillar from '../assets/model/power_pillar.fbx';
import modelPowerWall from '../assets/model/power_wall.fbx';
import { CustomModel, SetLogoCustom, SetLogoImg, SetColor, GetClickObj, GetArrowPos, GetNextLogoValue, GetNextArrowPos, modelH, transTime, GetPanoMesh, SetTween, SetColTween } from '../data/info';

import imgIconRotate from '../assets/images/icon_rotate_black.png';
import imgIconMoon from '../assets/images/icon_moon_black.png';
import imgIconSun from '../assets/images/icon_sun_black.png';
import imgIconLight from '../assets/images/icon_light_black.png';
import imgIconUnLight from '../assets/images/icon_unlight_black.png';
import imgIconCamera from '../assets/images/icon_camera_black.png';
import imgIconShare from '../assets/images/icon_share_black.png';
import imgPowerBloom from '../assets/images/bloom_power.png';

import imgFloor from '../assets/images/floor.jpg';

const disM = 2.12 - 1.41, disL = 2.42 - 1.41, bottomY=0.231, langEasyY = 1.583, langSpaceY = 2.033, langEasyH = langEasyY - bottomY, langSpaceH = langSpaceY - bottomY, boxBottomH = 0.3;
const gltf = true, rWheel = -0.02, rUnit = Math.PI*2/3, powerTime = 20, simBackDis = {x: 0.93, y:-0.1};

export default class CanvasComponent extends React.Component {
	constructor(props) {
		super(props);
		const {pageKey, lan, selSize, selCol, selEasyTwo, logoCustom, wSize, tSize} = props;
		this.raycaster = new THREE.Raycaster(); this.mouse = new THREE.Vector2();
		this.wheelArr = []; this.bodyMeshArr = []; this.lightMeshArr = []; this.bottomArr=[]; this.rearArr = []; this.backArr = []; this.boxArr = []; this.frontArr=[]; this.frameArr=[]; this.ceilingArr = []; this.bloomArr = []; this.lightBloomArr = []; this.logoArrowArr = []; this.sideMeshArr = []; this.powerArr = []; this.simOtherArr = []; this.protoModelArr = []; this.wheelCanooArr = []; this.fenderArr = []; this.glassLightArr = []; this.simRearModelArr = []; this.headlight0BloomArr = [];
		this.state = {pageKey, rotate:1, selCol, selSize, selEasyTwo, envMode:'sun', light:true, logoCustom, wSize, tSize, lan, selNight:0, selDeg:0}; this.mouseStatus = 'none';
	}

	componentDidMount() {
		this.initScene();
		this.loadPlane();
		this.loadPanoBack();
		this.loadModel();
		setTimeout(() => {
			console.log(this.simOtherArr);
		}, 3000);
	}

	componentWillReceiveProps(nextProps) {
		['pageKey', 'lan', 'box', 'rear', 'selType', 'brake', 'strap', 'selSize', 'selCol', 'selSubPart', 'selFront', 'selOption', 'selPower', 'logoImg', 'logoCustom', 'logoControl', 'wSize', 'tSize', 'proto', 'selSimRear', 'selHeadlight'].forEach(key => {
			if (this.state[key] !== nextProps[key]) {
				this.setState({[key]:nextProps[key]}, () => {
					const {box, rear, brake, strap, logoImg, logoCustom, selCol, selPower, rotate, proto, selSimRear, selHeadlight} = this.state;
					if 		(key === 'selCol') {SetColor(this.bodyMeshArr, selCol);}
					else if (key === 'selSubPart') this.setBottomMesh();
					else if (key === 'box') {this.boxArr.forEach(child => { child.visible = box });}
					else if (key === 'rear' && this.backBrake) {
						this.rearArr.forEach(child => { child.visible = rear;});
						this.backBrake.visible = rear;
						this.setCeiling();
						this.setPickFrame();
					} else if (key === 'brake' && this.brakeGroup) this.brakeGroup.visible = brake;
					else if (key === 'strap' && this.proSimStrap) this.proSimStrap.visible = strap;
					else if (key === 'selFront') { this.setFront(); this.setPickFrame(); }
					else if (key === 'selOption') { this.setOption(); this.setCeiling(); }
					else if (key === 'logoImg') { SetLogoImg(logoImg, this.logoMesh); }
					else if (key === 'logoCustom') { SetLogoCustom(logoCustom, this.logoMesh, this.logoArrowArr); }
					else if (key === 'wSize') { this.setCanvasSize(); }
					else if (key==='selSimRear') { this.simRearModelArr.forEach(item => { item.visible=item.name==='proSim_rear_'+selSimRear }); }
					else if (key==='selHeadlight') {
						if (!this.headlight1 || !this.headlight2) return;
						this.setHeadlightVisible();
						this.headlight1.visible = selHeadlight==='headlight1';
						this.headlight2.visible = selHeadlight==='headlight2';
					} else if (key === 'selPower') {
						if (this.showPowerObj && this.showPowerObj.powerKey!==selPower) this.hidePower(this.showPowerObj.powerKey);
						if (selPower) {if (rotate) this.setState({rotate:0}); else this.showPower(selPower);}
					} else if (key==='proto') {
						this.protoModelArr.forEach(item => { item.visible = item.name === 'proto_' + proto });
						this.wheelCanooArr.forEach(item => { item.visible = proto && proto.includes('canoo')});
						if (!this.protoDashCanoo || !this.protoDashPreme) return;
						this.protoDashCanoo.visible = proto && proto.includes('canoo');
						this.protoDashPreme.visible = proto && proto.includes('preme');
						this.simOtherArr.forEach(item => { item.visible = proto?false:true; });
						var deltaH = {x:0, y:0}
						const {oriPos} = this.handle;
						if (proto) {
							if (proto.includes('canoo')) deltaH = {x:-0.04, y:0.13};
							else if (proto==='preme_space') deltaH = {x:0, y:0.05};
						}
						this.handle.visible = proto!=='simplex';
						this.handle.position.set(oriPos.x + deltaH.x, oriPos.y + deltaH.y, 0);
						this.chairBox.visible = proto!=='simplex';
						['x', 'y'].forEach(axis => { this.sitzModel.position[axis] = this.sitzModel.oriBackPos[axis] + simBackDis[axis] * (proto==='simplex'?1:0) });
						this.setSelFrame(); this.setFront();
						this.fenderArr.forEach(item => { item.visible = (!proto || proto === 'simplex') });
					} 
				});
			}
		});
	}

	setCanvasSize = () => {
		const {wSize} = this.state;
		this.renderer.setSize(wSize.width, wSize.height);
		this.camera.aspect = wSize.width/wSize.height;
		this.camera.updateProjectionMatrix();
	}

	setPickFrame = () => {
		const {selOption, rear, selFront, selSubPart} = this.state;
		this.framePickUp.visible = false;
		if (rear) {
			this.framePickUp.visible = selSubPart !== 'easyOne'; // true;
			this.framePickUp.scale.z = selFront==='xl'?0.0252:0.0188;
		} else {
			this.framePickUp.visible = selOption==='pickUp';
			this.framePickUp.scale.z = 0.01;
		}
	}

	setFront = () => {
		const {selFront, proto} = this.state, topLevel = selFront === 'xl'?true:false, protoStr=proto?'simplex':'';
		this.frontArr.forEach(child => { child.visible = child.name.includes('frontMain_'+selFront+protoStr) });
		if (proto) {
			this.chairSpace.visible = proto.includes('space');
			this.chairRegular.visible = proto==='canoo_lino' || proto==='simplex';
		} else {
			this.chairSpace.visible = topLevel;
			this.chairRegular.visible = !topLevel;
		}
		this.boxArr.forEach(child => { if (child.name.includes('top')) { const axis = gltf?'y':'z'; child.scale[axis] = topLevel?0.01: (langEasyH - boxBottomH)/langSpaceH * 0.0101; } });
		this.setCeiling({show:(selFront === 'regular' || selFront === 'xl'), top:selFront==='xl'?langSpaceY:langEasyY});
		this.setSelFrame();
		this.totalGroup.position.y = topLevel?modelH/-2.5:modelH/-3;
	}

	setSelFrame = () => {
		const {selFront, proto} = this.state;
		this.frameArr.forEach(child => { 
			child.visible = false;
			if (proto) return;
			if (selFront==='regular' && child.name==='frame_RAHMEN_EasyOne') child.visible = true;
			else if (selFront==='xl' && child.name==='frame_RAHMEN_Space') child.visible = true;
			else if (child.name==='frame_RAHMEN_Mini') child.visible = true;
		});
	}

	setOption = () => {
		const {selOption} = this.state;
		switch (this.state.selOption) {
			case 'basic':  case 'eppBox':  case 'passenger': this.boxArr.forEach(child => { child.visible = false; }); break;
			case 'pickUp': this.boxArr.forEach(child => { child.visible = !child.name.includes('top'); }); break;
			case 'cargo': this.boxArr.forEach(child => { child.visible = true; }); break;
			default: break;
		}
		this.eppBox.visible = selOption==='eppBox';
		this.passenger.visible = selOption==='passenger';
		this.backBrake.visible = (selOption==='cargo' || selOption==='pickUp');
		this.setPickFrame();
	}

	setCeiling = (info) => {
		const {selSubPart, selOption, rear} = this.state;
		var ceilingW = 0;
		if (selSubPart==='easyTwo' || selSubPart==='carGolion' || selSubPart==='space') ceilingW = disM;
		else if (selSubPart === 'spaceXl') ceilingW = disL;
		const oriW = (selOption ==='cargo' || rear)?ceilingW:0, realW = oriW/disL * 0.01;
		this.ceilingArr.forEach(child => {
			if (child.name === 'ceiling_back_body') child.position.x = child.oriBackPos + realW * 100;
			else if (child.name === 'ceiling_body') child.scale.x = realW;
			if (!info) return;
			if (info.top) child.position.y = info.top;
			if (info.show !== undefined) child.visible = info.show;
		});
	}

	setBottomMesh = () => {
		const {selSubPart} = this.state;
		if (!selSubPart) return;
		var selBottom = '', dis = 0, pushR = 1;
		switch (selSubPart) {
			case 'easyOne': selBottom = 'SWB'; dis = 0;   	pushR = 1; break;
			case 'easyTwo': selBottom = 'MWB'; dis = disM;	pushR = 1.2; break;
			case 'carGolion':selBottom = 'MWB'; dis = disM;	pushR = 1.2; break;
			case 'space': 	selBottom = 'MWB'; dis = disM;	pushR = 1.2; break;
			case 'spaceXl': selBottom = 'LWB'; dis = disL;	pushR = 1.4; break;
			default: break;
		}
		this.bottomArr.forEach(child => { child.visible = child.name.includes(selBottom); });
		this.backArr.forEach(child => {
			if (child.name.includes('box') || child.name==='back_brake') child.position.x = child.oriBackPos + dis;
			else {
				if (dis === 0) child.position.x = child.oriBackPos;
				else child.position.x = child.oriBackPos + dis - 0.06;
			}
		});
		this.boxArr.forEach(child => {
			if (child.name.includes('side')) child.scale.x = selBottom==='LWB'?0.01: disM/disL * 0.0102;
		});
		this.framePickUp.scale.x = selBottom==='MWB'?0.01: disL/disM * 0.01;
		this.modelObj.position.x = modelH/-2.5 * pushR;
	}

	setEnvMode = (envMode) => {
		if (this.transEnvMode) return;
		this.transEnvMode = true;
		this.setState({envMode}, () => {
			const {envMode} = this.state, darkLight = 0.2, colBack = envMode==='sun'?1:0.27;
			// ChangePanoMesh(this.panoSun, this.panoMoon, envMode);
			this.panoMoon.material.transparent = true; this.panoMoon.material.opacity = envMode==='sun'?1:0;
			this.panoMoon.visible = true;
			SetTween(this.panoMoon.material, "opacity", envMode==='sun'? 0 : 1, transTime);
			setTimeout(() => {
				this.panoMoon.visible = envMode==='moon';
				this.panoMoon.material.transparent = false;
				this.transEnvMode = false;
			}, transTime+100);
			[{light:this.ambientLight, int:0.3}, {light:this.shadowLight, int:0.8}, {light:this.frontLight, int:0.4}, {light:this.backLight, int:0.4}].forEach(item => {
				SetTween(item.light, "intensity", envMode==='sun'? item.int : darkLight, transTime);
			});
			SetColTween(this.roundMesh.material, {r:colBack, g:colBack, b:colBack}, transTime);
			SetColTween(this.bottomMesh.material, {r:colBack, g:colBack, b:colBack}, transTime);
			SetColTween(this.scene.fog, {r:colBack, g:colBack, b:colBack}, transTime);

			this.shadowLight.castShadow = true;
			// this.shadowLight.castShadow = envMode==='sun';
			this.renderer.setClearColor(envMode==='sun'?0xFFFFFF:0x333333, 1);
		})
	}

	initScene = () => {
		const {wSize} = this.state;
		this.renderer = new THREE.WebGLRenderer({antialias:true, preserveDrawingBuffer: true});
		this.renderer.setSize(wSize.width, wSize.height);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		if (!document.getElementById("container")) return false;
		document.getElementById("container").appendChild(this.renderer.domElement);
		this.renderer.setClearColor(0xFFFFFF, 1);

		this.scene = new THREE.Scene();
		this.scene.fog = new THREE.Fog(0xFFFFFF, 14, 30);
		this.camera = new THREE.PerspectiveCamera(40, wSize.width / wSize.height, 0.01, 100);
		this.camera.position.set(-7, 2.5, -5.5);

		this.totalGroup = new THREE.Group(); this.scene.add(this.totalGroup);
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableDamping = true;
		this.controls.enablePan = false;
		this.controls.maxPolarAngle = Math.PI / 2 + 0; this.controls.minPolarAngle = 0.3;
		this.controls.minDistance = 6; this.controls.maxDistance = 13;
		this.controls.addEventListener('change', () => { this.setBloomLight(); })
		
		this.ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.3); this.scene.add(this.ambientLight);
		this.shadowLight = new THREE.DirectionalLight(0xFFFFFF, 0.8 ); this.scene.add( this.shadowLight ); this.shadowLight.castShadow = true;
		this.shadowLight.position.set(-5, 8, 5);
		this.shadowLight.shadow.mapSize.width = 512;
		this.shadowLight.shadow.mapSize.height = 512;
		this.shadowLight.shadow.camera.near = 0.5;
		this.shadowLight.shadow.camera.far = 500;
		this.backLight = new THREE.DirectionalLight(0xFFFFFF, 0.4 ); this.backLight.position.set(5, 4, -5); this.scene.add( this.backLight );
		this.frontLight = new THREE.DirectionalLight(0xFFFFFF, 0.4 ); this.frontLight.position.set(-5, -1, 0); this.scene.add( this.frontLight );
		this.renderer.setAnimationLoop( this.animate );
		document.getElementById('container').addEventListener('pointerdown', e=> {this.mouseStatus='down'; this.onMouseDown(e);});
		document.getElementById('container').addEventListener('pointermove', e=> {this.mouseStatus='move'; this.onMouseMove(e);});
		document.getElementById('container').addEventListener('pointerup', this.onClickCanvas);
	}

	onMouseDown = (e) => {
		if (this.logoStatus !== 'select') return;
		const interArrow = GetClickObj(e, this.logoArrowArr, this.camera, this.state.wSize, this.mouse, this.raycaster);
		const interBack  = GetClickObj(e, this.sideMeshArr, this.camera, this.state.wSize, this.mouse, this.raycaster);
		this.selArrowName = interArrow&&interBack?interArrow.object.name:null;
		if (this.selArrowName) {
			this.controls.enabled = false;
			this.logoStatus = 'arrowDown'; this.backSPos = {...interBack.point}; this.selarrowSPos = {...interArrow.object.position}; this.arrowSPos = GetArrowPos(this.state.logoCustom);
		}
	}

	onMouseMove = (e) => {
		if (this.logoStatus === 'select') {
			const interArrow = GetClickObj(e, this.logoArrowArr, this.camera, this.state.wSize, this.mouse, this.raycaster), intName = interArrow?interArrow.object.name:null;
			this.logoArrowArr.forEach(arrow => { arrow.material.opacity = arrow.name === intName?1:0.7; });
			document.getElementById('container').style.cursor = intName?'pointer':'default';
		} else if (this.logoStatus === 'arrowDown') {
			const interBack  = GetClickObj(e, this.sideMeshArr, this.camera, this.state.wSize, this.mouse, this.raycaster);
			if (!interBack) return;
			const {point} = interBack, dX = (point.x - this.backSPos.x)/this.modelObj.scale.x, dY = (point.y - this.backSPos.y)/this.modelObj.scale.x;
			const nextPosX = this.selarrowSPos.x + dX, nextPosY = this.selarrowSPos.y + dY;
			const nextArrowPos = GetNextArrowPos(this.selArrowName, this.arrowSPos, nextPosX, nextPosY);
			const nextLogoValue = GetNextLogoValue(nextArrowPos);
			this.props.setLogoCustom(nextLogoValue);
		}
	}

	onClickCanvas = (e) => {
		if (!this.state.logoImg) {return;}
		if (this.logoStatus==='arrowDown') {
			this.logoStatus = 'select'; this.selArrowName = null;
			this.controls.enabled = true;
		}
		if (!this.props.device && this.mouseStatus==='move') return; else this.mouseStatus = 'up';
		const interObj = GetClickObj(e, [this.logoMesh, this.panoSun], this.camera, this.state.wSize, this.mouse, this.raycaster);
		if (!this.logoStatus) {
			if (interObj.object.name==='logo_plane') {
				this.logoStatus = 'select';
				this.logoArrowArr.forEach(arrow => { arrow.visible = true; });
			}
		} else if (this.logoStatus==='select') {
			if (interObj.object.name.includes('pano_')) {
				this.logoStatus = null;
				this.logoArrowArr.forEach(arrow => { arrow.visible = false; });
			}
		}
	}

	loadPlane = () => {
		const planeMap = new THREE.TextureLoader().load(imgFloor);
		planeMap.wrapS = THREE.RepeatWrapping;
		planeMap.wrapT = THREE.RepeatWrapping;
		planeMap.repeat.set(25, 25);

		const planeGeo = new THREE.PlaneGeometry(100, 100);
		const planeMat = new THREE.MeshStandardMaterial({color:0xFFFFFF, map:planeMap});
		this.planeMesh = new THREE.Mesh(planeGeo, planeMat); this.planeMesh.receiveShadow = true;
		this.planeMesh.rotation.x = Math.PI / -2;
		this.totalGroup.add(this.planeMesh);
	}

	loadPanoBack = () => {
		this.panoSun = GetPanoMesh('pano_sun'); this.totalGroup.add(this.panoSun);
		this.panoMoon = GetPanoMesh('pano_moon'); this.totalGroup.add(this.panoMoon);
		this.roundMesh = GetPanoMesh('pano_round'); this.totalGroup.add(this.roundMesh);
		this.bottomMesh = GetPanoMesh('pano_bottom'); this.totalGroup.add(this.bottomMesh);
		this.setEnvMode('sun');
	}

	loadModel = () => {
		const modelArr = [{file:modelPowerPillar, key:'pillar'}, {file:modelPowerWall, key:'wall'}];
		const mapPowerBloom = new THREE.TextureLoader().load(imgPowerBloom);
		const colInfo = {blue:0x6CEAFE, black:0x000001, grey:0x222222, white:0xBBBBBB}; // , text:0x6CEAFE
		modelArr.forEach(modelItem => {
			new FBXLoader().load( modelItem.file, (object) => {
				object.children.forEach(child => {
					if (colInfo[child.name]) child.material.color.setHex(colInfo[child.name]);
					else if (child.name==='bloom') child.material = new THREE.MeshBasicMaterial({transparent:true, map:mapPowerBloom});
					else if (child.name==='text') child.material = new THREE.MeshBasicMaterial({color:0x6CEAFE});
					child.castShadow = true;
				});
				const scl = 1.875;
				object.powerKey = modelItem.key; object.visible = false;
				object.rotation.y = Math.PI/-2; object.position.z = -2.8; object.scale.set(scl, scl, scl);
				this.powerArr.push(object);
				this.totalGroup.add(object);
			}, (xhr) => { }, () => { } );
		});
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); // https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/
		const loader = gltf?new GLTFLoader:new FBXLoader();
		// if (gltf) loader.setDRACOLoader(dracoLoader);
		loader.load(modelCar, (object) => {
			console.log(object);
			if (gltf) object = object.scene;
			this.modelObj = CustomModel(object, this, gltf);
			this.totalGroup.add(object);
			this.setLightAnimate(true);
			this.setBloomLight();
			SetLogoImg(this.state.logoImg, this.logoMesh);
			SetLogoCustom(this.state.logoCustom, this.logoMesh, this.logoArrowArr);
			this.props.setLoading(true, 100 );
			this.props.callGetData();
		}, (xhr) => { const loadPro = Math.round(xhr.loaded/22000); this.props.setLoading(true, Math.min(loadPro, 99) );  }, () => {  })
		// for (let i = 0; i <= 20; i++) {setTimeout(() => { this.props.setLoading(true, i*5); }, i * 100);}
		// setTimeout(() => { this.props.callGetData(); }, 22 * 300);
	}

	setBloomLight = () => {
		const camDir = this.camera.getWorldDirection(new THREE.Vector3());
		var rotX = Math.atan2(camDir.x, camDir.z) // , rotY = Math.atan2(camDir.y, camDir.z);
		if (rotX<Math.PI/-2) rotX += Math.PI * 2;
		this.lightBloomArr.forEach(item => {
			item.lookAt(this.camera.position);
			const dRot = 1.1 - Math.abs(item.camDir - rotX);
			item.scale.set(dRot, dRot, dRot);
			item.visible = this.state.light&& dRot>0;
		});
	}

	setLightAnimate = (flag) => {
		this.lightMeshArr.forEach(item => {
			if (flag) item.material = new THREE.MeshBasicMaterial({color:item.oriCol});
			else item.material = new THREE.MeshStandardMaterial({color:item.oriCol});
			if (item.name==='DASHBOARD_1_white_emissive') item.material.color.setHex(flag?0xC7E5ED:0x666666);
		});
		this.bloomArr.forEach(child => { child.visible = flag; });
		this.setHeadlightVisible();
		this.glassLightArr.forEach(item => {
			item.material.color.setHex(flag?0xFFFFFF: 0xAAAAAA);
			item.material.opacity = flag?0.4:0.8;
		});
	}
	
	setHeadlightVisible = () => {
		const {selHeadlight, light} = this.state; var simGoldLightMat;
		this.headlight0BloomArr.forEach(item => { item.visible=selHeadlight==='headlight0'&&light });
		if (selHeadlight==='headlight0') {
			simGoldLightMat = light?new THREE.MeshBasicMaterial({color:0xFFFFFF}):new THREE.MeshStandardMaterial({color:0xEEEEEE});
		} else simGoldLightMat = this.goldMat;
		if (this.simplexGoldLight) this.simplexGoldLight.material = simGoldLightMat;
	}

	showPower = (showKey) => {
		this.showPowerObj = this.powerArr.find(item=>item.powerKey===showKey);
		this.showPowerObj.visible = true; this.showPowerObj.position.x = -1.5;
		this.showPowerObj.children.forEach(child => {
			child.material.opacity = 0; child.material.transparent = true;
		});
		this.showPowerTime = powerTime;
	}

	hidePower = (hideKey) => {
		this.hidePowerObj = this.powerArr.find(item=>item.powerKey===hideKey);
		this.hidePowerObj.children.forEach(child => { child.material.transparent = true; });
		this.hidePowerTime = powerTime;
	}

	rotateWheel = () => {
		if (!this.wheelArr[0]) return;
		const axis = gltf?'z':'y', wheelDir = gltf?-1:1;
		const {rotate, selPower} = this.state, wRot = this.wheelArr[0].rotation[axis], cRot = Math.floor(wRot/rUnit), dRot = cRot * rUnit - wRot;
		var rotVal = rotate?1:0;
		if (rotVal === 0 && wRot !== 0) {
			if (dRot > rWheel) {
				this.wheelArr.forEach(wheel => { wheel.rotation[axis] = 0; });
				if (selPower) { this.showPower(selPower) }
			} else rotVal = 1;
		}
		
		this.wheelArr.forEach(wheel => { wheel.rotation[axis] += rWheel * rotVal * wheelDir; });
		if (this.pedal) {
			this.pedal.rotation[axis] -= rWheel * rotVal;
			this.pedal.children.forEach(child => { child.rotation[axis] += rWheel * rotVal; });
		}
		if (rotVal) {
			this.planeMesh.position.x += 0.019;
			this.powerArr.forEach(item => { item.position.x += 0.019; });
		}
		if (this.planeMesh.position.x >= 4) this.planeMesh.position.x = 0;
	}

	animate=(time)=>{
		if (!this.camera || !this.scene) return;
		this.rotateWheel();
		this.rendering();
		if (this.showPowerTime > 0) {
			this.showPowerTime--;
			this.showPowerObj.children.forEach(child => {
				child.material.opacity += (1 / powerTime);
				if (this.showPowerTime === 0) {
					if (child.name !== 'bloom') child.material.transparent = false;
				}
			});
		}
		if (this.hidePowerTime > 0) {
			this.hidePowerTime--;
			this.hidePowerObj.children.forEach(child => {
				child.material.opacity -= (1 / powerTime);
			});
			if (this.hidePowerTime === 0) { this.hidePowerObj.visible = false; }
		}
	}
	rendering = () => {
		if (!this.camera || !this.renderer) return;
		this.camera.lookAt( 0, 0, 0 );
		this.controls.update();
		this.renderer.render(this.scene, this.camera);
		this.camera.updateProjectionMatrix();
	}

	clickCamera = () => {
		var canvas = document.getElementsByTagName("canvas")[0];
		var image = canvas.toDataURL("image/jpg");
		var downBtn = document.getElementById("downloadButton");
		downBtn.href = image;
	}

	render() {
		const {pageKey, rotate, envMode, light, tSize, selPower} = this.state// , {innerWidth, innerHeight} = window//, land = innerWidth>innerHeight;
		return (
			<div className={`back-board canvas ${pageKey==='canvas'?'active':''}`} style={{width:tSize.w, height:tSize.h, left:tSize.l}}>
				<div className='container' id='container'></div>
				<div className='set-item set-light' onClick={()=>this.setState({light: !light}, () => {this.setLightAnimate(this.state.light);  }) }>
					<div className='circle'><img src={light?imgIconLight:imgIconUnLight} alt=''></img></div>
				</div>
				<div className={`set-item set-rotate ${rotate?'rotate':''} ${selPower?'disable':''}`} onClick={()=> {if (selPower) return; this.setState({rotate:rotate===1?0:1})} }>
					<div className='circle'><img src={imgIconRotate} alt=''></img></div>
				</div>
				<div className='set-item set-sun' onClick={()=> this.setEnvMode(envMode==='sun'?'moon':'sun') }>
					<div className='circle'><img src={envMode==='sun'?imgIconSun:imgIconMoon} alt=''></img></div>
				</div>
				<a className="set-item set-camera" id="downloadButton" download="EmogonRD_screen_capture.jpg" href="" onClick={this.clickCamera}>
					<div className='circle'><img className="camera" src={imgIconCamera} alt=""></img></div>
				</a>
				<div className='set-item set-share' onClick={()=> this.props.openShareModal() }>
					<div className='circle'><img src={imgIconShare} alt=''></img></div>
				</div>
			</div>
		);
	}
}
