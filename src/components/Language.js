import React from 'react';
import imgLanBack from '../assets/images/language-back.png';
import imgFlagGerman from '../assets/images/flag-german.png';
import imgFlagEngland from '../assets/images/flag-england.png';

const lanArr = [{key:'de', img:imgFlagGerman}, {key:'en', img:imgFlagEngland}];

export default class LanguageComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {lan:props.lan, showList:false};
	}

	componentDidMount() {
	}

	componentWillReceiveProps(nextProps) {
		if (this.state.lan !== nextProps.lan) {
			this.setState({lan:nextProps.lan, showList:false});
		}
	}

	render() {
		const {lan, showList} = this.state, selLanItem = lanArr.find(item=>item.key===lan);
		return (
			<div className='set-lang flex'>
				<img className='sel-lan-flag' onClick={() => this.setState({showList:!showList})} src={selLanItem.img} alt=''></img>
				<div className='flag-out-wrapper'>
					<div className={`flag-list ${showList?'active':''}`}>
						<img className='list-back' alt='' src={imgLanBack}></img>
						<div className='flag-list-wrapper flex'>
							{lanArr.map(item => 
								<img className={`lang-item`} onClick={() => {this.props.setLan(item.key);}} src={item.img} alt='' key={item.key}></img>
							)}
						</div>
					</div>
				</div>
			</div>
		);
	}
}
