const bus = require('./components').bus
const {app, annotatePaths} = require('./app')
const traverse = require("babel-traverse").default
const t = require('babel-types')

// SELECTION

bus.$on('click-node', function (selection) {
  app.selection = selection
})

// TYPING ON A NODE

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

// CHANGING BOOLEAN LITERALS

bus.$on("Change to true", function({selection}) {
  bus.$emit('edit-node', {fullPath: selection.fullPath, updates: {value: true}})
})

bus.$on("Change to false", function({selection}) {
  bus.$emit('edit-node', {fullPath: selection.fullPath, updates: {value: false}})
})

// INSERTING ELEMENTS

bus.$on("Add element after", function({selection}) {
  traverse(app.ast, {
    Program(path) {
      const selectedPath = path.get(selection.fullPath)
      var node = selectedPath.node
      var newArgument = selectedPath.listKey == "params" ? path.scope.generateUidIdentifier("input") : t.nullLiteral()
      selectedPath.parentPath.node[selectedPath.listKey].splice(selectedPath.key + 1, 0, newArgument)
      annotatePaths(app.ast)
      app.selection = {fullPath: newArgument.fullPath}
    }
  })
})

bus.$on("Add element before", function({selection}) {
  traverse(app.ast, {
    Program(path) {
      const selectedPath = path.get(selection.fullPath)
      var node = selectedPath.node
      var newArgument = selectedPath.listKey == "params" ? path.scope.generateUidIdentifier("input") : t.nullLiteral()
      selectedPath.parentPath.node[selectedPath.listKey].splice(selectedPath.key, 0, newArgument)
      annotatePaths(app.ast)
    }
  })
})

bus.$on("Add input", function({selection}) {
  traverse(app.ast, {
    Program(path) {
      const selectedPath = path.get(selection.fullPath)
      const node = selectedPath.node
      var newArgument = t.nullLiteral()
      if (selectedPath.isCallExpression() || selectedPath.isNewExpression()) {
        node.arguments.push(newArgument)
      } else {
        newArgument = path.scope.generateUidIdentifier("input")
        node.params.push(newArgument)
      }
      annotatePaths(app.ast)
      app.selection = {fullPath: newArgument.fullPath}
    }
  })
})

bus.$on("Add element", function({selection}) {
  traverse(app.ast, {
    Program(path) {
      const selectedPath = path.get(selection.fullPath)
      const node = selectedPath.node
      var newArgument = t.nullLiteral()
      node.elements.push(newArgument)
      annotatePaths(app.ast)
      app.selection = {fullPath: newArgument.fullPath}
    }
  })
})

bus.$on("Add property after", function({selection}) {
  traverse(app.ast, {
    Program(path) {
      const newArgument = t.objectProperty(path.scope.generateUidIdentifier("property"), t.nullLiteral())
      const selectedPath = path.get(selection.fullPath)
      selectedPath.parentPath.parentPath.node.properties.splice(selectedPath.parentPath.key + 1, 0, newArgument)
      annotatePaths(app.ast)
      app.selection = {fullPath: newArgument.key.fullPath}
    }
  })
})

bus.$on("Add property before", function({selection}) {
  traverse(app.ast, {
    Program(path) {
      const newArgument = t.objectProperty(path.scope.generateUidIdentifier("property"), t.nullLiteral())
      const selectedPath = path.get(selection.fullPath)
      selectedPath.parentPath.parentPath.node.properties.splice(selectedPath.parentPath.key, 0, newArgument)
      annotatePaths(app.ast)
      app.selection = {fullPath: newArgument.key.fullPath}
    }
  })
})

bus.$on("Add property", function({selection}) {
  traverse(app.ast, {
    Program(path) {
      const newArgument = t.objectProperty(path.scope.generateUidIdentifier("property"), t.nullLiteral())
      const selectedPath = path.get(selection.fullPath)
      selectedPath.node.properties.push(newArgument)
      annotatePaths(app.ast)
      app.selection = {fullPath: newArgument.key.fullPath}
    }
  })
})

// DRAG AND DROP REPLACE

bus.$on('replace-node', function ({replacePath, replaceCode}) {
  traverse(app.ast, {
    Program(path) {
      const selectedPath = path.get(replacePath)
      selectedPath.replaceWithSourceString(replaceCode)
      annotatePaths(app.ast)
    }
  })
})

// ADDING ELEMENTS ON A NEW LINE

bus.$on('Call function', function ({selection, name}) {
  traverse(app.ast, {
    Program(path) {
      const selectedPath = path.get(selection.fullPath)
      const newExpr = t.expressionStatement(t.callExpression(t.identifier(name), []))
      selectedPath.insertAfter(newExpr);
      annotatePaths(app.ast)
      app.selection = {fullPath: newExpr.fullPath}
    }
  })
})

