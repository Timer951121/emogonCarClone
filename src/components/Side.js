import React from 'react';
import { serverUrl, GetLangLabel } from '../data/info';
import imgChevron from '../assets/images/chevron.jpg';
import { transTime } from '../data/info';

export default class SideComponent extends React.Component {
	constructor(props) {
		super(props);
		const {device, pageKey, lan, rear, brake, strap, frontArr, selType, logoCustom, powerArr, simRearArr, rearInfo, brakeInfo, strapInfo, batteryInfo, logoInfo, selBattery, labelOther} = props;
		const tab = !device || device === 'iPad', openTab = {color:true, front:tab, option:tab, rear:tab, brake:tab, strap:tab, logo:tab, power:tab, battery:tab, simRear:tab, headlight:tab};
		this.state = {pageKey, lan, selFront:{}, selCol:{}, selOption:{}, rear, brake, strap, frontArr, selType, selSubPart:{}, sizeArr:[], colArr:[], contArr:[], optionArr:[], customArr:[], selectArr:[], catArr:[], protoArr:[], powerArr, simRearArr, headlightArr:[], rearInfo, brakeInfo, strapInfo, batteryInfo, selBattery, labelOther, logoInfo, openTab, priceTotal:0, logoCustom};
	}

	componentDidMount() {
	}

	componentWillReceiveProps(nextProps) {
		['lan', 'pageKey', 'rear', 'brake', 'strap', 'frontArr', 'colArr', 'sizeArr', 'contArr', 'powerArr', 'simRearArr', 'headlightArr', 'selPower', 'rearInfo', 'brakeInfo', 'strapInfo', 'batteryInfo', 'selBattery', 'logoInfo', 'selectArr', 'customArr', 'catArr', 'logoImg', 'logoCustom', 'logoControl', 'selType', 'proto', 'protoArr', 'labelOther', 'selSimRear', 'selHeadlight', 'strap'].forEach(key => { 
			if (this.state[key] !== nextProps[key]) {
				this.setState({[key]:nextProps[key]}, () => {
					this.setTotalPrice();
				});
			}
		});
		const {colArr, selCol, contArr, selSubPart, selectArr, sizeArr, selFront, optionArr, selOption} = this.state;
		if (colArr.length && selCol && selCol.hex !== nextProps.selCol) {
			this.setState({selCol:this.getColArr().find(item=>item.hex===nextProps.selCol)}, () => this.setTotalPrice());
		}
		if (contArr.length && selSubPart.key !== nextProps.selSubPart) {
			const selSubPart = nextProps.selSubPart?selectArr.find(item=>item.key===nextProps.selSubPart):{};
			this.setOptionArr(nextProps.selSubPart, selFront.key);
			this.setState({selSubPart}, () => this.setTotalPrice()); // optionArr, 
		}
		if (sizeArr.length && nextProps.selFront && selFront.key !== nextProps.selFront) {
			const newFront = nextProps.selFront;
			const brakeHide = newFront && newFront.includes('xl');
			const rearHideF = newFront === 'mini' || newFront === 'small' ;
			this.setOptionArr(selSubPart.key, nextProps.selFront);
			this.setState({selFront:sizeArr.find(item=>item.key===nextProps.selFront), brakeHide, rearHideF}, () => this.setTotalPrice());
		}
		if (nextProps.selOption && selOption.key !== nextProps.selOption) { // optionArr.length && 
			const rearHideO = (nextProps.selOption !== 'passenger' && nextProps.selOption !== 'basic');
			const inputLogo = document.getElementById('logoFile'); inputLogo.value = null;
			const newOption = optionArr.length?optionArr.find(item=>item.key===nextProps.selOption):{};
			this.setState({selOption:newOption, rearHideO, logoFile:null}, () => this.setTotalPrice());
		}
	}

	setOptionArr = (selSubPartKey, selFrontKey) => {
		const {contArr} = this.state;
		var optionArr = contArr.filter(item=>{return item.inArr.includes(selFrontKey)});
		if (selSubPartKey==='easyOne') optionArr = [];
		else if (selSubPartKey==='spaceXl') optionArr = contArr.filter(item=>{return ['basic', 'pickUp', 'cargo'].includes(item.key)});
		this.setState({optionArr}, () => {this.setTotalPrice();})
	}

