import React from 'react';
import imgArrow from '../assets/images/start_arrow.png';
import { getTouchPos, GetLangLabel, serverUrl } from '../data/info';

export default class StartTempComponent extends React.Component {
	constructor(props) {
		super(props);
		const {pageKey, tSize, wSize, lan, labelOther, protoArr} = props;
		this.state = {pageKey, tSize, wSize, lan, labelOther, selIdx:0, selectArr:[], customArr:[], protoArr, numCustom:0, numPremade:0, numProto:0, disBackCustom:true, disNextCustom:false, disBackPremade:true, disNextPremade:false, disBackProto:true, disNextProto:false};
	}

	componentDidMount() {
		window.addEventListener('touchstart', (e) => {this.sPos = getTouchPos(e);});
		window.addEventListener('touchend', (e) => {this.ePos = getTouchPos(e); this.checkSlider()});
	}

	componentWillReceiveProps(nextProps) {
		['pageKey', 'selectArr', 'customArr', 'protoArr', 'tSize', 'wSize', 'lan', 'labelOther'].forEach(key => {
			if (this.state[key] !== nextProps[key]) {
				this.setState({[key]:nextProps[key]});
			}
		});
	}

	checkSlider = () => {
		if (!this.props.device) return;
		const {sPos, ePos} = this, {innerWidth, innerHeight} = window, {tSize} = this.state;
		const dPosX = Math.abs(ePos.x - sPos.x); 
		if (Math.abs(ePos.y - sPos.y) > dPosX || dPosX < 50) {return;}
		const axis = innerWidth > innerHeight ? 'x':'y';
		const deviceWidth = axis==='x'?tSize.w:(tSize.h-50), delta = axis==='x'?0:50;
		var typeKey;
		if 		(sPos[axis] < deviceWidth * 1 / 3 + delta) typeKey = 'custom';
		else if (sPos[axis] < deviceWidth * 2 / 3 + delta) typeKey = 'premade';
		else if (sPos[axis] < deviceWidth * 3 / 3 + delta) typeKey = 'proto';
		const dir = (ePos.x > sPos.x) ? -1: 1;
		this.clickArrow(typeKey, dir);
	}

	clickArrow = (typeKey, dir) => {
		const {disBackCustom, disNextCustom, disBackPremade, disNextPremade, disBackProto, disNextProto, numCustom, numPremade, numProto} = this.state;
		if (typeKey==='custom') {
			if ((dir===-1 && disBackCustom) || (dir===1 && disNextCustom)) return;
			const nextNum = numCustom+dir;
			this.setState({numCustom:nextNum}, () => {
				this.setState({disBackCustom:nextNum===0, disNextCustom:nextNum===2})
			});
		} else if (typeKey==='premade'){
			if ((dir===-1 && disBackPremade) || (dir===1 && disNextPremade)) return;
			const nextNum = numPremade+dir;
			this.setState({numPremade:nextNum}, () => {
				this.setState({disBackPremade:nextNum===0, disNextPremade:nextNum===4})
			});
		} else if (typeKey==='proto'){
			if ((dir===-1 && disBackProto) || (dir===1 && disNextProto)) return;
			const nextNum = numProto+dir;
			this.setState({numProto:nextNum}, () => {
				this.setState({disBackProto:nextNum===0, disNextProto:nextNum===3})
			});
		}
	}

	getLeft = (typeKey) => {
		const {numCustom, numPremade, numProto} = this.state;
		if 		(typeKey==='custom') return numCustom;
		else if (typeKey==='premade') return numPremade;
		else if (typeKey==='proto') return numProto;
	}

