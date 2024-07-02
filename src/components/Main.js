import React from 'react';
import jQuery from 'jquery';
import StartTempComponent from './StartTemp';
import MapComponent from './Map';
import CanvasComponent from './Canvas';
import SideComponent from './Side';
import LoadingComponent from './Loading';
import LanguageComponent from './Language';
import ModalShareComponent from './Modal';
import { apiUrl } from '../data/info';
import imgIconBack from '../assets/images/icon_arrow_black.png';

import '../assets/css/index.css';

const testMode = false, logoTest = false;
const defaultLogoCustom = {w:5, h:3, t:1.2, l:1.7, r:0}
const {availWidth, availHeight} = window.screen, screenWidth = Math.max(availWidth, availHeight), screenHeight = Math.min(availWidth, availHeight);
const device = getDevice();
function getDevice() {
	const userAgent = navigator.userAgent || navigator.vendor || window.opera;
	if (/windows phone/i.test(userAgent)) { return "windows"; }
	if (/android/i.test(userAgent)) { return "android"; }
	if (navigator.userAgent.match(/iPad/i) != null) return 'iPad';
	if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) { return "ios"; }
	return undefined;
}

function getWSize(w, h, dir) {
	var width, height, scale='normal';
	if (device) {
		if (dir==='land') {
			width = device==='iPad'?w - 400: w * 0.6; height = h;
		} else {
			width = h; height = w*0.6;
		}
	} else {
		width = w - 400; height = h;
		if (w<2000||h<1100) scale='small';
	}
	return {width, height, scale};
}

export default class MainComponent extends React.Component {
	constructor(props) {
		super(props);
		const {innerWidth, innerHeight} = window, dir = innerWidth>innerHeight?'land':'port';
		const w = Math.max(innerWidth, innerHeight), h = Math.min(innerWidth, innerHeight), wSize = getWSize(w, h, dir);
		this.state = {loading:true, pageKey:'start', wSize, rear:false, brake:false, strap:false, frontArr:[], colArr:[], customArr:[], sizeArr:[], contArr:[], powerArr:[], simRearArr:[], headlightArr:[], rearInfo:{}, brakeInfo:{}, strapInfo:{}, batteryInfo:{}, logoInfo:{}, selBattery:{}, catArr:[], selectArr:[], protoArr:[], logoCustom:defaultLogoCustom, tSize:{w:innerWidth, h:innerHeight, l:0}, dir, lan:'en', labelOther:{}};
	}

	componentDidMount() {
		this.getSelectData();
		this.setState({pageKey:'start', rear:true, brake:true});
		// if (testMode) setTimeout(() => { this.setState({pageKey:'purpose', selType:'custom'}) }, 0);
		this.setCanvasSize();
		window.addEventListener('resize', this.setCanvasSize);
		window.addEventListener('orientationchange', ()=> {
			for (let i = 0; i < 7; i++) {
				setTimeout(() => { this.setCanvasSize(); }, 200 * i);
			}
		});
		const ipUrl = "https://api.ipdata.co?api-key=c2eb47c52f4740843c95757d4b532b4c2cba5ad4185895769cf9edb8"; // 37.201.226.249
		jQuery.ajax({ url: ipUrl, type: 'GET',
			success: (data) => {
				const lan = data.country_name === "Germany"?'de':'en';
				this.setState({lan})
			}, error: function(err) { window.alert("Failed to get IP location to choose language"); }
		});
	}