	setOpenTab = (key) => {
		var {openTab} = this.state;
		openTab[key] = !openTab[key];
		this.setState(openTab);
	}

	setTotalPrice = () => {
		const {selSubPart, selCol, selFront, selOption, rearInfo, brakeInfo, logoInfo, rear, brake, rearHideO, rearHideF, brakeHide, logoImg, proto, protoArr, selHeadlight, headlightArr, simRearArr, selSimRear, strapInfo, strap} = this.state;
		var priceTotal = 0;
		if (proto) {
			const selProto = protoArr.find(item=>item.key===proto); priceTotal += parseFloat(selProto.price);
			if (proto==='simplex') {
				if (selHeadlight) {
					const headlightItem = headlightArr.find(item=>item.key===selHeadlight);
					priceTotal += parseFloat(headlightItem.price);
				}
				if (selSimRear) {
					const simRearItem = simRearArr.find(item=>item.key===selSimRear);
					priceTotal += parseFloat(simRearItem.price);
				}
				if (strap) {
					priceTotal += parseFloat(strapInfo.price);
				}
			}
		} else if (selSubPart) priceTotal += parseFloat(selSubPart.price);
		if (selCol)		priceTotal += parseFloat(selCol.price, 10);
		if (selFront)	priceTotal += parseFloat(selFront.price, 10);
		if (selOption && selOption.price) priceTotal += parseFloat(selOption.price, 10);
		if (rearInfo && rear && !rearHideO && !rearHideF) priceTotal += parseFloat(rearInfo.price, 10);
		if (brakeInfo && brake && !brakeHide) priceTotal += parseFloat(brakeInfo.price, 10);
		if (logoInfo && logoImg) priceTotal += parseFloat(logoInfo.price, 10);
		priceTotal = Math.round(priceTotal);
		var rePrice = priceTotal.toString().split("").reverse().join(""), reNormalStr = '';
		for (let i = 0; i < rePrice.length; i++) {
			if (i%3===0 && i!==0) reNormalStr += ','; reNormalStr += rePrice[i];
		}
		this.setState({priceTotal:reNormalStr.split("").reverse().join("")});
	}

	uploadLogoFile = () => {
		const {logoFile} = this.state;
		if (!logoFile) return;
		this.props.setLoading(true);
		const formData = new FormData();
		formData.append("file", logoFile);
		var xhttp = new XMLHttpRequest();
		xhttp.open("POST", serverUrl+'./uploadLogoImg.php', true);
		xhttp.onreadystatechange = () => {
			if (this.readyState === 4 && this.status === 200) {
				const res = this.responseText;
				if(res){
					this.props.setLogoImg(res);
				}
				this.props.setLoading(false);
			}
		};
		xhttp.send(formData);
	}

	scrollSideBottom = () => {
		if (!this.state.tooltipInner) return;
		const sideScroll = document.getElementById('sideScroll');
		sideScroll.scroll({ top: sideScroll.scrollHeight, behavior: "smooth"});
	}

	showTooltip = (e, key) => {
		if (!e || !key) {
			this.setState({tooltipInner:false});
			setTimeout(() => { this.setState({tooltip:null}) }, 500);
		} else {
			this.setState({tooltip:{top:e.pageY-30, key}});
			setTimeout(() => { this.setState({tooltipInner:true}) }, 10);
			setTimeout(() => { this.setState({tooltipInner:null}) }, 8000);
			setTimeout(() => { this.setState({tooltip:null}) }, 8500);
		}
	}
	getColArr = () => {
		const {colArr, proto} = this.state, newArr = [];
		if (!proto) {return colArr;}
		colArr.forEach(item => {
			if (item.key==='yellow') {
				newArr.push( {description: "#222222 20%, #444444 49.9%, #222222 50%", id: "3", label: "Lightning Black", label_de:'Blitzschwarz', name:'yellow', key: "yellow", part: "color", piece: "222222", price: "234", str: "#222222", hex:0x080808});
			} else newArr.push(item);
		});
		return newArr;
	}
	getPrice = (selKey, arrKey) => {
		const selItem = this.state[arrKey].find(item=>item.key===this.state[selKey]);
		return selItem?selItem.price:0;
	}