	render() {
		const {pageKey, lan, selectArr, customArr, protoArr, disBackCustom, disNextCustom, disBackPremade, disNextPremade, disBackProto, disNextProto, tSize, wSize, labelOther} = this.state;
		var wImgCustom = 120, wImgPremade = 230, leftC = 0, arrowT = 0;
		if (wSize.scale==='small') {wImgCustom = 90; wImgPremade = 210;}
		const {device} = this.props, wPart = device === 'iPad'?302:210, deltaLeft = device==='iPad'?162:115;
		if (device) {
			if (window.innerWidth < window.innerHeight) {
				const hPart = (tSize.h-50)/3 -36;
				wImgCustom = (hPart - 70)/3.35;
				wImgPremade = (hPart - 70) * 1.5;
				leftC = tSize.w/2- deltaLeft;// 138;
				arrowT = hPart/2-20;
				// console.log(wImgCustom, wImgPremade, leftC, arrowT)
			} else {
				const hPart = (tSize.h-50) -36, hImgPremade = device==='iPad'?320: Math.min(hPart - 70, 192);
				wImgCustom = device==='iPad'?100:(hPart - 70)/3.35;
				arrowT = hPart/2-20;
				leftC = tSize.w/6-deltaLeft;
				wImgPremade = hImgPremade * 230/270;
			}
		}
		return (
			<div className={`back-board flex start-temp ${pageKey==='start'?'active':''}`}>
				<div className='main-title'>{GetLangLabel(labelOther.chooseModel, lan)}</div>
				<div className='content'>
					{[{key:'custom', arr:customArr},{key:'premade', arr:selectArr}, {key:'proto', arr:protoArr}].map((typeItem, typeIdx) =>
						<div className={`type-line ${typeItem.key}-line`} key={typeIdx}>
							<div className='type-title'>{!this.props.device && typeItem.key==='proto'?
								<div>
									<div>{GetLangLabel(labelOther.specialVehicles, lan)}</div>
									<div> & {GetLangLabel(labelOther.prototypes, lan)}</div>
								</div>: GetLangLabel(labelOther[typeItem.key], lan)}</div>
							<div className='content-wrapper' style={{left:leftC}}>
								<div className='type-content flex' style={{left:this.getLeft(typeItem.key) *-wPart}}> {/* 270 */}
									{typeItem.arr.map((item, idx) =>
										<div className='part-item' key={idx}>
											<div className='part-img flex'>
												<img src={serverUrl+'images/'+item.img+'.jpg'} onClick={() => {
													if (typeItem.key==='proto') {
														const bottomKey = item.key.includes('space')?'spaceXl':'easyTwo';
														this.props.callMapPage('custom', bottomKey, item.key);
													} else {
														var selectKey = item.key;
														if 		(item.key==='swb') selectKey='easyOne';
														else if (item.key==='mwb') selectKey='easyTwo';
														else if (item.key==='lwb') selectKey='spaceXl';
														this.props.callMapPage(typeItem.key, selectKey, false);
													}
												} } style={{width:typeItem.key==='custom'?wImgCustom:wImgPremade}} alt=''></img>
											</div>
											<div className='part-text flex'>
												<div className='part-title'>
													<label className='main-label'>{GetLangLabel(item, lan)}</label>
													<label className='sub-label'> - {GetLangLabel(item, lan, 'small')}</label>
												</div>
												<div className='part-price'>ab EUR {item.price} inkl. MWSt</div>
											</div>
										</div>
									) }
								</div>
							</div>
							{this.props.device && <img className={`select-arrow arrow-back
								${typeItem.key==='proto' && disBackProto?'disable':''}
								${typeItem.key==='custom' && disBackCustom?'disable':''}
								${typeItem.key==='premade' && disBackPremade?'disable':''} `}
								onClick={()=>this.clickArrow(typeItem.key, -1)}
								src={imgArrow} alt='' style={{top:arrowT}}></img> }
							{this.props.device && <img className={`select-arrow arrow-next
								${typeItem.key==='proto' && disNextProto?'disable':''}
								${typeItem.key==='custom' && disNextCustom?'disable':''}
								${typeItem.key==='premade' && disNextPremade?'disable':''} `}
								onClick={()=>this.clickArrow(typeItem.key, 1)}
								src={imgArrow} alt='' style={{top:arrowT}}></img> }
						</div>
					)}
				</div>
			</div>
		);
	}
}