	getSelectData = () => {
		if (testMode) { // window.location.protocol==='http:' && device && 
			const catArr = [
				{id: "1", name: "color", label: "COLOR", label_de: "FARBE"},
				{id: "2", name: "front", label: "WINDSHIELD", label_de: "WINDSCHUTZSCHEIBE"},
				{id: "4", name: "option", label: "YOUR OPTION", label_de: "DEINE OPTION"},
				{id: "5", name: "rear", label: "REAR PANEL", label_de: "REAR PANEL"},
				{id: "6", name: "brake", label: "BRAKE LIGHT", label_de: "BREMSLICHT"},
				{id: "7", name: "logo", label: "Add Logo", label_de: "MEIN LOGO"},
				{id: "8", name: "power", key: "power", label: "POWER", label_de: "ENERGIE"},
				{id: "9", name: "battery", key: "battery", label: "BATTERY PACKS", label_de: "AKKUPACKS"},
				{id: "10", name: "headlight", key: "headlight", label: "Headlights", label_de: "Scheinwerfer"},
				{id: "11", name: "strap", key: "strap", label: "Bonnet Strap", label_de: "Bonnet Strap"}
			];
			const selDes = 'First Edition';
			const selectArr = [
				{id: "1", img: "easyOne_premade", 	key: "easyOne", 	label: "EASY ONE", 	name: "easyOne", 	price: "2999", 	description: selDes, description_de:selDes, label_de:''},
				{id: "2", img: "easyTwo_premade", 	key: "easyTwo", 	label: "EASY TWO", 	name: "easyTwo", 	price: "3400", 	description: selDes, description_de:selDes, label_de:''},
				{id: "4", img: "carGolion_premade", key: "carGolion", 	label: "CARGOLINO", name: "carGolion", 	price: "4000", 	description: selDes, description_de:selDes, label_de:''},
				{id: "5", img: "space_premade", 	key: "space", 		label: "SPACE", 	name: "space", 		price: "4500", 	description: selDes, description_de:selDes, label_de:''},
				{id: "6", img: "spaceXl_premade", 	key: "spaceXl", 	label: "SPACE XL", 	name: "spaceXl", 	price: "5000", 	description: selDes, description_de:selDes, label_de:''}
			];
			const customArr = [
				{id:1, name:'swb', label:'SWB', label_de:'SWB', img:'swb_custom', price:100, description:'Description of SWB model', description_de:'Beschreibung des SWB-Modells'},
				{id:2, name:'mwb', label:'MWB', label_de:'MWB', img:'mwb_custom', price:200, description:'Description of MWB model', description_de:'Beschreibung des MWB-Modells'},
				{id:3, name:'lwb', label:'LWB', label_de:'LWB', img:'lwb_custom', price:300, description:'Description of LWB model', description_de:'Beschreibung des LWB-Modells'}
			];
			const labelOther={}, labelArr = [
				{id: "1", name: "simplex", key: "simplex", label: "Simplex", label_de: "Simplex"},
				{id: "2", name: "specialVehicles", key: "specialVehicles", label: "Special Vehicles"},
				{id: "3", name: "prototypes", key: "prototypes", label: "Prototypes", label_de: "Prototypen"},
				{id: "4", name: "chooseModel", key: "chooseModel", label: "Choose your model", label_de:'Wählen Sie Ihr Modell'},
				{id: "5", name: "custom", key: "custom", label: "Custom", label_de: "Brauch"},
				{id: "6", name: "premade", key: "premade", label: "Premade", label_de: "Vorgefertigt"},
				{id: "7", name: "chooseRange", key: "chooseRange", label: "Choose your range", label_de:'Wählen Sie Ihr Sortiment'},
				{id: "8", name: "continue", key: "continue", label: "Continue", label_de: "Fortsetzen"},
				{id: "9", name: "firstEdition", key: "firstEdition", label: "FIRST EDITION", label_de: "ERSTE AUSGABE"},
				{id: "10", name: "space", key: "space", label: "Space", label_de: "Platz"},
				{id: "11", name: "toolTipCargoTop", key: "toolTipCargoTop"},
				{id: "12", name: "toolTipCargoScroll", key: "toolTipCargoScroll", label: "Scoll down or click"},
				{id: "13", name: "here", key: "here", label: "here", label_de: "hier"},
				{id: "14", name: "tip", key: "tip", label: "Tip", label_de: "Tipp"},
				{id: "15", name: "tooltipTip", key: "tooltipTip"},
				{id: "16", name: "cart", key: "cart", label: "Add to Cart", label_de: "In den Warenkorb"},
				{id: "17", name: "proto", key: "proto", label: "Prototype", label_de: "Prototype"}
			];
			const protoArr = [
				{ id: "1", img: "simplex_prototype", 	key: "simplex", 	label: "Simplex", 	label_de: "Simplex", 	name: "simplex", 	price: "250", description: "", description_de: ""},
				{ id: "2", img: "canoo_lino_prototype", key: "canoo_lino", label: "Canoo Lino", label_de: "Canoo Lino", name: "canoo_lino", price: "250", description: "", description_de: ""},
				{ id: "3", img: "canoo_space_prototype", key: "canoo_space", label: "Canoo Space", label_de: "Canoo Space", name: "canoo_space", price: "250", description: "", description_de: ""},
				{ id: "4", img: "preme_space_prototype", key: "preme_space", label: "Preme Space", label_de: "Preme Space", name: "preme_space", price: "250", description: "", description_de: ""},
			]
			catArr.forEach(item => { item.key=item.name;});
			customArr.forEach(item => { item.key=item.name;});
			selectArr.forEach(item => { item.key=item.name;});
			labelArr.forEach(item => { item.key===item.name; labelOther[item.key] = item; });
			this.setState({selectArr, catArr, customArr, labelOther, protoArr});
			return;
		}
		jQuery.ajax({ type: "GET", url: apiUrl+'getModel.php', dataType: 'json',
			success: (res) => {
				res.select_data.forEach(item => { item.description='First Edition'; item.description_de='Erste Ausgabe' });
				const labelOther = {};
				res.label_data.forEach(item => { labelOther[item.key] = item; });
				this.setState({selectArr:res.select_data, protoArr:res.proto_data, customArr:res.custom_data, catArr:res.category_data, labelOther});
			}
		});
	}