	getModelLabel = () => {
		const {selSubPart, lan, selType, customArr, selectArr, proto, protoArr} = this.state;
		if (!selSubPart) return '';
		if (proto) {
			const selItem = protoArr.find(item=>item.key===proto);
			return selItem?selItem.label:'';
		} else if (selType==='custom') {
			if 		(selSubPart.key==='easyOne') return 'SWB';
			else if	(selSubPart.key==='easyTwo') return 'MWB';
			else if	(selSubPart.key==='spaceXl') return 'LWB';
		} else {
			return GetLangLabel(selSubPart, lan)
		}
	}

	render() {
		const { lan, selFront, selCol, rear, brake, sizeArr, powerArr, simRearArr, headlightArr, selPower, rearInfo, brakeInfo, strapInfo, batteryInfo, selBattery, selOption, optionArr, openTab, priceTotal, selSubPart, rearHideO, rearHideF, brakeHide, catArr, logoFile, logoInfo, logoImg, logoCustom, logoControl, tooltip, tooltipInner, proto, labelOther, selSimRear, selHeadlight, strap} = this.state;
		return (
			<div className={`side`}>
				<div className='side-outer side-header'>
					<div className='outer-line header-top'><label>EMOGON</label><label className='right'>{GetLangLabel(labelOther.firstEdition, lan)}</label></div>
					<div className='outer-line header-bottom'>{this.getModelLabel()}</div><div className='outer-price'>{priceTotal} EUR</div>
				</div>
				<div className='side-wrapper scroll scroll-y' id='sideScroll'>
					<div className={`part color-part ${openTab.color?'open':''} ${proto==='preme_space'?'hide':''}`}>
						<div className='part-title' onClick={()=>this.setOpenTab('color')}><img src={imgChevron} alt=''></img><label>{GetLangLabel(catArr[0], lan)}</label></div>
						<div className='part-content'>
							<div className='color-wrapper flex'>
								{this.getColArr().map((item, idx) =>
									<div className={`color-item ${selCol&&item.hex===selCol.hex?'active':''}`} style={{backgroundImage:'linear-gradient('+item.description+')'}}
										onClick={()=>{
											if (this.timeTrans || selCol===item.hex) return;
											this.timeTrans = true;
											this.props.setSelCol(item.hex);
											setTimeout(() => { this.timeTrans = false; }, transTime);
										}}
										key={idx}>
									</div>
								) }
							</div>
							<div className='price-line'><label className='left'>{GetLangLabel(selCol, lan) }</label> <label className='right'>{selCol?selCol.price:0} EUR</label></div>
						</div>
					</div>
					<div className={`part front-part ${openTab.front?'open':''} ${proto?'hide':''}`}>
						<div className='part-title' onClick={()=>this.setOpenTab('front')}><img src={imgChevron} alt=''></img><label>{GetLangLabel(catArr[1], lan)}</label></div>
						<div className='part-content'>
							{sizeArr.map((item, idx) =>
								<div className={`option-item ${selFront.key===item.key?'active':''}
									${selSubPart && selSubPart.key==='easyOne'&&item.key==='xl'?'disable':''} 
									${selSubPart && selSubPart.key==='spaceXl'&&item.key==='regular'?'disable':''} `}
									onClick={() => {
										// if (!frontArr.includes(item.key)) return;
										this.props.setSelFront(item.key);
									}} key={idx}>
									<div className='option-img'><img src={serverUrl+'images/'+item.img+'.jpg'} alt=''></img></div>
									<div className='option-label'>
										<div className='sub-title'>{GetLangLabel(item, lan)}</div>
										<div className='label'>{GetLangLabel(item, lan, 'small')}</div>
										<div className='price'>{item.price} EUR</div>
									</div>
								</div>
							) }
							<div className='price-line'><label className='right'>{selFront.price} EUR</label></div>
						</div>
					</div>
					{optionArr.length > 0 &&
						<div className={`part option-part ${openTab.option?'open':''} ${proto?'hide':''}`}>
							<div className='part-title' onClick={()=>this.setOpenTab('option')}><img src={imgChevron} alt=''></img><label>{GetLangLabel(catArr[2], lan)}</label></div>
							<div className='part-content'>
								{optionArr.map((item, idx) =>
									<div className={`option-item ${selOption.key===item.key?'active':''}`} onClick={(e) => {
										this.props.setRear(false);
										if (item.key==='cargo' && selFront.key !== 'regular' && selFront.key !== 'xl') {
											if (selSubPart.key==='spaceXl') this.props.setSelFront('xl');
											else this.props.setSelFront('regular');
										}
										if (item.key==='cargo') this.showTooltip(e, 'cargo');
										else this.showTooltip();
										setTimeout(() => { this.props.setSelOption(item.key); }, 0);
									}} key={idx}>
										<div className='option-img'><img src={serverUrl+'images/'+item.img+'.jpg'} alt=''></img></div>
										<div className='option-label'>
											<div className='sub-title'>{(selFront.key==='xl'||selSubPart.key==='spaceXl')&&item.label==='Cargo'?GetLangLabel(labelOther.space, lan):GetLangLabel(item, lan)}</div>
											<div className='label'>{GetLangLabel(item, lan, 'small')}</div>
											<div className='price'>{item.price} EUR</div>
										</div>
									</div>
								) }
								<div className='price-line'><label className='right'>{selOption.price} EUR</label></div>
							</div>
						</div>
					}
					<div className={`part rear-part ${rearHideO?'hide':''} ${rearHideF?'hide':''} ${openTab.rear?'open':''} ${proto?'hide':''}`}>
						<div className='part-title' onClick={()=>this.setOpenTab('rear')}><img src={imgChevron} alt=''></img><label>{GetLangLabel(catArr[3], lan)}</label></div>
						<div className='part-content'>
							<div className={`option-item ${rear?'active':''}`} onClick={() => { this.props.setRear(!rear); }}>
								<div className='option-img'><img src={serverUrl+'images/'+rearInfo.img+'.jpg'} alt=''></img></div>
								<div className='option-label'>
									<div className='sub-title'>{GetLangLabel(rearInfo, lan)}</div>
									<div className='label'>{GetLangLabel(rearInfo, lan, 'small')}</div>
									{/* <div className='price'>{rearInfo.price} EUR</div> */}
								</div>
							</div>
							<div className='price-line'><label className='right'>{rearInfo.price} EUR</label></div>
						</div>
					</div>
					{proto==='simplex' &&
						<div className={`part simRear-part ${openTab.simRear?'open':''}`}>
							<div className='part-title' onClick={()=>this.setOpenTab('simRear')}><img src={imgChevron} alt=''></img><label>{GetLangLabel(catArr[3], lan)}</label></div>
							<div className='part-content'>
								{simRearArr.map(item=>
									<div className={`option-item ${selSimRear===item.key?'active':''}`} onClick={(e) => { this.props.setSimRear(item.key); }} key={item.key}>
										<div className='option-img'><img src={serverUrl+'images/'+item.img+'.jpg'} alt=''></img></div>
										<div className='option-label'>
											<div className='sub-title'>{GetLangLabel(item, lan)}</div>
											<div className='label'>{GetLangLabel(item, lan, 'small')}</div>
											<div className='price'>{item.price} EUR</div>
										</div>
									</div>
								)}
								<div className='price-line'><label className='right'>{this.getPrice('selSimRear', 'simRearArr')} EUR</label></div>
							</div>
						</div>
					}
					{proto==='simplex' &&
						<div className={`part simHead-part ${openTab.headlight?'open':''}`}>
							<div className='part-title' onClick={()=>this.setOpenTab('headlight')}><img src={imgChevron} alt=''></img><label>{GetLangLabel(catArr[8], lan)}</label></div>
							<div className='part-content'>
								{headlightArr.map(item=>
									<div className={`option-item ${selHeadlight===item.key?'active':''}`} onClick={(e) => { this.props.setHeadlight(item.key); }} key={item.key}>
										<div className='option-img'><img src={serverUrl+'images/'+item.img+'.jpg'} alt=''></img></div>
										<div className='option-label'>
											<div className='sub-title'>{GetLangLabel(item, lan)}</div>
											<div className='label'>{GetLangLabel(item, lan, 'small')}</div>
											<div className='price'>{item.price} EUR</div>
										</div>
									</div>
								)}
								<div className='price-line'><label className='right'>{this.getPrice('selHeadlight', 'headlightArr')} EUR</label></div>
							</div>
						</div>
					}
					{proto==='simplex' &&
						<div className={`part brake-part ${openTab.strap?'open':''}`}>
							<div className='part-title' onClick={()=>this.setOpenTab('strap')}><img src={imgChevron} alt=''></img><label>{GetLangLabel(catArr[9], lan)}</label></div>
							<div className='part-content'>
								<div className={`option-item ${strap?'active':''}`} onClick={(e) => { this.props.setStrap(); }}>
									<div className='option-img'><img src={serverUrl+'images/'+strapInfo.img+'.jpg'} alt=''></img></div>
									<div className='option-label'>
										<div className='sub-title'>{GetLangLabel(strapInfo, lan)}</div>
										<div className='label'>{GetLangLabel(strapInfo, lan, 'small')}</div>
										<div className='price'>{strapInfo.price} EUR</div>
									</div>
								</div>
								<div className='price-line'><label className='right'>{this.getPrice('selHeadlight', 'headlightArr')} EUR</label></div>
							</div>
						</div>
					}
					<div className={`part brake-part  ${brakeHide?'hide':''} ${openTab.brake?'open':''} ${proto?'hide':''}`}>
						<div className='part-title' onClick={()=>this.setOpenTab('brake')}><img src={imgChevron} alt=''></img><label>{GetLangLabel(catArr[4], lan)}</label></div>
						<div className='part-content'>
							<div className={`option-item ${brake?'active':''}`} onClick={() => { this.props.setBrake(!brake); }}>
								<div className='option-img'><img src={serverUrl+'images/'+brakeInfo.img+'.jpg'} alt=''></img></div>
								<div className='option-label'>
									<div className='sub-title'>{GetLangLabel(brakeInfo, lan)}</div>
									<div className='label'>{GetLangLabel(brakeInfo, lan, 'small')}</div>
									{/* <div className='price'>{brakeInfo.price} EUR</div> */}
								</div>
							</div>
							<div className='price-line'><label className='right'>{brakeInfo.price} EUR</label></div>
						</div>
					</div>
					<div className={`part battery-part  ${openTab.battery?'open':''}`}>
						<div className='part-title' onClick={()=>this.setOpenTab('battery')}><img src={imgChevron} alt=''></img><label>{GetLangLabel(catArr[7], lan)}</label></div>
						<div className='part-content'>
							<div className={`option-item active`} >
								<div className='option-img'><img src={serverUrl+'images/'+batteryInfo.img+'.jpg'} alt=''></img></div>
								<div className='option-label'>
									<div className='sub-title'>{selBattery.key+1} x Batteries selected</div>
									<div className='label' onClick={()=>this.props.callMapPage()}>{selBattery.distance} KM range / 150W Power Click here to change your range.</div>
								</div>
							</div>
							<div className='price-line'><label className='right'>{selBattery.price} EUR</label></div>
						</div>
					</div>
					<div className={`part logo-part ${selOption.key==='cargo'?'':'hide'} ${openTab.logo?'open':''} ${proto?'hide':''}`}>
						<div className='part-title' onClick={()=>this.setOpenTab('logo')}><img src={imgChevron} alt=''></img><label>{GetLangLabel(catArr[5], lan)}</label></div>
						<div className='part-content'>
							<div className={`option-item`}>
								<div className='option-img'><img src={serverUrl+'images/'+logoInfo.img+'.jpg'} alt=''></img></div>
								<div className='option-label'>
									<input type="file" name="file" id="logoFile" accept="image/png, image/jpeg" onChange={() => {
										const logoFile = document.getElementById("logoFile").files[0];
										if (logoFile.type !== 'image/png' && logoFile.type !== 'image/jpeg') window.alert('Please select png file type!');
										else if (logoFile.size > 5029549) window.alert('File size too big! should be small than 5 M.');
										else this.setState({logoFile});
									} } onClick={(e)=>{this.showTooltip(e, 'logo');}}></input>
									<div className={`button ${logoFile?'':'disable'}`} onClick={this.uploadLogoFile} >Upload</div>
								</div>
							</div>
							<div className='option-item logo-custom-option'>
								<div className='custom-part'>
									<div className='custom-title'>Size</div>
									<div className='custom-content'>
										<div className='custom-line'><label>Width</label><input type='range' min={1} max={10} step={0.5} value={logoCustom.w} onChange={(e)=>this.props.setLogoCustom(e, 'w')}></input></div>
										<div className='custom-line'><label>Height</label><input type='range' min={1} max={15} step={0.5} value={logoCustom.h} onChange={(e)=>this.props.setLogoCustom(e, 'h')}></input></div>
									</div>
								</div>
								<div className='custom-part'>
									<div className='custom-title'>Position</div>
									<div className='custom-content'>
										<div className='custom-line'><label>top</label><input type='range' min={0.3} max={1.9} step={0.02} value={logoCustom.t} onChange={(e)=>this.props.setLogoCustom(e, 't')}></input></div>
										<div className='custom-line'><label>Left</label><input type='range' min={1.4} max={2.3} step={0.02} value={logoCustom.l} onChange={(e)=>this.props.setLogoCustom(e, 'l')}></input></div>
									</div>
								</div>
								<div className={`disable-mask ${!logoImg?'active':''}`}></div>
							</div>
							<div className='price-line'><label className='right'>{logoInfo.price} EUR</label></div>
							{logoControl && <div className='logo-option-over'></div> }
						</div>
					</div>
					<div className={`part power-part ${openTab.power?'open':''}`}>
							<div className='part-title' onClick={()=>this.setOpenTab('power')}><img src={imgChevron} alt=''></img><label>{GetLangLabel(catArr[6], lan)}</label></div>
							<div className='part-content'>
								{powerArr.map((item, idx) =>
									<div className={`option-item ${selPower===item.key?'active':''}`} onClick={(e) => {
										if (selPower===item.key) this.props.setSelPower(); else this.props.setSelPower(item.key);
									}} key={idx}>
										<div className='option-img'><img src={serverUrl+'images/'+item.img+'.jpg'} alt=''></img></div>
										<div className='option-label'>
											<div className='sub-title'>{GetLangLabel(item, lan)}</div>
											<div className='label'>{GetLangLabel(item, lan, 'small')}</div>
											<div className='price'>{item.price} EUR</div>
										</div>
									</div>
								) }
								<div className='price-line'><label className='right'>{selOption.price} EUR</label></div>
							</div>
						</div>
				</div>
				{/* <div className='side-gap'></div> */}
				<div className='side-outer side-footer flex'>
					<div className='outer-line flex' onClick={() => {
						// window.parent.postMessage({ message: "shopPage", value: 'open' }, "*"); // https://development79249.editorx.io/my-site
						window.open('https://development79249.editorx.io/my-site/product-page/emogon-preorder', '_self')
					}}>
						{GetLangLabel(labelOther.cart, lan)} +
						{/* <label className='right'>{priceTotal} EUR</label> */}
					</div>
				</div>
				{tooltip &&
					<div className={`tooltip ${tooltipInner?'active':''}`} id='tooltip' style={{top:tooltip.top+'px'}}>
						{tooltip.key==='cargo' &&
							<div>
								<div className='label'>{GetLangLabel(labelOther.toolTipCargoTop, lan)}</div>
								<div className='label mt-10'>{GetLangLabel(labelOther.toolTipCargoScroll)} <label className='bold' onClick={()=>this.scrollSideBottom()}> {GetLangLabel(labelOther.here, lan)}</label>.</div>
							</div>
							
						}
						{tooltip.key==='logo' &&
							<div>
								<div className='title'>{GetLangLabel(labelOther.tip, lan)}:</div>
								<div className='label mt-10'> {GetLangLabel(labelOther.tooltipTip, lan)}</div>
							</div>
						}
					</div>
				}
				
			</div>
		);
	}
}
