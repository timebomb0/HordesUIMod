// Nicer impl to create elements in one method call
function makeElement(args) {
	const $node = document.createElement(args.element);
	if (args.class) $node.className = args.class;
	if (args.content) $node.innerHTML = args.content;
	if (args.src) $node.src = args.src;
	if (args.type) $node.type = args.type;
	if (args.placeholder) $node.placeholder = args.placeholder;
	return $node;
}

// Credit: David Walsh
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this,
			args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

// Credit: https://gist.github.com/jcxplorer/823878
// Generate random UUID string
function uuid() {
	var uuid = '',
		i,
		random;
	for (i = 0; i < 32; i++) {
		random = (Math.random() * 16) | 0;
		if (i == 8 || i == 12 || i == 16 || i == 20) {
			uuid += '-';
		}
		uuid += (i == 12 ? 4 : i == 16 ? (random & 3) | 8 : random).toString(16);
	}
	return uuid;
}

// Credit: http://voidcanvas.com/clone-an-object-in-vanilla-js-in-depth/
function deepClone(obj) {
	//in case of premitives
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}

	//date objects should be
	if (obj instanceof Date) {
		return new Date(obj.getTime());
	}

	//handle Array
	if (Array.isArray(obj)) {
		var clonedArr = [];
		obj.forEach(function(element) {
			clonedArr.push(deepClone(element));
		});
		return clonedArr;
	}

	//lastly, handle objects
	let clonedObj = new obj.constructor();
	for (var prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			clonedObj[prop] = deepClone(obj[prop]);
		}
	}
	return clonedObj;
}

export { makeElement, debounce, uuid, deepClone };
