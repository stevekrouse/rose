const t = require('babel-types')
const traverse = require("babel-traverse").default
const generate = require('babel-generator').default

const _ = require('lodash')

const Vue = require('vue').default

export const bus = new Vue()

const outline = "0px 0px 0px 3px #5B9DD9"

const spacer = (h) => h('div', {style: {display: 'inline-block', width: "5px"}})

// https://randomcolor.llllll.li/
const randomColor = require('randomcolor')

const createNode = (h, context, node) => node ? h(node.type, {props: {node: node, selection: context.props.selection}}) : null

const colors = {
  "NullLiteral": "gray",
  "DebuggerStatement": "coral",
  "BooleanLiteral": node => node.value ? "green" : "coral",
  "undefined": "gray" 
}
function color(node) {
  if (colors[node.type]) {
    return _.isFunction(colors[node.type])? colors[node.type](node) : colors[node.type]
  }
}

const defaultNodeStyle = {
  color: context => color(context.props.node),
  outline: 'none',
}
function overrideOptions(defaultOption, customizedOption = {}) {
  return context => { 
    const options =_.clone(defaultOption)  
    _.assign(options, customizedOption)
    return _.mapValues(options, (value, key) => _.isFunction(value) ? value(context) : value)
  }
}

function defaultNode() {
  const node = {}
  node.functional = true
  node.style = overrideOptions(defaultNodeStyle),
  node.domProps = context => {}
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
  style:  overrideOptions(defaultNodeStyle, {
    margin: '15px'
  }),
  children: (h, context) => {
    return context.props.node.program.body.map(node => createNode(h, context, node))
  },
  on: context => { return {
    click: function(event) {
      event.stopPropagation();
      bus.$emit('click-node', {fullPath: "file"})
    }
  } }
}))

Vue.component('BlockStatement', _.assign(defaultNode() ,{
  style:  overrideOptions(defaultNodeStyle, {
    marginLeft: '10px'
  }),
  children: (h, context) => {
    return context.props.node.body.map(node => createNode(h, context, node))
  }
}))

Vue.component('ExpressionStatement', _.assign(defaultNode() ,{
  children: (h, context) => {
    return [
      createNode(h, context, context.props.node.expression),
      h('EmptyLine', {props: {node: context.props.node, selection: context.props.selection}}),
    ]
  }
}))

const defaultSelectableNodeStyle = _.clone(defaultNodeStyle)
_.assign(defaultSelectableNodeStyle, {
  boxShadow: context => (context.props.node.fullPath == context.props.selection.fullPath) && !(context.props.selection.virtualPath == "LINE-BELOW") ? outline : "none"
})

const defaultSelectableNodeOn = {
  click: context => function(event) {
    event.stopPropagation();
    bus.$emit('click-node', {fullPath: context.props.node.fullPath})
  },
  keydown: context => function(event) {
    event.stopPropagation();
    if (event.which == 8) {
      bus.$emit('remove-node', context.props.selection)
    }
  },
  dragstart: context => function(event) {
    event.stopPropagation()
    event.dataTransfer.setData("text/plain", generate(context.props.node).code);
  },
  dragover: context => function(event) {
    event.preventDefault()
    event.stopPropagation()
  },
  drop: context => function(event){
    event.preventDefault()
    event.stopPropagation()
    bus.$emit('replace-node', {replacePath: context.props.node.fullPath, replaceCode: event.dataTransfer.getData("text")})
  }
}

function defaultSelectableNode() {
  const node = defaultNode()
  node.style = overrideOptions(defaultSelectableNodeStyle),
  node.domProps = context => { return {
    tabIndex: 1,
    draggable: true
  } }
  node.on = overrideOptions(defaultSelectableNodeOn)
  return node
}

Vue.component('DebuggerStatement', _.assign(defaultSelectableNode() ,{
  children: (h, context) => {
    return [
      "pause here when the devtools are open",
      h('EmptyLine', {props: {node: context.props.node, selection: context.props.selection}}),
    ]
  }
}))