bus.$on('If then', function ({selection}) {
  traverse(app.ast, {
    Program(path) {
      const selectedPath = path.get(selection.fullPath)
      const newExpr = t.ifStatement(t.booleanLiteral(true), t.blockStatement([]))
      selectedPath.insertAfter(newExpr);
      annotatePaths(app.ast)
      app.selection = {fullPath: newExpr.fullPath}
    }
  })
})

bus.$on('Set variable', function ({selection, name}) {
  traverse(app.ast, {
    Program(path) {
      const selectedPath = path.get(selection.fullPath)
      const newExpr = t.assignmentExpression("=", t.identifier(name), t.nullLiteral())
      selectedPath.insertAfter(newExpr);
      annotatePaths(app.ast)
      app.selection = {fullPath: newExpr.fullPath}
    }
  })
})

bus.$on('Create variable', function ({selection, name}) {
  traverse(app.ast, {
    Program(path) {
      const selectedPath = path.get(selection.fullPath)
      const newExpr = t.variableDeclaration("var", [t.variableDeclarator(t.identifier(name), t.nullLiteral())])
      selectedPath.insertAfter(newExpr);
      annotatePaths(app.ast)
      app.selection = {fullPath: newExpr.fullPath}
    }
  })
})

bus.$on('Create function', function ({selection, name}) {
  traverse(app.ast, {
    Program(path) {
      const selectedPath = path.get(selection.fullPath)
      const newExpr = t.functionDeclaration(t.identifier(name), [], t.blockStatement([]))
      selectedPath.insertAfter(newExpr);
      annotatePaths(app.ast)
      app.selection = {fullPath: newExpr.fullPath}
    }
  })
})

bus.$on('Return', function ({selection, name}) {
  traverse(app.ast, {
    Program(path) {
      const selectedPath = path.get(selection.fullPath)
      const newExpr = t.returnStatement(t.nullLiteral())
      selectedPath.insertAfter(newExpr);
      annotatePaths(app.ast)
      app.selection = {fullPath: newExpr.fullPath}
    }
  })
})

// REMOVING NODES 

bus.$on("Delete element", function({selection}) {
  bus.$emit('remove-node', selection)
})

bus.$on('remove-node', function (selection) {
  traverse(app.ast, {
    Program(path) {
      const selectedPath = path.get(selection.fullPath)
      
      if (selection.virtualPath == "LINE-BELOW") {
        // do nothing
      } 
      // if you want to remove something who's parent is an expression statement, might as well just remove the expression statement
      else if (selectedPath.parentPath.isExpressionStatement()) {
        selectedPath.parentPath.remove()
        annotatePaths(app.ast)
        // TODO figure out where selection goes
      }
      else if (selectedPath.isCallExpression()) {
        selectedPath.remove()
        annotatePaths(app.ast)
        // TODO figure out where selection goes
      } 
      else if (selectedPath.parentPath.isCallExpression() && selectedPath.key == "callee") {
        // do nothing because you can't delete callee
      } 
      else if (selectedPath.listKey) {
        const selectedPathKey = selectedPath.key
        
        // delete a parameter 
        selectedPath.remove()
        annotatePaths(app.ast)

        // if the current path no longer exists
        if (!path.get(selection.fullPath)) {
          // if it was the furthest right parameter, go the the next furthest right parameter
          if (selectedPathKey !== 0 && selectedPath.parentPath.node[selectedPath.listKey].length === selectedPathKey) {
            app.selection = {fullPath: selectedPath.getSibling(selectedPathKey - 1).node.fullPath}
          }
          // if you deleted the only parameter, the selection should go to the call expression
          else {
            app.selection = {fullPath: selectedPath.parentPath.node.fullPath}
          }
        }
      } else if (selectedPath.parentPath.listKey == "properties") {
        const selectedPathKey = selectedPath.parentPath.key
        
        // delete the property
        selectedPath.parentPath.remove()
        annotatePaths(app.ast)
        
        // if the current path no longer exists...
        if (!selectedPath.parentPath.node) {
          // if it was the furthest right property, go the the next furthest right property
          if (selectedPathKey !== 0 && selectedPath.parentPath.parentPath.node.properties.length === selectedPathKey) {
            app.selection = {fullPath: selectedPath.parentPath.getSibling(selectedPathKey - 1).node.key.fullPath}
          } 
          // if you deleted the only parameter, the selection should go to the object expression
          else {
            app.selection = {fullPath: selectedPath.parentPath.parentPath.node.fullPath}
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


