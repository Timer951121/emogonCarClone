import React from 'react';
import jQuery from 'jquery';
import imgClose from '../assets/images/close.png';
import imgLabel0 from '../assets/images/logo-label-0-black.png';
import imgLabel1 from '../assets/images/logo-label-1-black.png';
import imgFacebook from '../assets/images/social/facebook.jpg';
import imgTwitter from '../assets/images/social/twitter.jpg';
import imgEmail from '../assets/images/social/email.jpg';
import imgLinkedin from '../assets/images/social/linkedin.jpg';
import imgTiktok from '../assets/images/social/tiktok.jpg';
import imgWhatsapp from '../assets/images/social/whatsapp.jpg';
import imgPinterest from '../assets/images/social/pinterest.jpg';
import imgInstagram from '../assets/images/social/instagram.jpg';
import imgLabel0White from '../assets/images/logo-label-0-white.png';
import imgLogoWhite from '../assets/images/logo-white.png';
// import imgTumblr from '../assets/images/social/tumblr.png';

import { serverUrl } from '../data/info';

const shareUrl = 'https://emogon.com/configurator', shareStrUrl = 'https%3A%2F%2Femogon.com%2Fconfigurator', shareImgUrl = 'https://emogon.com/configurator/share-img/easyOne_premade.jpg';

const socialArr = [
	{key:'facebook',img:imgFacebook,	url:'https://www.facebook.com/sharer/sharer.php?u='+shareUrl},
	{key:'instagram',img:imgInstagram, 	url:'https://www.instagram.com'}, // /tv/CiZJ-PbOUss/?utm_source=ig_web_copy_link    tv/CiZJ-PbOUss/?utm_source=ig_web_button_share_sheet
	{key:'twitter',	img:imgTwitter,		url:'https://twitter.com/intent/tweet?url='+shareUrl+'&text=Emogon%20configurator%20site'},
	{key:'pinterest',img:imgPinterest, 	url:'https://pinterest.com/pin/create/button/?url='+shareUrl+'&media=shareImgUrl&description=Emogon%20configurator%20site'},
	{key:'tiktok',  img:imgTiktok, 		url:'https://tiktok.com'},
	{key:'whatsapp',img:imgWhatsapp, 	url:'https://api.whatsapp.com/send?text='+shareStrUrl},
	{key:'linkedin',img:imgLinkedin, 	url:'https://www.linkedin.com/shareArticle?mini=true&url='+shareUrl},
	{key:'email',	img:imgEmail, 		url:'mailto:info@example.com?&subject=Share%20Emogon&cc=&bcc=&body='+shareUrl},
	// {key:'tumblr',img:imgTumblr,	 	url:'http://www.tumblr.com/share?v=3&u='+shareStrUrl+'&t=Share%20your%20Emogon%20with%20your%20Friends'},
]

export default class ModalShareComponent extends React.Component {
	constructor(props) {
		super(props);
		const {modalShow, tSize, proto, selSubPart, selCol, selOption, selFront, selPower, selSimRear, selHeadlight, rear, brake, strap} = props;
		this.state = {modalShow, tSize, proto, selSubPart, selCol, selOption, selFront, selPower, selSimRear, selHeadlight, rear, brake, strap};
	}

	componentDidMount() {
		// setTimeout(() => {
		// 	const stBtn = document.querySelector('.modal-content .st-btn:nth-of-type(2)');
		// 	console.log(stBtn);
		// 	const labelTag = document.createElement("label"); const labelStr = stBtn.getAttribute("data-network");
		// 	labelTag.appendChild(labelStr);
		// 	stBtn.appendChild(labelTag);
		// }, 5000);
	}

	componentWillReceiveProps(nextProps) {
		['modalShow', 'tSize', 'proto', 'selSubPart', 'selCol', 'selOption', 'selFront', 'selPower', 'selSimRear', 'selHeadlight', 'rear', 'brake', 'strap', 'logoImg', 'logoCustom', 'logoControl'].forEach(key => {
			if (this.state[key] !== nextProps[key]) {
				if (key==='modalShow') {
					const canvas = document.getElementsByTagName("canvas")[0];
					this.shareImage = canvas.toDataURL("image/jpg");
				}
				this.setState({[key]:nextProps[key]}, () => {
					if (key==='modalShow') {
					}
				});
			}
		});
	}

	changeStr = (e, key) => {
		if (key==='Link') return;
		const strVal = e.target.value, stateKey = 'str'+key;
		this.setState({[stateKey]:strVal});
	}

	sumbitEmail = () => {
		this.props.closeModal();
	}

	openSocial = (item) => {
		const {key, url} = item;
		const subArr = url.split(shareUrl), {proto, selSubPart, selCol, selOption, selFront, selPower, selSimRear, selHeadlight, rear, brake, strap} = this.state;
		// console.log(subArr);
		if (key==='pinterest') {
			this.props.setLoading(true);
			const canvas = document.getElementsByTagName("canvas")[0];
			const image = canvas.toDataURL("image/jpg");
			jQuery.ajax({ type: "POST", dataType: "json", url: serverUrl+'./uploadShareImg.php', data: {image: image},
				success: (data) => {
					this.props.setLoading(false);
					const reUrl = url.split('shareImgUrl').join(serverUrl+'share-img/'+data[0]+'.png');
					console.log(serverUrl+'share-img/'+data[0]+'.png');
					{window.open(reUrl, '_blank'); return;}
				}
			});
		} else 

		// if (subArr.length < 2)
		{window.open(url, '_blank'); return;}
		// console.log(url);
		// console.log(proto, selSubPart, selCol, selOption, selFront, selPower, selSimRear, selHeadlight, rear, brake, strap);
		const setUrl = '?proto='+proto+'&selSubPart='+selSubPart+'&selCol='+selCol+'&selOption='+selOption+'&selFront='+selFront+'&selPower='+selPower+'&selSimRear='+selSimRear+'&selHeadlight='+selHeadlight+'&rear='+rear+'&brake='+brake+'&strap='+strap;
		var newUrl = '';

		// window.open(url, '_blank');
	}

	render() {
		const {modalShow, tSize} = this.state;
		return (
			<div className={`modal-back flex ${modalShow?'active':''}`} style={{width:tSize.w, height:tSize.h, left:tSize.l}}>
				<div className={`modal-wrapper flex`}>
					<div className="modal-title">Share your Emogon with your Friends</div>
					<div className="modal-content flex">
						<div className='thumb-wrapper flex'>
							<img className='thumb-img' src={this.shareImage}></img>
							<label className='fix label'>my</label>
							<img className='fix logo-label-white' src={imgLabel0White}></img>
							<img className='fix logo-white' src={imgLogoWhite}></img>
						</div>
						<div className='link'>Link : {shareUrl}</div>
						<div className='social-wrapper flex'>
							{socialArr.map(item=>
								<div className='social-icon' key={item.key} onClick={()=>this.openSocial(item)}>
									<img src={item.img} alt=''></img>
								</div>
							)}
						</div>
						<div className='logo-wrapper flex'>
							<img className='label label-0' src={imgLabel0} alt=''></img>
							<img className='label label-1' src={imgLabel1} alt=''></img>
						</div>
					</div>
					<div className='close flex'>
						<img src={imgClose} alt='' onClick={()=> this.props.closeModal() }></img>
					</div>
				</div>
			</div>
	
		);
	}
}
