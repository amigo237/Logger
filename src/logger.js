(function( window ) {
	var console = window.console;

	var GraphLogger = {
		_div: null,
		_contentDiv: null,
		_timerID: null,
		_isSupportConsole: !!console,
		_contentWidth: 270,
		_contentHeight: 256,
		init: function() {
			var div = document.createElement("div");
			var body = document.body;
			this._contentWidth = Logger.config.GraphLoggerContentWidth > 0 ? Logger.config.GraphLoggerContentWidth : this._contentWidth;
			this._contentHeight = Logger.config.GraphLoggerContentHeight > 0 ? Logger.config.GraphLoggerContentHeight : this._contentHeight;
			var css = "#IEGraphLogger { border: 1px solid #000; left: 5px; bottom: 5px; overflow: hidden; font-size: 12px; z-index:9999; background-color:#fff }";
			css += "#IEGraphLogger_Content { overflow: auto; width: " + this._contentWidth + "px; height:" + this._contentHeight + "px; margin-left: 5px }";
			css += "p { margin: 0 0 0 8px }";
			div.id = "IEGraphLogger";
			if( this._isSupportConsole ){
				div.style.position = "fixed";
			}
			else{
				div.style.position = "absolute";
			}
			util.importStyle(css);
			body.appendChild(div);
			var arr = [];
			arr.push("<div style='margin:5px'>");
			arr.push("	<a id='IEGraphLogger_Clear' href='javascript:void(0)' style='text-decoration:none'>清空</a>");
			arr.push("	<a id='IEGraphLogger_hideOrShow' href='javascript:void(0)' style='text-decoration:none'>隐藏</a>");
			arr.push("</div>");
			arr.push("<div id = 'IEGraphLogger_Content'></div>");
			div.innerHTML = arr.join(" ");
			this._contentDiv = document.getElementById("IEGraphLogger_Content");
			this._div = div;
			var clear = document.getElementById("IEGraphLogger_Clear");
			var hideOrShow = document.getElementById("IEGraphLogger_hideOrShow");
			util.addEvent(clear, "click", util.bind( function() {
				this._contentDiv.innerHTML = "";
			}, this) );
							
			util.addEvent(hideOrShow, "click", util.bind( function(){
				var display = this._contentDiv.style.display;
				if( display == "none" ){
					this._contentDiv.style.display = "";
					hideOrShow.innerHTML = "隐藏";
				}
				else {
					this._contentDiv.style.display = "none";
					hideOrShow.innerHTML = "显示";
				}
				this._positionChange();
			}, this) );
							
			util.addEvent( window, "scroll", util.bind( this._positionChange, this ) );
			util.addEvent( window, "resize", util.bind( this._positionChange, this ) );
		},

		_positionChange: function() {
			if( this._div.style.position == "fixed" ){
				return;
			}
			if( this._timerID !== null ) {
				clearTimeout( this._timerID );
			}
			this._timerID = setTimeout( util.bind( function() {
				var scrollTop = util.scrollTop();
				var windowHeight = util.viewportHeight();
				this._div.style.top = scrollTop + windowHeight - ( this._div.offsetHeight + 10 ) + "px";
				clearTimeout( this._timerID );
			}, this ), 100 );
		},

		log: function( para, options ) {
			var str = "";
			options = options || {};
			var color = options.color || "#000";
			if( this._div === null ) {
				this.init();
			}
			var p = document.createElement("p");
			if( typeof para === "object" ) {
				str += "Object -> <br>";
				for(var i in para){
					str += i + " : " + para[i] + "<br>";
				}
			}
			else {
				str = para;
			}
			p.innerHTML = str;
			p.style.color = color;
			this._contentDiv.appendChild(p);
		},

		error: function( para ) {
			this.log( para, { color: "#F00" } )
		}
	};

	var Logger = new function() {
		this.isDebug = false;

		this.log = function() {
			if ( this.isDebug ) {
				var params = ( 1 == arguments.length ) ? arguments[0] : arguments;
				console && console.dir ? console.dir( params ) : GraphLogger.log( params );
			}
			return this;
		};

		this.error = function() {
			if ( this.isDebug ) {
				var params = ( 1 == arguments.length ) ? arguments[0] : arguments;
				console && console.error ? console.error( params ) : GraphLogger.error( params );
			}
			return this;
		};

		this.warning = function() {
			if ( this.isDebug ) {
				var params = ( 1 == arguments.length ) ? arguments[0] : arguments;
				console && console.warn ? console.warn( params ) : this.log( params );
			}
			return this;
		};

		this.startTime = function() {
			if ( this.isDebug && arguments[0] ) {
				console && console.time && console.time( arguments[0] );
			}
			return this;
		};

		this.stopTime = function() {
			if ( this.isDebug && arguments[0] ) {
				console && console.timeEnd && console.timeEnd( arguments[0] );
			}
			return this;
		};

		this.trace = function() {
			if ( this.isDebug ) {
				console && console.trace && console.trace();
			}
			return this;
		};
	};

	Logger.config = {
		GraphLoggerContentWidth: 270,
		GraphLoggerContentHeight: 256
	};

	var util = {
		importStyle: function( cssText ) {
			var head = document.head || document.getElementsByTagName('head')[0];
			var style = document.createElement( 'style' );
			style.setAttribute( "type", "text/css" );
			if( style.styleSheet ) { // IE
				style.styleSheet.cssText = cssText;
			} 
			else {
				style.appendChild( document.createTextNode( cssText ) );
			}
			head.appendChild( style );
		},

		addEvent: function(elem, type, func) {
			if(elem.attachEvent){
				elem.attachEvent("on" + type, func);
			}
			else if(elem.addEventListener){
				elem.addEventListener(type, func, false);
			}
		},
		
		removeEvent: function(elem, type, func) {
			if(elem.attachEvent){
				elem.detachEvent("on" + type, func);
			}
			else if(elem.removeEventListener){
				elem.removeEventListener(type, func);
			}
		},

		bind: function(func, context){
			if (Function.prototype.bind) {
				return func.bind(context);
			}
			else {
				return function(){
					return func.apply(context, Array.prototype.slice.call(arguments, 0));
				};
			}
		},

		scrollLeft: function( elem ) {
			return elem ? elem.scrollLeft : Math.max( window.pageXOffset || 0, document.body.scrollLeft, document.documentElement.scrollLeft );
		},

		scrollTop: function( elem ) {
			return elem ? elem.scrollTop : Math.max( window.pageYOffset || 0, document.body.scrollTop, document.documentElement.scrollTop );
		},

		viewportWidth: function(viewport) {
			var width = document.documentElement && document.documentElement.clientWidth;
			return viewport ? viewport.clientWidth : ( document.compatMode === "CSS1Compat" && width || document.body.clientWidth || width );
		},

		viewportHeight: function(viewport) {
			var height = document.documentElement && document.documentElement.clientHeight;
			return viewport ? viewport.clientHeight : ( document.compatMode === "CSS1Compat" && height || document.body.clientHeight || height );
		}
	};
	
	if(window.Logger) {
		throw new Error("Logger.js: Logger has been defined in other place");
	}
	else {
		window["Logger"] =  Logger;
	}
})( window );