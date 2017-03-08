const Vue = require('vue').default
export const bus = new Vue()

Vue.component('NumericLiteral', {
  functional: true,
  render: function (h, context) {
    if (context.props.node.fullPath == context.props.selection.fullPath && context.props.selection.virtualPath == "EDITING") {
      return h(
        "input",
        {
          style: {
            width: (Math.floor((Math.log10(Math.abs(context.props.node.value))) + 4) * 7) + 'px'
          },
          on: {
            click: function(event) {
              event.stopPropagation();
            },
            input: function(event) {
              bus.$emit('edit-node', {fullPath: context.props.node.fullPath, updates: {value: event.target.value || 0}})
            }
          },
          domProps: {
            type: "number",
            value: context.props.node.value
          }
        },
        []
      )
    } else {
      return h(
        "div",
        {
          style: {
            display: "inline-block",
            backgroundColor: "hotpink",
            color: "white",
            padding: "5px",
            borderRadius: "5px",
            boxShadow: context.props.node.fullPath == context.props.selection.fullPath ? "0 0 3pt 2pt blue" : "none"
          },
          on: {
            click: function(event) {
              event.stopPropagation();
              bus.$emit('click-node', {fullPath: context.props.node.fullPath})
            },
            dblclick: function(event) {
              event.stopPropagation();
              bus.$emit('click-node', {fullPath: context.props.node.fullPath, virtualPath: "EDITING"})
            }
          }
        },
        context.props.node.value
      )
    }
  },
  props: {
    node: Object,
    selection: Object
  }
})

Vue.component('StringLiteral', {
  functional: true,
  render: function (h, context) {
    return h(
      "div",
      {
        style: {
          display: "inline-block",
          backgroundColor: "green",
          color: "white",
          padding: "5px",
          borderRadius: "5px",
          boxShadow: context.props.node.fullPath == context.props.selection.fullPath ? "0 0 3pt 2pt blue" : "none"
        },
        on: {
          click: function(event) {
            event.stopPropagation();
            bus.$emit('click-node', {fullPath: context.props.node.fullPath})
          }
        }
      },
      [
        "\"",
        context.props.node.value,
        "\""
      ]
    )
  },
  props: {
    node: Object,
    selection: Object
  }
})

Vue.component('Identifier', {
  functional: true,
  render: function (h, context) {
    return h(
      "div",
      {
        style: {
          display: "inline-block",
          backgroundColor: "orange",
          color: "white",
          padding: "5px",
          margin: "5px",
          borderRadius: "5px",
          boxShadow: context.props.node.fullPath == context.props.selection.fullPath ? "0 0 3pt 2pt blue" : "none"
        },
        on: {
          click: function(event) {
            event.stopPropagation();
            bus.$emit('click-node', {fullPath: context.props.node.fullPath})
          }
        }
      },
      [
        context.props.node.name
      ]
    )
  },
  props: {
    node: Object,
    selection: Object
  }
})

Vue.component('MemberExpression', {
  functional: true,
  render: function (h, context) {
    return h(
      "div",
      {
        style: {
          display: "inline-block",
          backgroundColor: "pink",
          color: "white",
          padding: "5px",
          borderRadius: "5px",
          boxShadow: context.props.node.fullPath == context.props.selection.fullPath ? "0 0 3pt 2pt blue" : "none"
        },
        on: {
          click: function(event) {
            event.stopPropagation();
            bus.$emit('click-node', {fullPath: context.props.node.fullPath})
          }
        }
      },
      [
        h(context.props.node.object.type, {props: {node: context.props.node.object, selection: context.props.selection}}),
        "'s",
        h(context.props.node.property.type, {props: {node: context.props.node.property, selection: context.props.selection}})
      ]
    )
  },
  props: {
    node: Object,
    selection: Object
  }
})

Vue.component('CallExpression', {
  functional: true,
  render: function (h, context) {
    return h(
      "div",
      {
        style: {
          display: "inline-block",
          backgroundColor: "lightblue",
          color: "white",
          padding: "5px",
          borderRadius: "5px",
          boxShadow: (context.props.node.fullPath == context.props.selection.fullPath && !context.props.selection.virtualPath) ? "0 0 3pt 2pt blue" : "none"
        },
        on: {
          click: function(event) {
            event.stopPropagation();
            bus.$emit('click-node', {fullPath: context.props.node.fullPath})
          }
        }
      },
      [
        h(context.props.node.callee.type, {props: {node: context.props.node.callee, selection: context.props.selection}}),
        h('CallParameters', {props: {node: context.props.node, selection: context.props.selection}})
      ]
    )
  },
  props: {
    node: Object,
    selection: Object
  }
})

Vue.component('CallParameters', {
  functional: true,
  render: function (h, context) {
    var children = []
    children.push("(")
    context.props.node.arguments.forEach(function(arg, index) {
      if (index > 0) {
        children.push(',')
      }
      children.push(h(arg.type, {props: {node: arg, selection: context.props.selection}}))
    })
    children.push(')')
    return h(
      "div",
      {
        style: {
          display: "inline-block",
          backgroundColor: "cornflowerblue",
          color: "white",
          padding: "5px",
          margin: "5px",
          borderRadius: "5px",
          boxShadow: (context.props.node.fullPath == context.props.selection.fullPath && context.props.selection.virtualPath == "PARAMETERS") ? "0 0 3pt 2pt blue" : "none"
        },
        on: {
          click: function(event) {
            event.stopPropagation();
            bus.$emit('click-node', {fullPath: context.props.node.fullPath, virtualPath: "PARAMETERS"})
          }
        }
      },
      children
    )
  },
  props: {
    node: Object,
    selection: Object
  }
})

Vue.component('ExpressionStatement', {
  functional: true,
  render: function (h, context) {
    return h(
      'div',
      {
        style: {
          margin: "5px",
        }
      },
      [
        h(context.props.node.expression.type, {props: {node: context.props.node.expression, selection: context.props.selection}}),
        h('EmptyLine', {props: {node: context.props.node, selection: context.props.selection}}),
      ]
    )
  },
  props: {
    node: Object,
    selection: Object
  }
})


Vue.component('EmptyLine', {
  functional: true,
  render: function (h, context) {
    return h(
      'div',
      {
        style: {
          marginTop: "5px",
          height: "10px",
          backgroundColor: "lightgray",boxShadow: (context.props.node.fullPath == context.props.selection.fullPath && context.props.selection.virtualPath == "LINE-BELOW") ? "0 0 3pt 2pt blue" : "none"
        },
        on: {
          click: function(event) {
            event.stopPropagation();
            bus.$emit('click-node', {fullPath: context.props.node.fullPath, virtualPath: "LINE-BELOW"})
          }
        }
      },
      []
    )
  },
  props: {
    node: Object,
    selection: Object
  }
})

Vue.component('File', {
  functional: true,
  render: function (h, context) {
    return h(
      "div",
      {},
      context.props.node.program.body.map(function(node) {
        return h(node.type, {props: {node: node, selection: context.props.selection}})
      })
    )
    
  },
  props: {
    node: Object,
    selection: Object
  }
})

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
