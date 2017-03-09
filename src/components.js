const Vue = require('vue').default
const _ = require('lodash')
export const bus = new Vue()

function defaultNode() {
  const node = {}
  node.functional = true
  node.style = context => { return {
    margin: '5px'
  } },
  node.children = context => []
  node.props = {
    node: Object,
    selection: Object
  }
  node.on = context => {}
  node.render = function (h, context) {
    return h('div', {style: node.style(context), on: node.on(context)}, node.children(h, context))
  }
  return node
}

Vue.component('ExpressionStatement', _.assign(defaultNode() ,{
  children: (h, context) => {
    return [
      h(context.props.node.expression.type, {props: {node: context.props.node.expression, selection: context.props.selection}}),
      h('EmptyLine', {props: {node: context.props.node, selection: context.props.selection}}),
    ]
  }
}))

Vue.component('EmptyLine', _.assign(defaultNode() ,{
  style: context => { return {
    marginTop: "5px",
    height: "10px",
    backgroundColor: "white",
    boxShadow: (context.props.node.fullPath == context.props.selection.fullPath && context.props.selection.virtualPath == "LINE-BELOW") ? "0 0 3pt 2pt blue" : "none"
  } },
  on: context => { return {
    click: function(event) {
      event.stopPropagation();
      bus.$emit('click-node', {fullPath: context.props.node.fullPath, virtualPath: "LINE-BELOW"})
    }
  } }
}))

Vue.component('File', _.assign(defaultNode() ,{
  children: (h, context) => {
    return context.props.node.program.body.map(function(node) {
      return h(node.type, {props: {node: node, selection: context.props.selection}})
    })
  }
}))

function defaultEditableNodeStyle(customizedStyle = {}) {
  return context => { 
    const style = {
      display: "inline-block",
      backgroundColor: "green",
      color: "white",
      padding: "5px",
      borderRadius: "5px",
      boxShadow: context.props.node.fullPath == context.props.selection.fullPath ? "0 0 3pt 2pt blue" : "none"
    } 
    _.assign(style, customizedStyle)
    return style
  }
}

function defaultEditableNode() {
  const component = {}
  component.functional = true
  component.style = defaultEditableNodeStyle()
  component.on = context => { return {
    click: function(event) {
      event.stopPropagation();
      bus.$emit('click-node', {fullPath: context.props.node.fullPath})
    },
    dblclick: function(event) {
      event.stopPropagation();
      bus.$emit('click-node', {fullPath: context.props.node.fullPath, virtualPath: "EDITING"})
    }
  } }
  component.children = (h, context) => context.props.node.value
  component.props = {
    node: Object,
    selection: Object
  }
  component.editingStyle = context => { return {
    width: ((context.props.node.value.length + 4) * 5) + 'px'
  } }
  component.editingOn = context => { return {
    click: function(event) {
      event.stopPropagation();
    },
    input: function(event) {
      bus.$emit('edit-node', {fullPath: context.props.node.fullPath, updates: {value: event.target.value || ""}})
    }
  }}
  component.editingDomProps = context => { return {
    value: context.props.node.value
  } }
  component.render = function (h, context) {
    if (context.props.node.fullPath == context.props.selection.fullPath && context.props.selection.virtualPath == "EDITING") {
      return h(
        "input",
        {
          style: component.editingStyle(context),
          on: component.editingOn(context),
          domProps: component.editingDomProps(context)
        },
        []
      )
    } else {
      return h(
        "div",
        {
          style: component.style(context),
          on: component.on(context)
        },
        component.children(h, context)
      )
    }
  }
  return component
}

Vue.component('NumericLiteral', _.assign(defaultEditableNode(), {
  style: defaultEditableNodeStyle({
    backgroundColor: "hotpink"
  }),
  editingStyle: context => { return {
    width: (Math.floor((Math.log10(Math.abs(context.props.node.value))) + 4) * 7) + 'px'
  } },
  editingOn: context => { return {
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
  children: (h, context) => ["'", context.props.node.value, "'"]
}))

Vue.component('Identifier', _.assign(defaultEditableNode(), {
  style: defaultEditableNodeStyle({
    backgroundColor: "orange"
  }),
  children: (h, context) => context.props.node.name
}))

Vue.component('MemberExpression', _.assign(defaultEditableNode(), {
  style: defaultEditableNodeStyle({
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

Vue.component('CallExpression', _.assign(defaultEditableNode(), {
  style: defaultEditableNodeStyle({
    backgroundColor: "lightblue"
  }),
  children: (h, context) => {
    return [
      h(context.props.node.callee.type, {props: {node: context.props.node.callee, selection: context.props.selection}}),
      h('CallParameters', {props: {node: context.props.node, selection: context.props.selection}})
    ]
  }
}))

Vue.component('CallParameters', _.assign(defaultEditableNode(), {
  style: defaultEditableNodeStyle({
    backgroundColor: "cornflowerblue"
  }),
  children: (h, context) => {
    var children = []
    children.push("(")
    context.props.node.arguments.forEach(function(arg, index) {
      if (index > 0) {
        children.push(',')
      }
      children.push(h(arg.type, {props: {node: arg, selection: context.props.selection}}))
    })
    children.push(')')
    return children
  }
}))

Vue.component('Editor', {
  render: function (h) {
    return h(
      "div",
      {},
      [
        h(
          "input",
          {}
        ),
        h(
          "div",
          {},
          [] // TODO options here
        )
      ]
    )
    
  },
  props: {
    node: Object,
    selection: Object
  }
})