	getOptionData = () => {
		if (testMode) { // window.location.protocol==='http:' && device && 
			const res = [
				{id: "1", img: null, label: "Electric Blue", name: "blue", part: "color", piece: "4CBCDD", price: "100", description: "#52bede 20%, #77cce5 49.9%, #52bede 50%"},
				{id: "2", img: "", label: "Blizzard White", name: "white", part: "color", piece: "F8F8F8", price: "250", description: "#eeeeee 20%, #F8F8F8 49.9%, #eeeeee 50%"},
				{id: "3", img: "", label: "Lightning Yellow", name: "yellow", part: "color", piece: "DCDD33", price: "234", description: "#dcdd3b 20%, #e3e463 49.9%, #dcdd3b 50%"},
				{id: "4", img: "", label: "Eco Green", name: "green", part: "color", piece: "647B6B", price: "230", description: "#6d8374 20%, #8e9f93 49.9%, #6d8374 50%"},
				{id: "5", img: "", label: "Test Grey", name: "grey", part: "color", piece: "585B5B", price: "234", description: "#606363 20%, #848686 49.9%, #606363 50%"},
				{id: "6", img: "", label: "Silicon Silver", name: "sliver", part: "color", piece: "BDBDBD", price: "98", description: "#bebebe 20%, #cccccc 49.9%, #bebebe 50%"},
				{id: "7", img: "front_mini", label: "Mini", name: "mini", part: "windshield", piece: "", price: "100", description: "Your basic Windshield that offers a bit of wind protection."},
				{id: "8", img: "front_small", label: "Small", name: "small", part: "windshield", piece: "", price: "140", description: "A Windshield similar to that of a scooter. Offers great wind protection."},
				{id: "9", img: "front_regular", label: "Regular", name: "regular", part: "windshield", piece: "", price: "200", description: "Our maximum weather protection for you. Stay dry."},
				{id: "10", img: "front_xl", label: "XL", name: "xl", part: "windshield", piece: "", price: "250", description: "front XL description"},
				{id: "11", img: "option_basic", label: "Basic", name: "basic", part: "option", piece: "easyTwo, carGolion, space, spaceXl, mini, small, regular, xl", price: "100", description: "Our basic option offers the possibility to customize your Emogon rear."},
				{id: "12", img: "option_passenger", label: "Passenger", name: "passenger", part: "option", piece: "easyTwo, mini, small, regular", price: "150", description: "Want to have an Emogon Two-Seater? Here you go!"},
				{id: "13", img: "option_epp", label: "EPP Box", name: "eppBox", part: "option", piece: "easyTwo, mini, small, regular", price: "200", description: "EPP Box description"},
				{id: "14", img: "option_pickup", label: "Pick-Up", name: "pickUp", part: "option", piece: "easyTwo, carGolion, space, spaceXl, mini, small, regular, xl", price: "250", description: "Pick-Up description"},
				{id: "15", img: "option_cargo", label: "Cargo", name: "cargo", part: "option", piece: "carGolion, space, spaceXl, regular, xl", price: "300", description: "Cargo description"},
				{id: "16", img: "rear", label: "Rear Panel", name: "rear", part: "rear", piece: "", price: "100", description: "Rear description"},
				{id: "17", img: "brake", label: "Brake Light", name: "brake", part: "brake", piece: "", price: "100", description: "Brake description"},
				{id: "18", img: "logo", label: "Logo", name: "logo", part: "logo", piece: null, price: "150", description: "Logo Description"},
				{id: "19", img: "power_pillar", label: "Power Pillar", name: "pillar", part: "power", piece: null, price: "100", description: "Power Pillar Description"},
				{id: "20", img: "power_wall", label: "Power Wall", name: "wall", part: "power", piece: null, price: "100", description: "Power Wall Description"},
				{id: "21", img: "battery", label: "Battery", name: "battery", part: "battery", piece: null, price: "100", description: "Battery Wall Description"},
				{id: "22", img: "simRear_class", key: "class", label: "Classic Rear", label_de: "Klassisches Heck", name: "class", part: "simRear", piece: null, price: "100", description: "Description of classic rear option"},
				{id: "23", img: "simRear_race", key: "race", label: "Race Rear", label_de: "Rennen hinten", name: "race", part: "simRear", piece: null, price: "200", description: "Description of race rear option"},
				{id: "24", img: "headlight0", key: "headlight0", label: "Headlight 1", label_de: "Scheinwerfer 1", name: "headlight0", part: "headlight", piece: null, price: "100", description: "Description for Headlight 1"},
				{id: "25", img: "headlight1", key: "headlight1", label: "Headlight 2", label_de: "Scheinwerfer 2", name: "headlight1", part: "headlight", piece: null, price: "200", description: "Description for Headlight 2"},
				{id: "26", img: "headlight2", key: "headlight2", label: "Headlight 3", label_de: "Scheinwerfer 3", name: "headlight2", part: "headlight", piece: null, price: "300", description: "Description for Headlight 3"},
				{description: null, id: "27", img: "strap", key: "strap", label: "Bonnet Strap", label_de: "Bonnet Strap", name: "strap", part: "strap", piece: null, price: "100"}
			]
			res.forEach(item => { item.label_de = item.label; item.description_de = item.description; });
			this.setProcessResData(res);
			return;
		}
		jQuery.ajax({ type: "GET", url: apiUrl+'getOption.php', dataType: 'json',
			success: (res) => {
				if (res.error) {
					window.alert(res.error);
				} else {
					this.setProcessResData(res);
				}
			}
		});
	}

