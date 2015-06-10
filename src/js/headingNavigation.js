/* ========================================================================
* Copyright (c) <2013> eBay Software Foundation

* All rights reserved.

* Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

* Neither the name of eBay or any of its subsidiaries or affiliates nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
* ======================================================================== */

(function (appConfig) {
	"use strict";
	var SkipTo = {};

	SkipTo.prototype = {
		headingElementsArr:  [],
		landmarkElementsArr:  [],
		idElementsArr:  [],
		numberOfFrames: 0,
		dropdownHTML: null,
		config: {
			buttonLabel:    'Skip To...',
			menuLabel:      'Skip To and Page Outline',
			landmarksLabel: 'Skip To',
			headingsLabel:  'Page Outline',
			main:      'main, [role="main"]',
			landmarks: '[role="navigation"], [role="search"]',
			sections:  'nav',
			headings:  'h1, h2, h3',
			ids:       '#SkipToA1, #SkipToA2',
			accessKey: '0',
			wrap: "false",
			visibility: "onFocus",
			customClass: "",
			attachElement: document.body,
			borderType: "momentary"
		},
		
		setUpConfig: function (appConfig) {
			var localConfig = this.config,
				name,

				appConfigSettings = typeof appConfig.settings !== 'undefined' ? appConfig.settings.skipTo : {};
				
			for (name in appConfigSettings) {
				//overwrite values of our local config, based on the external config
				if (localConfig.hasOwnProperty(name)) {
					localConfig[name] = appConfigSettings[name];
				}
			}
		},

		init: function (appConfig) {

			this.setUpConfig(appConfig);
			var div,
			htmlStr = '',
			attachElement = (!this.config.attachElement.nodeType) ? document.querySelector(this.config.attachElement) : this.config.attachElement;
			// if already initted then remove the original
			if (!document.getElementById('skipToMenu')){
				div = document.createElement('div');
				div.setAttribute('id', 'skipToMenu');
				div.setAttribute('role', 'complementary');
				div.setAttribute('title', 'Skip To Keyboard Navigation');
				this.addStyles("@@cssContent");
				this.dropdownHTML = '<a accesskey="'+ this.config.accessKey +'" tabindex="1" data-wrap="'+ this.config.wrap +'"class="dropMenu-toggle skipTo '+ this.config.visibility + ' '+ this.config.customClass +'" id="drop4" role="button" aria-haspopup="true" ';
				this.dropdownHTML += 'aria-expanded="false" data-toggle="dropMenu" href="#" data-target="menu1">' + this.config.buttonLabel + '<b class="caret"></b></a>';
			}
			else {
				div = document.getElementById('skipToMenu');
			}
			htmlStr = this.getdropdownHTML();
			{
				div.className = "dropMenu";
				if (!document.getElementById('skipToMenu')){
					attachElement.insertBefore(div, attachElement.firstChild);
				}
				div.innerHTML = this.dropdownHTML;
				this.addListeners();
			}
			var toggle = document.getElementsByClassName('dropMenu-toggle'),
				toggleBtn,
				element,
				k,
				l,
				menu,
				menulist,
				items,
				i,
				j,
				self=this,
				item;
				
			for (k = 0, l = toggle.length; k < l; k = k + 1) {
				toggleBtn = toggle[k];
				{
					

					toggleBtn.addEventListener('click', function(e) {
						htmlStr = '';
						self.getFrames();
						/*self.getLandMarks(self.config.main);
						self.getLandMarks(self.config.landmarks);
						self.getSections(self.config.sections);

						self.getIdElements();*/

						self.getHeadings();

						htmlStr = self.getdropdownHTML();
						menulist = document.getElementById('menu1');
						if (!menulist){
							menulist = document.createElement('ul');
							menulist.setAttribute('class','dropMenu-menu');
							menulist.setAttribute('id','menu1');
							menulist.setAttribute('role','menu');
							menulist.setAttribute('aria-label',' '+ self.config.menuLabel + ' ' );
							menulist.setAttribute('style','top:3%; text-align:left');
							toggleBtn.parentElement.appendChild(menulist);
						}
						menulist.innerHTML = htmlStr;
						menu = document.getElementById(toggleBtn.getAttribute('data-target'));
					
						if (menu) {
							items = menu.getElementsByTagName("a");
							for (i = 0, j = items.length; i < j; i = i + 1) {
								item = items[i];
								item.addEventListener('keydown', function(e) {
									self.navigateMenus(e);
								});

								item.addEventListener('click', function(e) {
									this.targetFrame = e.target.getAttribute('data-frame');
									this.targetId = e.target.getAttribute('data-id');
									if (this.targetFrame === ''){
										element = document.getElementById(this.targetId).focus();
									}
									else
									{
										element = window.frames[this.targetFrame-1].document.getElementById(this.targetId).focus();
									}
									e.preventDefault();
									e.stopPropagation();
								});
							
								item.addEventListener('blur', function(e) {
									self.clearMenus(e);
								});
							}
						}
						self.toggleOptList(e);
					});
					toggleBtn.addEventListener('keydown', function(e){
						var keyCode = e.keyCode || e.which;
						if(keyCode === 32){						//SpaceBar should open the menu
							this.click(e);
							e.preventDefault();
						}
					});

				}
			}
		},

		isHidden: function (e) {
			if (e.offsetWidth === 0 && e.offsetHeight === 0 && e.offsetTop === 0 && e.offsetLeft === 0)
			{
				return true;
			}
			else {
				if (e.height === '0px' && e.overflow === 'hidden' && e.position === 'absolute')
					return true;
				return false;
			}
		},
		
		normalizeName: function (name) {
			return name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		},

		getTextContent: function (elem) {
			
			function getText(e, strings) {
				// If text node get the text and return
				if( e.nodeType === 3 ) {
					strings.push(e.data);
				} else {
					// if an element for through all the children elements looking for text
					if( e.nodeType === 1 ) {
					// check to see if IMG or AREA element and to use ALT content if defined
						var tagName = e.tagName.toLowerCase();
						if((tagName === 'img') || (tagName === 'area')) {
							if (e.alt) {
								strings.push(e.alt);
							}
						} else {
							var c = e.firstChild;
							while (c) {
								getText(c, strings);
								c = c.nextSibling;
							} // end loop
						}
					}
				}
			} // end function getStrings

			// Create return object
			var str = "Test",
			strings = [];
			getText(elem, strings);
			if (strings.length) str = strings.join(" ");
			if (str.length > 30) str = str.substring(0,27) + "...";
			return str;
		},

		getAccessibleName: function (elem) {
			var labelledbyIds = elem.getAttribute('aria-labelledby'),
			label = elem.getAttribute('aria-label'),
			title = elem.getAttribute('title'),
			name = "";
			
			if (labelledbyIds && labelledbyIds.length) {
				var str,
				strings = [],
				ids = labelledbyIds.split(' ');
				if (!ids.length) ids = [labelledbyIds];
				for (var i = 0, l = ids.length; i < l; i += 1) {
					var e = document.getElementById(ids[i]);
					if (e) str = this.getTextContent(e);
					if (str.length) strings.push(str);
				}
				name = strings.join(" ");
			}
			else {
				if (label && label.length) {
					name = label;
				}
				else {
					if (title && title.length) {
						name = title;
					}
				}
			}
			return name;
		},
		getFrames: function () {
			var myframes = window.frames;
			this.numberOfFrames = myframes.length;
			//add load handlers to iFrames
			//for (var f = 1, g = this.numberOfFrames; f <= g; f = f + 1){
				//var iframeElement= myframes[f-1];
				//iframeElement.addEventListener("load",function () {
				//	SkipTo.prototype.init(appConfig);
				//},false);
			//}
		},
		
		canAccessIFrame: function(iframe) {
			var html = null;
			try {
			// deal with older browsers
				var doc = iframe.contentDocument || iframe.contentWindow.document;
				html = doc.body.innerHTML;
			} catch(err){
			// do nothing
			}

			return(html !== null);
		},
		findCorrectTabindex: function (e) {
			var navigableItems = e.ownerDocument.querySelectorAll('input, button, select, textarea, a[href], [tabindex], '+this.config.headings),
				i,
				j,
				k,
				l,
				previousTabindex;
			for (i = 0, j= navigableItems.length; i < j; i = i + 1) {
				if (e === navigableItems[i]){
					if (previousTabindex){
						return previousTabindex;
					}
					else {
						for (k = i + 1, l=navigableItems.length; k < l; k = k + 1) {
							if (['H1','H2','H3','H4','H5','H6'].indexOf(navigableItems[k].tagName) === -1 ){
								if (navigableItems[k].hasAttribute('tabindex')){
									return navigableItems[k].getAttribute('tabindex');
								}
								else {
									return '0';
								}
							}
						}
					}
				}
				if (navigableItems[i].hasAttribute('tabindex')){
					previousTabindex = navigableItems[i].getAttribute('tabindex');
				}
				else
				{
					previousTabindex = '0';
				}
			}
		},
		getHeadings: function () {
			var targets = this.config.headings;
			if (typeof targets !== 'string' || targets.length === 0) return;
			var headings = document.querySelectorAll(targets),
				f,
				g,
				i,
				j,
				heading,
				id;
			this.headingElementsArr = {};
			for (i = 0, j = headings.length; i < j; i = i + 1) {
				heading = headings[i];
				if (!this.isHidden(heading)){
					id = heading.getAttribute('id') || heading.innerHTML.replace(/\s+/g, '_').toLowerCase().replace(/[&\/\\#,+()$~%.'"!:*?<>{}¹]/g, '') + '_' + i;
					heading.tabIndex = this.findCorrectTabindex(heading);
					heading.setAttribute('id', id);
					this.headingElementsArr[id] = {id: id, name: heading.tagName.toLowerCase() + ": " + this.getTextContent(heading),   frame: ''};
				}
			}
			for (f = 1, g = this.numberOfFrames; f <= g; f = f + 1){
				//if (this.canAccessIFrame(frames[f-1])){
				headings = window.frames[f-1].document.querySelectorAll(targets);
				for (i = 0, j = headings.length; i < j; i = i + 1) {
					heading = headings[i];
					if (!this.isHidden(heading)){
						id = heading.getAttribute('id') || heading.innerHTML.replace(/\s+/g, '_').toLowerCase().replace(/[&\/\\#,+()$~%.'"!:*?<>{}¹]/g, '') + '_' + i;
						heading.tabIndex = this.findCorrectTabindex(heading);
						heading.setAttribute('id', id);
						this.headingElementsArr[id] = {id: id, name: heading.tagName.toLowerCase() + ": " + this.getTextContent(heading),frame: f};
					}
				}
				//}
			}
		},

/*		getSections: function (targets) {
			if (typeof targets !== 'string' || targets.length === 0) return;
			var sections = document.querySelectorAll(targets),
				k,
				l,
				section,
				id1,
				role,
				val,
				name;

			for (k = 0, l = sections.length; k < l; k = k + 1) {
				section = sections[k];
				id1 = section.getAttribute('id') || 'ui-skip-' + Math.floor((Math.random() * 100) + 1);
				section.tabIndex = "-1";
				section.setAttribute('id', id1);
				role = section.tagName.toLowerCase();
				val = this.normalizeName(role);

				name = this.getAccessibleName(section);

				if (name && name.length) {
					val += ": " + name;
				}
				else {
					if (role === 'main') {
						val += ' Content';
					}
				}

				this.landmarkElementsArr[id1] = val;
			}
		},


		getLandMarks: function (targets) {
			if (typeof targets !== 'string' || targets.length === 0) return;
			var landmarks = document.querySelectorAll(targets),
				k,
				l,
				landmark,
				id1,
				role,
				name,
				val;

			for (k = 0, l = landmarks.length; k < l; k = k + 1) {
				landmark = landmarks[k];
				id1 = landmark.getAttribute('id') || 'ui-skip-' + Math.floor((Math.random() * 100) + 1);
				landmark.tabIndex = "-1";
				landmark.setAttribute('id', id1);
				role = landmark.getAttribute('role');
				name = this.getAccessibleName(landmark);

				if (role === 'banner') {
					role = 'header';
				} // banner landmark is the same as header element in HTML5

				if (role === 'contentinfo') {
					role = 'footer';
				} //contentinfo landmark is the same as footer element in HTML5

				if (role === 'navigation') {
					role = 'nav';
				} // navigation landmark is the same as nav element in HTML5

				val = this.normalizeName(role);

				if (name && name.length) {
					val += ": " + name;
				}
				else {
					if (role === 'main') {
						val += ' Content';
					}
				}
				this.landmarkElementsArr[id1] = val;
			}
		},

		getIdElements: function () {
			var els = document.querySelectorAll(this.config.ids),
				i,
				j,
				el,
				id,
				val;

			for (i = 0, j = els.length; i < j; i = i + 1) {
				el = els[i];
				id = el.getAttribute('id');
				val = el.innerHTML.replace(/<\/?[^>]+>/gi, '').replace(/\s+/g, ' ').trim();

				if (val.length > 30)	val = val.replace(val, val.substr(0, 30)	+	'...');
				this.idElementsArr[id] = "id: " + val;
			}
		},*/

		getdropdownHTML: function(){
			var key,
				val,
				htmlStr = '',
				headingSep = true,
				headingClass = '';

			// window.console.log(this.elementsArr);

		/*	for (key in this.landmarkElementsArr) {
				if (landmarkSep) {
					htmlStr += '<li role="separator" style="list-style:none outside none">' + this.config.landmarksLabel + '</li>';
					landmarkSep = false;
				}
				val = this.landmarkElementsArr[key];
				htmlStr += '<li role="presentation" style="list-style:none outside none"><a tabindex="-1" role="menuitem" href="#';
				htmlStr += key + '">' + val;
				htmlStr += '</a></li>';
			}

			for (key in this.idElementsArr) {
				if (landmarkSep) {
					htmlStr += '<li role="separator" style="list-style:none outside none">' + this.config.landmarksLabel + '</li>';
					landmarkSep = false;
				}
				val = this.idElementsArr[key];
				htmlStr += '<li role="presentation" style="list-style:none outside none"><a tabindex="-1" role="menuitem" href="#';
				htmlStr += key + '">' + val;
				htmlStr += '</a></li>';
			}*/

			for (key in this.headingElementsArr) {
				if (this.headingElementsArr[key].name){
					if (headingSep) {
						htmlStr += '<li role="separator" style="list-style:none outside none">' + this.config.headingsLabel + '</li>';
						headingSep = false;
					}
					val = this.headingElementsArr[key].name;
					
					headingClass = val.substring(0,2);
					htmlStr += '<li role="presentation" style="list-style:none outside none"><a class="po-' + headingClass + '" tabindex="-1" role="menuitem" href="#';
					htmlStr += key + '" data-frame="'+this.headingElementsArr[key].frame+'" data-id="'+this.headingElementsArr[key].id+'">' + val;
					htmlStr += '</a></li>';
				}
			}

			return htmlStr;
		},

		addStyles: function (cssString) {
			var ss1 = document.createElement('style'),
				hh1 = document.getElementsByTagName('head')[0],
				tt1;

			ss1.setAttribute("type", "text/css");
			hh1.appendChild(ss1);

			if (ss1.styleSheet) {
				// IE
				ss1.styleSheet.cssText = cssString;
			} else {
				tt1 = document.createTextNode(cssString);
				ss1.appendChild(tt1);
			}
		},


		addListeners: function () {
			window.addEventListener("hashchange", function () {
				var element = document.getElementById(location.hash.substring(1));
				if (element) {
					if (!/^(?:a|select|input|button|textarea)$/i.test(element.tagName)) {
						element.tabIndex = -1;
					}
					element.focus();
				}
			}, false);
		},
		
		clearMenus: function () {
			var self = this;
			setTimeout(function () {
				var isActive = self.prt.classList.contains('open');
				if ((!isActive) || (self.prt.contains(document.activeElement))) {
					return;
				}
				self.prt.classList.remove('open');
				self.btn.setAttribute('aria-expanded', 'false');
			}, 150);
		},

		toggleOptList: function (e) {
			this.btn = e.target;
			this.prt = this.btn.parentNode;
			this.menu = document.getElementById(this.btn.getAttribute('data-target'));

			if(typeof this.btn.getAttribute('data-wrap') !== 'undefined') {
				this.wrap = this.btn.getAttribute('data-wrap');
			}
			this.prt.classList.toggle('open');
			//Set Aria-expanded to true only if the class open exists in dropMenu div
			if (this.prt.classList.contains('open')) {
				this.btn.setAttribute('aria-expanded', 'true');
			} else {
				this.btn.setAttribute('aria-expanded', 'false');
			}
			try {
				this.menu.getElementsByTagName('a')[0].focus();
			}
			catch(err){
			}
		},

		navigateMenus: function (e) {
			var keyCode = e.keyCode || e.which,
				arrow = {
					spacebar: 32,
					up: 38,
					esc: 27,
					down: 40
				},
				isActive = this.prt.classList.contains('open'),
				items = this.menu.getElementsByTagName("a"),
				index = Array.prototype.indexOf.call(items, e.target);
	

			if (!/(32|38|40|27)/.test(keyCode)) {
				return;
			}
			e.preventDefault();

			switch (keyCode) {
			case arrow.down:
				index = index + 1;
				break;
			case arrow.up:
				index = index - 1;
				break;
			case arrow.esc:
				if (isActive) {
					this.btn.click();
					this.btn.focus();
					return;
				}
				break;
			}
			if (index < 0) {
				if(this.wrap === 'true'){
					index = items.length - 1;
				}else{
					index=0;
				}
			}
			if (index === items.length) {
				if(this.wrap === 'true'){
					index = 0;
				}else{
					index = items.length -1;
				}
			}

			items.item(index).focus();
		}


		
		
	};

	SkipTo.prototype.init(appConfig);

}(window.Drupal || window.Wordpress || window.SkipToConfig || {}));