Vue.component('ReturnStatement', _.assign(defaultSelectableNode() ,{
  children: (h, context) => {
    return [
      "return",
      spacer(h),
      createNode(h, context, context.props.node.argument),
      h('EmptyLine', {props: {node: context.props.node, selection: context.props.selection}}),
    ]
  }
}))

Vue.component('FunctionDeclaration', _.assign(defaultSelectableNode(), {
  children: (h, context) => {
    return [
      "function",
      spacer(h),
      createNode(h, context, context.props.node.id),
      spacer(h),
      context.props.node.params.length === 0 ? "" : "with inputs",
      spacer(h),
      h('FunctionParams', {props: {node: context.props.node, selection: context.props.selection}}),
      createNode(h, context, context.props.node.body),
      h('EmptyLine', {props: {node: context.props.node, selection: context.props.selection}})
    ]
  }
}))

Vue.component('VariableDeclaration', _.assign(defaultSelectableNode() ,{
  children: (h, context) => {
    return context.props.node.declarations.map(declaration => [
      createNode(h, context, declaration),
      h('EmptyLine', {props: {node: context.props.node, selection: context.props.selection}}),
    ])
  }
}))

Vue.component('IfStatement', _.assign(defaultSelectableNode(), {
  children: (h, context) => {
    const test = createNode(h, context, context.props.node.test)
    const consequent = createNode(h, context, context.props.node.consequent)
    const nodes =  ["if", spacer(h), test, spacer(h), "then", consequent]
    if (context.props.node.alternate) {
      if (context.props.node.alternate.type == "IfStatement") {
        nodes.push(h('ElseIfStatement', {props: {node: context.props.node.alternate, selection: context.props.selection}}))
      } else {
        nodes.push("otherwise")
        nodes.push(createNode(h, context, context.props.node.alternate))
        nodes.push(h('EmptyLine', {props: {node: context.props.node, selection: context.props.selection}}))  
      }
      
    }
    return nodes
  }
}))

Vue.component('ElseIfStatement', _.assign(defaultSelectableNode(), {
  children: (h, context) => {
    const test = createNode(h, context, context.props.node.test)
    const consequent = createNode(h, context, context.props.node.consequent)
    const nodes =  ["otherwise, if", spacer(h), test, spacer(h), "then", consequent]
    if (context.props.node.alternate) {
      if (context.props.node.alternate.type == "IfStatement") {
        nodes.push(h('ElseIfStatement', {props: {node: context.props.node.alternate, selection: context.props.selection}}))
      } else {
        nodes.push("otherwise")
        nodes.push(createNode(h, context, context.props.node.alternate))
        nodes.push(h('EmptyLine', {props: {node: context.props.node, selection: context.props.selection}}))  
      }
      
    }
    return nodes
  }
}))