	setProcessResData = (res) => {
		var colArr = [], sizeArr = [], contArr = [], powerArr = [], simRearArr=[], headlightArr=[], rearInfo, brakeInfo, strapInfo, logoInfo, batteryInfo;
		res.forEach(item => {
			if (item.part === 'color') {
				item.str = '#'+item.piece;
				item.hex = parseInt(item.piece, 16);
				item.key = item.name;
				// item.hex = hex.toString(16)
				colArr.push(item);
			} else if (item.part === 'windshield') {
				item.key=item.name; sizeArr.push(item);
			} else if (item.part === 'option') {
				item.inArr = item.piece.split(', ');
				item.key=item.name; contArr.push(item);
			} else if (item.part === 'rear') rearInfo = item;
			else if (item.part === 'brake') brakeInfo = item;
			else if (item.part === 'strap') strapInfo = item;
			else if (item.part === 'battery') batteryInfo = item;
			else if (item.part === 'logo') logoInfo = item;
			else if (item.part === 'power') {item.key=item.name; powerArr.push(item);}
			else if (item.part === 'simRear') {item.key=item.name; simRearArr.push(item);}
			else if (item.part === 'headlight') {item.key=item.name; headlightArr.push(item);}
		});
		this.setMainData(colArr, sizeArr, contArr, powerArr, rearInfo, brakeInfo, strapInfo, batteryInfo, logoInfo, simRearArr, headlightArr);
	}

