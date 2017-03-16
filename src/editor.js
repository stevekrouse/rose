const Vue = require('vue').default
const {bus, spacer} = require('./components')
const traverse = require("babel-traverse").default

Vue.component('EditorOption', {
  render: function(h) {
    const self = this
    const children = []
    
    children.push(self.text)
    
    if (self.initialName) {
      children.push(",")
      children.push(spacer(h))
      children.push('"')
      children.push(h(
        "input", 
        {
          style: {
            width: (self.name.length * .55) + "em",
            border: "none",
            outline: "none",
            backgroundColor: "transparent",
            textAlign: "center"
          },
          domProps: {
            value: self.name,
          }
        }
      ))
      children.push('"')
    }
    
    return h(
      "li", 
      {
        class: { 'list-group-item': true},
        on: {
          input: function(event) {
            self.name = event.target.value
          },
          click: function(event) {
            if (event.target.tagName === "LI") {
              bus.$emit(self.text, {selection: self.selection, name: self.name})
            }
          } 
        }
      },
      children
    )
  },
  data: function() {
    return {name: this.initialName}
  },
  props: {
    initialName: String,
    text: String,
    selection: Object
  }
})

function getMenuItems(h, context, ast) {
  const items = []
  traverse(ast, {
    Program(path) {
      const selection = context.props.selection

      const selectedPath = path.get(selection.fullPath)
      const node = selectedPath.node
      
      if (selection.virtualPath == "LINE-BELOW") {
        items.push(h('EditorOption', {props: {selection: selection, text: "Call function", initialName: "function1"}}))
        items.push(h('EditorOption', {props: {selection: selection, text: "If then"}}))
        items.push(h('EditorOption', {props: {selection: selection, text: "Create new object", initialName: "Object"}}))
        items.push(h('EditorOption', {props: {selection: selection, text: "Set variable", initialName: "variable1"}}))
        items.push(h('EditorOption', {props: {selection: selection, text: "Create variable", initialName: "variable1"}}))
        items.push(h('EditorOption', {props: {selection: selection, text: "Create function", initialName: "function1"}}))
        items.push(h('EditorOption', {props: {selection: selection, text: "Return"}}))
      } else {
        if (selectedPath.isBooleanLiteral()) {
          items.push(h('EditorOption', {props: {selection: selection, text: "Change to " + !selectedPath.node.value}}))
        }
        if (selectedPath.isCallExpression() || selectedPath.isFunctionExpression() || selectedPath.isArrowFunctionExpression() || selectedPath.isFunctionDeclaration()) {
          items.push(h('EditorOption', {props: {selection: selection, text: "Add input", initialName: "input1"}}))
        }
        if (selectedPath.isCallExpression() || selectedPath.isNewExpression()) {
          items.push(h('EditorOption', {props: {selection: selection, text: "Add input"}}))
        }
        if (selectedPath.isNullLiteral()) {
          items.push(h('EditorOption', {props: {selection: selection, text: "Create variable", initialName: "variable1"}}))
          items.push(h('EditorOption', {props: {selection: selection, text: "Change to true "}}))
          items.push(h('EditorOption', {props: {selection: selection, text: "Change to false "}}))
          items.push(h('EditorOption', {props: {selection: selection, text: "Change to array"}}))
          items.push(h('EditorOption', {props: {selection: selection, text: "Change to object"}}))
          items.push(h('EditorOption', {props: {selection: selection, text: "Change to undefined"}}))
        }
        if (["arguments", "elements"].includes(selectedPath.listKey)) {
          items.push(h('EditorOption', {props: {selection: selection, text: "Add element before"}}))
          items.push(h('EditorOption', {props: {selection: selection, text: "Add element after"}}))
          items.push(h('EditorOption', {props: {selection: selection, text: "Delete element"}}))
        }
        if (selectedPath.listKey == "params") {
          items.push(h('EditorOption', {props: {selection: selection, text: "Add input before", initialName: "input1"}}))
          items.push(h('EditorOption', {props: {selection: selection, text: "Add input after", initialName: "input1"}}))
          items.push(h('EditorOption', {props: {selection: selection, text: "Delete element"}}))
        }
        if (selectedPath.isArrayExpression()) {
          items.push(h('EditorOption', {props: {selection: selection, text: "Add element"}}))
        } 
        if (selectedPath.isObjectExpression()) {
          items.push(h('EditorOption', {props: {selection: selection, text: "Add property", initialName: "prop1"}}))
        } 
        if (selectedPath.parentPath.listKey == "properties") {
          items.push(h('EditorOption', {props: {selection: selection, text: "Add property before", initialName: "prop1"}}))
          items.push(h('EditorOption', {props: {selection: selection, text: "Add property after", initialName: "prop1"}}))
          items.push(h('EditorOption', {props: {selection: selection, text: "Delete element"}}))
        }
      }
    }
  })
  return items
}

Vue.component('Editor', {
  functional: true,
  render: function (h, context) {
    return h("ol", {class: { 'list-group': true}}, getMenuItems(h, context, context.props.node))
  },
  props: {
    node: Object,
    selection: Object
  }
})
