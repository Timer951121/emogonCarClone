import React from 'react';
import imgLogo from '../assets/images/logo.png';
// import imgLogo from '../assets/images/logo-top.png';
import imgLabel0 from '../assets/images/logo-label-0-black.png';
import imgLabel1 from '../assets/images/logo-label-1-black.png';

const radius = 158, stroke = 35, normalRadius = radius - stroke * 2, circumference = normalRadius * 2 * Math.PI;

export default class LoadingComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {loading: true, loadPro:0, loadInner:true, loadEnd:false };
	}

	componentDidMount() {
		// for (let i = 0; i <= 100; i+=20) {
		// 	setTimeout(() => {
		// 		this.setState({loadPro:i});
		// 	}, i * 100);
		// }
	}

	componentWillReceiveProps(nextProps) {
		if (!nextProps.loading && this.state.loadInner) {
			this.setState({loadInner:false});
			setTimeout(() => { this.setState({loading:false}) }, 500);
		}
		if (this.state.loadPro !== nextProps.loadPro) {
			this.setState({loadPro:nextProps.loadPro});
			if (nextProps.loadPro===100) setTimeout(() => { this.setState({loadEnd:true}) }, 100);
		}
	}

	render() {
		const {loading, loadPro, loadInner, loadEnd} = this.state;
		// const strokeDashoffset = circumference - loadPro / 100 * circumference * 0.7;
		return (
			<div className={`back-board flex loading loading-start ${loading?'active':''} ${loadInner?'':'trans'} `}>
				<div className='loading-wrapper flex'>
					<div className='loading-icon flex'>
						<img src={imgLogo} alt=''></img>
						<div className='center-pro' id='centerPro' style={{height:`${180 * (100 - loadPro)/100}px`}}></div>
						{/* <svg className={`circlePro`} height={radius * 2} width={radius * 2}>
							<circle className='side-circle start-circle' r={ stroke/2 } cx={ 246 } cy={ radius } />
							<circle className={`side-circle end-circle ${loadEnd?'active':''}`} r={ stroke/2 } cx={ 131 } cy={ 75 } />
							<circle className={`main-circle ${(loadPro > 0)?"active":""}`} strokeWidth={ stroke } strokeDasharray={ circumference + ' ' + circumference } style={ { strokeDashoffset } } r={ normalRadius } cx={ radius } cy={ radius } />
						</svg> */}
					</div>
					<img className='label label-0' src={imgLabel0} alt=''></img>
					<img className='label label-1' src={imgLabel1} alt=''></img>
				</div>
			</div>
		);
	}
}
