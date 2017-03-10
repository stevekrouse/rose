const t = require('babel-types')
const traverse = require("babel-traverse").default

const _ = require('lodash')

const Vue = require('vue').default

export const bus = new Vue()

const outline = "0px 0px 0px 3px #5B9DD9"

function defaultNode() {
  const node = {}
  node.functional = true
  node.style = context => { return {
    margin: '5px',
    outline: 'none'
  } },
  node.domProps = context => { return {

  } }
  node.children = context => []
  node.props = {
    node: Object,
    selection: Object
  }
  node.on = context => {}
  node.render = function (h, context) {
    return h('div', {style: node.style(context), on: node.on(context), domProps: node.domProps(context)}, node.children(h, context))
  }
  return node
}

Vue.component('File', _.assign(defaultNode() ,{
  children: (h, context) => {
    return context.props.node.program.body.map(function(node) {
      return h(node.type, {props: {node: node, selection: context.props.selection}})
    })
  },
  on: context => { return {
    click: function(event) {
      event.stopPropagation();
      bus.$emit('click-node', {fullPath: "file"})
    }
  } }
}))

Vue.component('ExpressionStatement', _.assign(defaultNode() ,{
  children: (h, context) => {
    return [
      h(context.props.node.expression.type, {props: {node: context.props.node.expression, selection: context.props.selection}}),
      h('EmptyLine', {props: {node: context.props.node, selection: context.props.selection}}),
    ]
  }
}))

Vue.component('EmptyLine', _.assign(defaultNode() ,{
  domProps: context => { return {
    tabIndex: 1
  } },
  style: context => { return {
    marginTop: "5px",
    height: "10px",
    backgroundColor: "white",
    boxShadow: (context.props.node.fullPath == context.props.selection.fullPath && context.props.selection.virtualPath == "LINE-BELOW") ? outline : "none"
  } },
  on: context => { return {
    click: function(event) {
      event.stopPropagation();
      bus.$emit('click-node', {fullPath: context.props.node.fullPath, virtualPath: "LINE-BELOW"})
    }
  } }
}))

function defaultInlineNodeStyle(customizedStyle = {}) {
  return context => { 
    const style = {
      outline: 'none',
      display: "inline-block",
      backgroundColor: "green",
      color: "white",
      padding: "5px",
      borderRadius: "5px",
      boxShadow: context.props.node.fullPath == context.props.selection.fullPath ? outline : "none"
    } 
    _.assignWith(style, customizedStyle, (objValue, srcValue, key, object, source) => _.isFunction(srcValue) ? srcValue(context) : srcValue)
    return style
  }
}

function defaultInlineNode() {
  const node = defaultNode()
  node.style = defaultInlineNodeStyle({}),
  node.domProps = context => { return {
    tabIndex: 1
  } }
  node.on = context => { return {
    click: function(event) {
      event.stopPropagation();
      bus.$emit('click-node', {fullPath: context.props.node.fullPath})
    },
    keydown: function(event) {
      event.stopPropagation();
      if (event.which == 8) {
        bus.$emit('remove-node', context.props.selection)
      }
    }
  } }
  return node
}

Vue.component('CallExpression', _.assign(defaultInlineNode(), {
  style: defaultInlineNodeStyle({
    backgroundColor: "lightblue",
    boxShadow: context => (context.props.node.fullPath == context.props.selection.fullPath) && !context.props.selection.virtualPath ? outline : "none"
  }),
  children: (h, context) => {
    return [
      h(context.props.node.callee.type, {props: {node: context.props.node.callee, selection: context.props.selection}}),
      h('CallParameters', {props: {node: context.props.node, selection: context.props.selection}})
    ]
  }
}))

Vue.component('CallParameters', _.assign(defaultInlineNode(), {
  style: defaultInlineNodeStyle({
    backgroundColor: "#bf95ec",
    boxShadow: context => (context.props.node.fullPath == context.props.selection.fullPath && context.props.selection.virtualPath == "PARAMETERS") ? outline : "none"
  }),
  on: context => { return {
    click: function(event) {
      event.stopPropagation();
      bus.$emit('click-node', {fullPath: context.props.node.fullPath, virtualPath: "PARAMETERS"})
    }
  } },
  children: (h, context) => {
    var children = []
    children.push("(")
    context.props.node.arguments.forEach(function(arg, index) {
      if (index > 0) {
        children.push(',')
        children.push(h('div', {style: {display: 'inline-block', width: "5px"}}))
      }
      children.push(h(arg.type, {props: {node: arg, selection: context.props.selection}}))
    })
    children.push(')')
    return children
  }
}))

