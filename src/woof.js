const generate = require('babel-generator').default
const {app, createAST} = require('./app')

require('./actions')  // require actions so bus actions are loaded globally

var initalValue = "" 
initalValue += "new Circle()"                               + "\n" 


app.ast = createAST(initalValue)

function tryRunningCode() {
  var code
  try {
    code = generate(app.ast).code

    try {
      document.getElementById('preview').contentWindow.addEventListener("error", function(error) {
        app.error = error
      });
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.text = code
      document.getElementById('preview').contentDocument.body.appendChild(script)
    }
    catch (e) {
      app.error = e;
    }
  }
  catch (e) {
    app.error = e
  }
}

function runCode() {
    var iframe = document.getElementById('preview');
    
    iframe.src = ""; // first, we clear the preview iframe
    setTimeout(function() {
        // add a base tag to the page so it knows where to pull relative image urls
        var base = iframe.contentWindow.document.createElement("base");
        base.href = document.baseURI
        iframe.contentWindow.document.body.appendChild(base);
      
        // then we create a script tag with the woof code and add it to the page
        var script = iframe.contentWindow.document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://cdn.rawgit.com/stevekrouse/WoofJS/9071f93/dist/woof.js";
        iframe.contentWindow.document.body.appendChild(script);
        
        script.onload = function() {
            // when the woof.js library loads, run the user's code
            var evt = document.createEvent('Event');  
            evt.initEvent('load', false, false);  
            iframe.contentWindow.dispatchEvent(evt);
            tryRunningCode();
        }
    }, 10)
}

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};
// helper function to prevent runCode from running too often
var debouncedRunCode = debounce(runCode, 1000, false)
debouncedRunCode()

app.$watch('ast', function() {
  debouncedRunCode()
}, {deep: true})