	setMainData = (colArr, sizeArr, contArr, powerArr, rearInfo, brakeInfo, strapInfo, batteryInfo, logoInfo, simRearArr, headlightArr) => {
		if (!this.state.selectArr.length) {
			setTimeout(() => { this.setMainData(colArr, sizeArr, contArr, powerArr, rearInfo, brakeInfo, strapInfo, batteryInfo, logoInfo, simRearArr, headlightArr); }, 1000);
		} else {
			this.setState({selCol:colArr[0].hex, colArr, sizeArr, contArr, powerArr, rearInfo, brakeInfo, strapInfo, batteryInfo, logoInfo, simRearArr, headlightArr, loading:false});
		}
	}

	setCanvasSize = () => {
		// const {innerWidth, innerHeight} = window, dir = innerWidth>innerHeight?'land':'port';
		// const w = Math.max(innerWidth, innerHeight), h = Math.min(innerWidth, innerHeight), wSize = getWSize(w, h, dir);
		// this.setState({tSize:{w, h, scale:wSize.scale, l:0}, wSize, dir});
		const {innerWidth, innerHeight} = window, dir = innerWidth>innerHeight?'land':'port';
		const pageWidth = dir==='land'?screenWidth:screenHeight, pageHeight = dir==='port'?screenWidth:screenHeight;
		const w = device==='ios'?pageWidth:innerWidth, h=innerHeight;
		const wSize = getWSize(Math.max(w, h), Math.min(w, h), dir);
		this.setState({dir, tSize:{w, h, l:(innerWidth-w)/2}, wSize});
	}

