const t = require('babel-types')
const traverse = require("babel-traverse").default
const babylon = require("babylon")

const Vue = require('vue').default

require('./components')  // require components so vue components are loaded globally

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
    ast: createAST("consol.log('hi')"),
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

export {app, annotatePaths, createAST}