Vue.component('MemberExpression', _.assign(defaultInlineNode(), {
  style: defaultInlineNodeStyle({
    backgroundColor: "pink"
  }),
  children: (h, context) => {
    const object = h(context.props.node.object.type, {props: {node: context.props.node.object, selection: context.props.selection}})
    const property = h(context.props.node.property.type, {props: {node: context.props.node.property, selection: context.props.selection}})
    
    const spacer = h('div', {style: {display: 'inline-block', width: "5px"}})
    
    const path = context.props.node.fullPath.split(".")
    const children = path[path.length -1] == "callee" ? [property, spacer, object] : [object, "'s", spacer, property]
    
    return children
  }
}))

Vue.component('NullLiteral', _.assign(defaultInlineNode(), {
  style: defaultInlineNodeStyle({
    backgroundColor: "gray"
  }),
  children: (h, context) => "null"
}))

function defaultEditableNode() {
  const node = defaultNode()
  node.on = context => { return {
    click: function(event) {
      event.stopPropagation();
      bus.$emit('click-node', {fullPath: context.props.node.fullPath})
    },
    keydown: function(event) {
      event.stopPropagation();
      if (event.which == 8) {
        bus.$emit('remove-node', context.props.selection)
      }
    },
    dblclick: function(event) {
      event.stopPropagation();
      bus.$emit('click-node', {fullPath: context.props.node.fullPath, virtualPath: "EDITING"})
    }
  } },
  node.children = (h, context) => context.props.node.value,
  node.editingStyle = context => { return {
    width: ((context.props.node.value.length + 1) * 6.6) + 'px'
  } }
  node.editingOn = context => { return {
    click: function(event) {
      event.stopPropagation();
    },
    input: function(event) {
      bus.$emit('edit-node', {fullPath: context.props.node.fullPath, updates: {value: event.target.value || ""}})
    }
  }}
  node.editingDomProps = context => { return {
    value: context.props.node.value
  } }
  node.render = function (h, context) {
    if (context.props.node.fullPath == context.props.selection.fullPath && context.props.selection.virtualPath == "EDITING") {
      return h("input", {style: node.editingStyle(context), on: node.editingOn(context), domProps: node.editingDomProps(context)})
    } else {
      return h('div', {style: node.style(context), on: node.on(context), domProps: node.domProps(context)}, node.children(h, context))
    }
  }
  return node
}

Vue.component('NumericLiteral', _.assign(defaultEditableNode(), {
  style: defaultInlineNodeStyle({
    backgroundColor: "hotpink"
  }),
  editingStyle: context => { return {
    width: (Math.floor((Math.log10(Math.abs(context.props.node.value))) + 4) * 7) + 'px'
  } },
  editingOn: context => { return {
    click: function(event) {
      event.stopPropagation();
    },
    input: function(event) {
      bus.$emit('edit-node', {fullPath: context.props.node.fullPath, updates: {value: event.target.value || 0}})
    }
  } },
  editingDomProps: context => { return {
    type: "number",
    value: context.props.node.value
  } }
}))

Vue.component('StringLiteral', _.assign(defaultEditableNode(), {
  style: defaultInlineNodeStyle({
    backgroundColor: "lightgreen",
  }),
  children: (h, context) => ['"', context.props.node.value, '"']
}))

Vue.component('Identifier', _.assign(defaultEditableNode(), {
  style: defaultInlineNodeStyle({
    backgroundColor: "orange",
  }),
  editingStyle: context => { return {
    width: ((context.props.node.name.length + 1) * 5.5) + 'px'
  } },
  editingDomProps: context => { return {
    value: context.props.node.name
  } },
  editingOn: context => { return {
    click: function(event) {
      event.stopPropagation();
    },
    input: function(event) {
      bus.$emit('edit-node', {fullPath: context.props.node.fullPath, updates: {name: event.target.value || context.props.node.name}})
    }
  } },
  children: (h, context) => context.props.node.name
}))


function getMenuItems(ast, selection) {
  const items = []
  traverse(ast, {
    Program(path) {
      const selectedPath = path.get(selection.fullPath)
      const node = selectedPath.node
      
      if (selection.virtualPath == "PARAMETERS") {
        // if I am the parameters node itself
        items.push("Add an input")
      }
      if (selectedPath.listKey == "arguments") {
        items.push("Add an input to the left")
        items.push("Add an input to the right")
        items.push("Delete this input")
      }
    }
  })
  return items
}

Vue.component('Editor', {
  functional: true,
  render: function (h, context) {
    return h(
      "div",
      {},
      [
        h(
          "input",
          {}
        ),
        h(
          "ol",
          {
            class: { 'list-group': true}
          },
          getMenuItems(context.props.node, context.props.selection).map(option => 
            h('li', 
              {
                class: { 'list-group-item': true},
                on: {
                  click: event => bus.$emit(option, context.props.selection)
                }
              }, 
             option
            )
          )
        )
      ]
    )
    
  },
  props: {
    node: Object,
    selection: Object
  }
})