	render() {
		const {pageKey, lan, loading, selType, wSize, rear, brake, strap, selCol, selSubPart, frontArr, selFront, selOption, selPower, colArr, sizeArr, contArr, powerArr, simRearArr, headlightArr, rearInfo, brakeInfo, strapInfo, batteryInfo, logoInfo, catArr, selectArr, customArr, protoArr, logoImg, logoCustom, loadPro, loadingLogo, tSize, dir, logoControl, selBattery, proto, labelOther, selSimRear, selHeadlight, modalShow} = this.state;
		return (
			<div className={`page-wrapper ${device?'mobile':'web'} ${device} ${pageKey}-page ${wSize.scale}-scale`} id='pageWrapper' style={{width:tSize.w, height:tSize.h, left:tSize.l}}>
				<StartTempComponent
					lan={lan}
					tSize={tSize}
					wSize={wSize}
					device={device}
					pageKey={pageKey}
					customArr={customArr}
					selectArr={selectArr}
					protoArr={protoArr}
					labelOther={labelOther}
					callMapPage={(selType, selSubPart, proto)=> {
						this.setState({selSubPart, proto}, () => {
							const frontType = selSubPart.includes('space')?'xl':'regular';
							const selFront = (selType==='custom')?'mini':frontType;
							const brake = frontType!=='xl' && !proto, selCol = proto==='preme_space'?0x5A6D74:colArr[0].hex;
							this.setState({pageKey:'map', selType, selOption:'', selFront, selCol, logoImg:logoTest?'1235678':null, logoCustom:defaultLogoCustom, brake, selSimRear:'class', selHeadlight:'headlight0', strap:false}, () => {
								var box = selSubPart.includes('easy')?false:true;
								const selOption = (selType==='premade' && box)?'cargo' : 'basic';
								this.setState({rear:false, selOption });
							})
						})
					}}
				></StartTempComponent>
				<MapComponent
					pageKey={pageKey}
					lan={lan}
					tSize={tSize}
					labelOther={labelOther}
					selSubPart={selSubPart}
					callCanvasPage={(selBattery)=>this.setState({pageKey:'canvas', selBattery})}
				></MapComponent>
				<CanvasComponent
					pageKey={pageKey}
					lan={lan}
					wSize={wSize}
					tSize={tSize}
					proto={proto}
					selSubPart={selSubPart}
					selCol={selCol}
					selOption={selOption}
					selFront={selFront}
					selPower={selPower}
					selSimRear={selSimRear}
					selHeadlight={selHeadlight}
					rear={rear}
					brake={brake}
					strap={strap}
					logoImg={logoImg}
					logoCustom={logoCustom}
					logoControl={logoControl}
					callGetData={this.getOptionData}
					setLogoControl={logoControl=>this.setState({logoControl})}
					setLoading={(loading, loadPro)=>this.setState({loading, loadPro})}
					setLogoCustom={(logoCustom)=>this.setState({logoCustom})}
					openShareModal={()=>this.setState({modalShow:true})}
				></CanvasComponent>
				<SideComponent
					device={device}
					pageKey={pageKey}
					lan={lan}
					customArr={customArr}
					selectArr={selectArr}
					catArr={catArr}
					protoArr={protoArr}
					rear={rear}
					brake={brake}
					strap={strap}
					proto={proto}
					selCol={selCol}
					selType={selType}
					selFront={selFront}
					frontArr={frontArr}
					selPower={selPower}
					selOption={selOption}
					selSubPart={selSubPart}
					selBattery={selBattery}
					selSimRear={selSimRear}
					selHeadlight={selHeadlight}
					labelOther={labelOther}
					logoImg={logoImg}
					colArr={colArr}
					sizeArr={sizeArr}
					contArr={contArr}
					powerArr={powerArr}
					simRearArr={simRearArr}
					headlightArr={headlightArr}
					rearInfo={rearInfo}
					brakeInfo={brakeInfo}
					strapInfo={strapInfo}
					batteryInfo={batteryInfo}
					logoInfo={logoInfo}
					logoCustom={logoCustom}
					logoControl={logoControl}
					setRear={rear=>this.setState({rear})}
					setBrake={brake=>this.setState({brake})}
					setStrap={()=>this.setState({strap:!strap})}
					setSelCol={selCol=>this.setState({selCol})}
					setSelOption={selOption=>this.setState({selOption})}
					setSelFront={selFront=>this.setState({selFront}, () => {
						if (selFront === 'mini' || selFront === 'small') {
							this.setState({rear:false})
							if (selOption==='cargo') this.setState({selOption:'basic'})
						} else if (selFront==='xl') {
							this.setState({brake:false});
							if (selOption !== 'cargo' && selOption !== 'basic') this.setState({selOption:'basic'});
						}
					})}
					setLogoCustom={(e, key)=> {
						var newInfo = {...logoCustom};
						newInfo[key] = parseFloat(e.target.value);
						this.setState({logoCustom:newInfo});
					}}
					setLogoImg={(logoImg)=>this.setState({logoImg})}
					setLoading={(loadingLogo)=>this.setState({loadingLogo})}
					setSelPower={(selPower)=>this.setState({selPower})}
					setSimRear={selSimRear=>this.setState({selSimRear})}
					setHeadlight={(selHeadlight)=>this.setState({selHeadlight})}
					callMapPage={()=>this.setState({pageKey:'map'})}
				></SideComponent>
				{selSubPart &&
					<div className='set-item set-back' onClick={()=>{
							if (pageKey==='canvas') this.setState({pageKey:'map'});
							else if (pageKey==='map') this.setState({pageKey:'start', selSubPart:null});
						} }>
						<div className='circle'><img src={imgIconBack} alt=''></img></div>
					</div>
				}
				<ModalShareComponent
					tSize={tSize}
					modalShow={modalShow}
					proto={proto}
					selSubPart={selSubPart}
					selCol={selCol}
					selOption={selOption}
					selFront={selFront}
					selPower={selPower}
					selSimRear={selSimRear}
					selHeadlight={selHeadlight}
					rear={rear}
					brake={brake}
					strap={strap}
					logoImg={logoImg}
					logoCustom={logoCustom}
					logoControl={logoControl}
					closeModal={()=>this.setState({modalShow:false})}
					setLoading={(loadingLogo)=>this.setState({loadingLogo})}
				></ModalShareComponent>
				<LoadingComponent
					loading={loading}
					loadPro={loadPro}
				></LoadingComponent>
				<div className={`back-board flex loading-logo ${loadingLogo?'active':''}`}><div className='loading-circle grey'></div></div>
				<div className='top-shadow'></div>
				<LanguageComponent
					lan={lan}
					setLan={(lan)=>this.setState({lan})}
				></LanguageComponent>
			</div>
		);
	}
}