Vue.component('EmptyLine', _.assign(defaultSelectableNode() ,{
  style: context => { return {
    marginTop: "5px",
    height: "10px",
    outline: "none",
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

const defaultInlineNodeStyle = _.clone(defaultSelectableNodeStyle)
_.assign(defaultInlineNodeStyle, {
  display: "inline-block",
  color: context => color(context.props.node),
  boxShadow: context => context.props.node.fullPath == context.props.selection.fullPath ? outline : "none"
})

function defaultInlineNode() {
  const node = defaultSelectableNode()
  node.style = overrideOptions(defaultInlineNodeStyle)
  return node
}

Vue.component('NewExpression', _.assign(defaultInlineNode(), {
  children: (h, context) => {
    return [
      "new",
      spacer(h),
      createNode(h, context, context.props.node.callee),
      h('CallParameters', {props: {node: context.props.node, selection: context.props.selection}})
    ]
  }
}))

Vue.component('CallExpression', _.assign(defaultInlineNode(), {
  style: overrideOptions(defaultInlineNodeStyle, {
    boxShadow: context => (context.props.node.fullPath == context.props.selection.fullPath) && !context.props.selection.virtualPath ? outline : "none"
  }),
  children: (h, context) => {
    return [
      createNode(h, context, context.props.node.callee),
      h('CallParameters', {props: {node: context.props.node, selection: context.props.selection}})
    ]
  }
}))

Vue.component('CallParameters', _.assign(defaultInlineNode(), {
  style: overrideOptions(defaultInlineNodeStyle, {
    boxShadow: "none"
  }),
  children: (h, context) => {
    var children = []
    children.push("(")
    context.props.node.arguments.forEach(function(arg, index) {
      if (index > 0) {
        children.push(',')
        children.push(h('div', {style: {display: 'inline-block', width: "5px"}}))
      }
      children.push(createNode(h, context, arg))
    })
    children.push(')')
    return children
  }
}))

Vue.component('VariableDeclarator', _.assign(defaultInlineNode(), {
  children: (h, context) => {
    return [
      "new variable",
      spacer(h),
      createNode(h, context, context.props.node.id),
      spacer(h),
      "set to",
      spacer(h),
      context.props.node.init ? createNode(h, context, context.props.node.init) : "undefined"
    ]
  }
}))

Vue.component('FunctionExpression', _.assign(defaultInlineNode(), {
  children: (h, context) => {
    return [
      "function",
      spacer(h),
      context.props.node.params.length === 0 ? "" : "with inputs",
      spacer(h),
      h('FunctionParams', {props: {node: context.props.node, selection: context.props.selection}}),
      createNode(h, context, context.props.node.body),
    ]
  }
}))

Vue.component('AssignmentExpression', _.assign(defaultInlineNode(), {
  children: (h, context) => {
    const left = createNode(h, context, context.props.node.left)
    const right = createNode(h, context, context.props.node.right)
    if (context.props.node.operator == "=") {
      return ["set", spacer(h), left, spacer(h), "to", spacer(h), right]
    } else if (context.props.node.operator == "+=") {
      return ["increase", spacer(h), left, spacer(h), "by", spacer(h), right]
    } else if (context.props.node.operator == "-=") {
      return ["decrease", spacer(h), left, spacer(h), "by", spacer(h), right]
    } else if (context.props.node.operator == "/=") {
      return ["divide", spacer(h), left, spacer(h), "by", spacer(h), right]
    } else if (context.props.node.operator == "*=") {
      return ["multiply", spacer(h), left, spacer(h), "by", spacer(h), right]
    }
  }
}))

function parenthesizeNode(h, context, node) {
  const n = createNode(h, context, node)
  if (["BinaryExpression", "UnaryExpression", "UnaryExpression", "LogicalExpression", "ConditionalExpression"].includes(node.type)) {
    return h("div", {style: {display: 'inline-block'}}, ["(", n, ")"])
  } else {
    return n
  }
  
}

Vue.component('BinaryExpression', _.assign(defaultInlineNode(), {
  children: (h, context) => {
    const left = parenthesizeNode(h, context, context.props.node.left)
    const right = parenthesizeNode(h, context, context.props.node.right)
    return [left, context.props.node.operator, right]
  }
}))

Vue.component('UnaryExpression', _.assign(defaultInlineNode(), {
  children: (h, context) => {
    var operator = context.props.node.operator
    if (context.props.node.operator == "!") {
      operator = "not"
    }
    return [operator, spacer(h), parenthesizeNode(h, context, context.props.node.argument)]
  }
}))

Vue.component('UpdateExpression', _.assign(defaultInlineNode(), {
  children: (h, context) => {
    var operator = context.props.node.operator
    if (context.props.node.operator == "++") {
      operator = "add one to"
    } else if (context.props.node.operator == "--") {
      operator = "subtract one from"
    }
    return [operator, spacer(h), parenthesizeNode(h, context, context.props.node.argument)]
  }
}))

Vue.component('LogicalExpression', _.assign(defaultInlineNode(), {
  children: (h, context) => {
    const left = parenthesizeNode(h, context, context.props.node.left)
    const right = parenthesizeNode(h, context, context.props.node.right)
    var operator = context.props.node.operator
    if (context.props.node.operator == "||") {
      operator = "or"
    } else if (context.props.node.operator == "&&") {
      operator = "and"
    }
    return [left, spacer(h), operator, spacer(h), right]
  }
}))

Vue.component('ConditionalExpression', _.assign(defaultInlineNode(), {
  children: (h, context) => {
    const test = parenthesizeNode(h, context, context.props.node.test)
    const consequent = parenthesizeNode(h, context, context.props.node.consequent)
    const alternate = parenthesizeNode(h, context, context.props.node.alternate)
    return ["(if", spacer(h), test, spacer(h), "then", spacer(h), consequent, spacer(h), "otherwise", spacer(h), alternate, ")"]
  }
}))

Vue.component('ArrayExpression', _.assign(defaultInlineNode(), {
  children: (h, context) => {
    var children = []
    children.push("[")
    context.props.node.elements.forEach(function(arg, index) {
      if (index > 0) {
        children.push(',')
        children.push(h('div', {style: {display: 'inline-block', width: "5px"}}))
      }
      children.push(createNode(h, context, arg))
    })
    children.push(']')
    return children
  }
}))

Vue.component('ObjectExpression', _.assign(defaultInlineNode(), {
  children: (h, context) => {
    var children = []
    children.push("{")
    context.props.node.properties.forEach(function(prop, index) {
      if (index > 0) {
        children.push(',')
        children.push(h('div', {style: {display: 'inline-block', width: "5px"}}))
      }
      children.push(createNode(h, context, prop.key))
      children.push(":")
      children.push(spacer(h))
      children.push(createNode(h, context, prop.value))
    })
    children.push('}')
    return children
  }
}))

Vue.component('MemberExpression', _.assign(defaultInlineNode(), {
  children: (h, context) => {
    const object = createNode(h, context, context.props.node.object)
    const property = createNode(h, context, context.props.node.property)
    
    const path = context.props.node.fullPath.split(".")
    const children = path[path.length -1 ] == "callee" ? [property, spacer(h), object] : [object, "'s", spacer(h), property]
    
    return children
  }
}))

Vue.component('ArrowFunctionExpression', _.assign(defaultInlineNode(), {
  children: (h, context) => {
    return [
      "function",
      spacer(h),
      context.props.node.params.length === 0 ? "" : "with inputs",
      spacer(h),
      h('FunctionParams', {props: {node: context.props.node, selection: context.props.selection}}),
      createNode(h, context, context.props.node.body),
    ]
  }
}))

Vue.component('FunctionParams', _.assign(defaultInlineNode(), {
  style: overrideOptions(defaultInlineNodeStyle, {
    boxShadow: "none"
  }),
  children: (h, context) => {
    if (context.props.node.params.length === 0) { return [] }
    var children = []
    context.props.node.params.forEach(function(arg, index) {
      if (index > 0) {
        children.push(',')
        children.push(spacer(h))
      }
      children.push(createNode(h, context, arg))
    })
    return children
  }
}))

Vue.component('NullLiteral', _.assign(defaultInlineNode(), {
  children: (h, context) => "null"
}))

Vue.component('BooleanLiteral', _.assign(defaultInlineNode(), {
  children: (h, context) => String(context.props.node.value)
}))

const defaultEditableNodeOn = _.clone(defaultSelectableNodeOn)
_.assign(defaultSelectableNodeOn, {
  dblclick: context => function(event) {
    event.stopPropagation();
    bus.$emit('click-node', {fullPath: context.props.node.fullPath, virtualPath: "EDITING"})
  }
})

function defaultEditableNode() {
  const node = defaultInlineNode()
  node.on = overrideOptions(defaultEditableNodeOn),
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
  children: (h, context) => ['"', context.props.node.value, '"']
}))

Vue.component('Identifier', _.assign(defaultEditableNode(), {
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
      
      if (selectedPath.isCallExpression() || selectedPath.isFunctionExpression() || selectedPath.isArrowFunctionExpression() || selectedPath.isFunctionDeclaration()) {
        items.push("Add input")
      }
      else if (["arguments", "params", "elements"].includes(selectedPath.listKey)) {
        items.push("Add element before")
        items.push("Add element after")
        items.push("Delete element")
      }
      if (selectedPath.isArrayExpression()) {
        items.push("Add element")
      } 
      if (selectedPath.isObjectExpression()) {
        items.push("Add property")
      } 
      if (selectedPath.parentPath.listKey == "properties") {
        items.push("Add property before")
        items.push("Add property after")
        items.push("Delete element")
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
