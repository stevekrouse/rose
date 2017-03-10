const t = require('babel-types')
const generate = require('babel-generator').default
const traverse = require("babel-traverse").default
const babylon = require("babylon")

const Vue = require('vue').default

// require all components for the side-effect of adding them to Vue
// also grab the bus
const bus = require('./components').bus

var initalValue = "" 
initalValue += "sprite.move(10)" + "\n"  
initalValue += "sprite.hide()"  + "\n" 
initalValue += "console.log('hi')" + "\n"
initalValue += "console.log([1,'hi', 2, [4, 5]])" + "\n"
initalValue += "console.log(() => 1)"

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

bus.$on("Add an input to the right", function(selection) {
  traverse(app.ast, {
    Program(path) {
      const selectedPath = path.get(selection.fullPath)
      var node = selectedPath.node
      var newArgument = t.nullLiteral()
      selectedPath.parentPath.node.arguments.splice(selectedPath.key + 1, 0, newArgument)
      annotatePaths(app.ast)
      app.selection = {fullPath: newArgument.fullPath}
    }
  })
})

bus.$on("Add an input to the left", function(selection) {
  traverse(app.ast, {
    Program(path) {
      const selectedPath = path.get(selection.fullPath)
      var node = selectedPath.node
      var newArgument = t.nullLiteral()
      selectedPath.parentPath.node.arguments.splice(selectedPath.key, 0, newArgument)
      annotatePaths(app.ast)
    }
  })
})

bus.$on("Delete this input", function(selection) {
  bus.$emit('remove-node', selection)
})

bus.$on("Add an input", function(selection) {
  traverse(app.ast, {
    Program(path) {
      const selectedPath = path.get(selection.fullPath)
      const node = selectedPath.node
      var newArgument = t.nullLiteral()
      node.arguments.push(newArgument)
      if (selectedPath.isCallExpression()){
        // if we're adding a parameter at the top level, annoate its path and go to it
        annotatePaths(app.ast)
        app.selection = {fullPath: newArgument.fullPath}
      }
    }
  })
})

bus.$on('remove-node', function (selection) {
  traverse(app.ast, {
    Program(path) {
      const selectedPath = path.get(selection.fullPath)
      
      if (selectedPath.parentPath.isExpressionStatement()) {
        // if you want to remove something who's parent is an expression statement, might as well just remove the expression statement
        selectedPath.parentPath.remove()
        annotatePaths(app.ast)
      }
      else if (selectedPath.isCallExpression() && !selection.virtualPath) {
        selectedPath.remove()
        annotatePaths(app.ast)
      } 
      else if (selectedPath.parentPath.isCallExpression() && selectedPath.key == "callee") {
        // do nothing because you can't delete callee
      } 
      else if (selectedPath.isCallExpression() && selection.virtualPath == "PARAMETERS") {
        // potentially you can't delete parameters can get back a callee because you'd never want this...
        selectedPath.replaceWith(selectedPath.node.callee)
        annotatePaths(app.ast)
      } 
      else if (selectedPath.parentPath.isCallExpression() && selectedPath.listKey == "arguments") {
        const selectedPathKey = selectedPath.key
        
        // delete a parameter 
        selectedPath.remove()
        annotatePaths(app.ast)

        if (!path.get(selection.fullPath)) {
          // if the current path no longer exists...
          if (selectedPathKey !== 0 && selectedPath.parentPath.node.arguments.length === selectedPathKey) {
            // if it was the furthest right parameter, go the the next furthest right parameter
            app.selection = {fullPath: selectedPath.getSibling(selectedPathKey - 1).node.fullPath}
          } else {
            // if you deleted the only parameter, the selection should go to the parameters themseleves
            app.selection = {fullPath: selectedPath.parentPath.node.fullPath, virtualPath: "PARAMETERS"}
          }
        }
      } 
      else {
        debugger
        console.log('can I be deleted?')
      }
      
    }
  })
})

function annotatePaths(ast) {
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
}

function createAST(codeString) {
  const ast = babylon.parse(codeString);
  annotatePaths(ast)
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
        h('Editor', {props: {node: this.ast, selection: this.selection}})
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