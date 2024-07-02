import React from 'react';
import imgBodyLarge from '../assets/images/map/body-large.png';
import imgBodyMiddle from '../assets/images/map/body-middle.png';
import imgBodySmall from '../assets/images/map/body-small.png';
import imgMapBack from '../assets/images/map/map-back.jpg';
import imgPowerBlue from '../assets/images/map/power-blue.png';
import imgPowerBlack from '../assets/images/map/power-black.png';
import imgMapCar from '../assets/images/map/map-car.png';
import { GetLangLabel } from '../data/info';

const rangeArr = [
	{key:0, distance:25, price:120},
	{key:1, distance:50, price:200},
	{key:2, distance:75, price:280},
	{key:3, distance:100, price:360},
];

export default class MapComponent extends React.Component {
	constructor(props) {
		super(props);
		const {pageKey, tSize, labelOther} = props;
		this.state = {pageKey, lan:props.lan, tSize, powerArr:[[1, 0]], imgBody:imgBodyLarge, selPower:0, labelOther };
	}

	componentDidMount() {
	}

	componentWillReceiveProps(nextProps) {
		['pageKey', 'lan', 'tSize', 'selSubPart', 'labelOther'].forEach(key => {
			if (this.state[key] !== nextProps[key]) {
				this.setState({[key]:nextProps[key]}, () => {
					if (key==='selSubPart') this.setBody();
				});
			}
		});
	}

	setBody = () => {
		const {selSubPart} = this.state;
		var imgBody, powerArr = [[]];
		if 		(!selSubPart) return
		else if (selSubPart==='easyOne') {imgBody=imgBodySmall;	 powerArr=[[1, 0]];}
		else if (selSubPart==='easyTwo') {imgBody=imgBodyMiddle; powerArr=[[1, 0], [0, 0]];}
		else if (selSubPart==='carGolion'){imgBody=imgBodyMiddle;powerArr=[[1, 0], [0, 0]];}
		else if (selSubPart==='space') 	 {imgBody=imgBodyMiddle; powerArr=[[1, 0], [0, 0]];}
		else if (selSubPart==='spaceXl') {imgBody=imgBodyLarge;  powerArr=[[1, 0], [0, 0]];}
		this.setState({imgBody, powerArr, selPower:this.getPower(powerArr)});
	}

	getPower = (powerArr) => {
		var powerCount = 0;
		powerArr.forEach(arr => {
			arr.forEach(item => { powerCount+=item; });
		});
		return powerCount-1;
	}

	setPower = (arrIdx, itemIdx) => {
		const {powerArr} = this.state; var newArr = powerArr.length===2?[[], []]:[[]];
		for (let i = 0; i < newArr.length; i++) {
			for (let j = 0; j < 2; j++) {
				var item = 0;
				if (i<arrIdx) item = 1;
				else if (i===arrIdx && j <= itemIdx) item = 1;
				else item = 0;
				newArr[i][j] = item;
			}
		}
		this.setState({powerArr:newArr, selPower:this.getPower(newArr)});
	}

	render() {
		const {pageKey, lan, powerArr, imgBody, selPower, labelOther} = this.state;
		const outerArr = powerArr.length===1?[0, 1]:[0, 1, 2, 3];
		return (
			<div className={`back-board flex map ${pageKey==='map'?'active':''}`}>
				<div className='map-side text-side flex'>
					<div className='main-title'>{GetLangLabel(labelOther.chooseRange, lan)}</div>
					<div className='body-wrapper flex'>
						<img className='main-body' src={imgBody} alt=''></img>
						<div className={`power-wrapper flex row${powerArr.length}`}>
							{powerArr.map((arr, arrIdx)=>
								<div className='power-row flex' key={arrIdx}>
									{arr.map((item, itemIdx)=>
										<div className={`power-item flex `} onClick={()=>this.setPower(arrIdx, itemIdx)} key={itemIdx}>
											<img className={`${item?'active':''}`} src={item===1?imgPowerBlue:imgPowerBlack} alt=''></img>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
					<div className='labels flex'>
						<label className='distance'>{rangeArr[selPower].distance} KM</label>
						<label className='price'>+ € {rangeArr[selPower].price}</label>
					</div>
					<div className='continue' onClick={()=> this.props.callCanvasPage(rangeArr[selPower])}>{GetLangLabel(labelOther.continue, lan)}</div>
				</div>
				<div className='map-side car-side' style={{backgroundImage:`url('${imgMapBack}')`}}>
					<div className='wrapper pulse-wrapper'>
						<div className={`range pulse range${selPower}`}>
							<div className='pulse-inner'></div>
						</div>
					</div>
					{outerArr.map( num => 
						<div className={`wrapper range-wrapper ${selPower>=num?'hide':''}`} key={num}>
							<div className={`range range${num} dash`}></div>
						</div>
					)}
					<div className='wrapper range-wrapper'>
						<div className={`range range${selPower}`}></div>
					</div>
					<div className='wrapper car-wrapper flex'>
						<img className='car' src={imgMapCar} alt=''></img>
					</div>
				</div>
			</div>
		);
	}
}
