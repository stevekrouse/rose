# Rose

JavaScript without syntax 

[https://stevekrouse.github.io/rose](https://stevekrouse.github.io/rose/)

## Setup

1. Install node and npm

2. Install all dependencies

```bash
npm install
```

## Developing

When developing Rose's JavaScript, you'll probably want to bundle up the code using webpack:

```bash
webpack --watch rose/src/rose.js rose/dist/bundle.js          
```

## Helpful links

- rose actions: https://docs.google.com/document/d/1744mrs1kYBjWEbGRl5fzZCo4J7UY_vYZAz4GZrqCR7g/edit#
- ast explorer (don't forget to use babloyn6): https://astexplorer.net/
- babel handbook: https://github.com/thejameskyle/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-babel-traverse
- all the types: https://github.com/babel/babel/tree/7.0/packages/babel-types


## To dos

- switch the order of last member expression of call expression for move sprite 10

- make a list of UI ideas to mimic from notion.so

- transformations
  - edit string
  - edit identifier
  - delete stuff

- visualize all the types
  - array expression
  - arrow function
  - assignment expression
  - binaryExpression (infix)
  - blockStatement
  - booleanLiteral
  - conditionalExpression
  - declareFunction 
  - functionDeclaration
  - declareVariable
  - functionExpression
  - ifStatement
  - logicalExpression
  - newExpression
  - nullLiteral
  - objectExpression
  - parenthesizedExpression
  - regExpLiteral
  - restElement
  - return statement
  - unaryExpression
  - updateExpression 
  - variableDeclaration
  - variableDeclarator 

- arrow key navigation
  - right - next sibling to right
  - left - next sibling to left
  - up -- parent
  - down -- first child
  - esc - out of edit mode
 
- search for block

- add first-line block so you can add things at the top 


