const t = require('babel-types')
const generate = require('babel-generator').default
const traverse = require("babel-traverse").default
const babylon = require("babylon")

const Vue = require('vue').default

// require all components for the side-effect of adding them to Vue
// also grab the bus
const bus = require('./components').bus

const initalValue = "sprite.move(10)\nsprite.hide()\nconsole.log('hi')"

// keyboard shortcuts
var mac = CodeMirror.keyMap["default"] == CodeMirror.keyMap.macDefault;
var ctrl = mac ? "Cmd-" : "Ctrl-";
var keymap = {}
keymap.Tab = function(cm) {
  var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
  cm.replaceSelection(spaces, "end", "+input");
}
var editor = CodeMirror(document.getElementById('editor'), {
    mode:  "javascript",
    value: initalValue,
    lineNumbers: true,
    theme: "eclipse",
    tabSize: 2,
    indentUnit: 2,
    indentWithTabs: false,
    electricChars: true,
    keyMap: "sublime",
    autoCloseBrackets: true,
    matchBrackets: true,
    autofocus: true,
    smartIndent: true,
    foldGutter: true,
    gutters: ["CodeMirror-lint-markers", "CodeMirror-foldgutter"],
    extraKeys: keymap,
    lint: {
      delay: 800, 
      options: {
        "esversion": 6,
        "esnext": true,
        "asi": true
      }
    },
});
editor.on("change", function(){
  if (changing) { return false }
  else {
    try {
      changing = true
      setTimeout(() => changing = false, 100)
      app.ast = createAST(editor.getValue())
    } catch (e) {
      
    }
  }
});

bus.$on('click-node', function (selection) {
  app.selection = selection
})
bus.$on('edit-node', function (selection) {
  traverse(app.ast, {
    Program(path) {
      var node = path.get(selection.fullPath).node
      Object.keys(selection.updates).forEach(function(attr) {
        node[attr] = selection.updates[attr]
      })
    }
  })
})

function createAST(codeString) {
  const ast = babylon.parse(codeString);
  traverse(ast, {
    enter(path) {
      if (path.key !== "program") {
        var parentPath = path.parentPath.key == "program" ? "" : path.parentPath.node.fullPath + "."
        if (path.inList) {
          path.node.fullPath = parentPath + path.listKey + "." + path.key
        } else {
          path.node.fullPath = parentPath + path.key
        }
      } 
    }
  })
  return ast
}

var app = new Vue({
  el: '#app',
  data: {
    ast: createAST(editor.getValue()),
    selection: {
      fullPath: "body.0",
      virtualPath: null
    }
  }, 
  render: function(h) {
    return h(
      "div",
      {
        style: {
          userSelect: 'none',
          cursor: 'pointer'
        }
      },
      [
        h(this.ast.type, {props: {node: this.ast, selection: this.selection}}),
        //h('Editor', {props: {node: this.ast, selection: this.selection}})
      ]
    )
  }
})

var changing = false
app.$watch('ast', function() {
  if (changing) { return false }
  else {
    changing = true
    setTimeout(() => changing = false, 100)
    editor.setValue(generate(app.ast).code)
  }
}, {deep: true})