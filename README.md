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
- lodash: https://lodash.com/docs/4.17.4
- vuejs guide: vuejs.org/guide/

## Goals

1. Bootstrap - develop rose in rose
2. Add rose to woofjs.com/create

## To dos

- transformations
  - add parameter
  - remove parameter
  - add another line
    - functioncall
    - assignment
    - variableDeclaration
    - functionDeclaration
    - return statment
    - if statment / else statement
  - call as a function
  - rename variable  

- add first-line block so you can add things at the top 

- when you click around in the text editor, it should select in the blocks selection
  - and vice-versa: selection in the UI should highlight the text in the editor (this will probably be easy-ish)
  - and things should scroll into view on both

- consider making the editor search thingy follow the selection
  - maybe have it appear when you rest on a node for 500 miliseconds and disappear if you don't touch it for 1.5 seconds

- think about ways to standardize view customizing
  - sprite.move(10) -> move sprite 10 by 10 steps
  - console.log("hi") -> log "hi" to the console
  - const x = 1 -> create a constant x and set it to 1
  - someArray.forEach(sprite => sprite.move(10)) --> for each sprite in someArray, move that sprite by 10 steps

- validate what you can type into the input boxes when editing number, strings, literals, etc

- arrow key navigation
  - right - next sibling to right
  - left - next sibling to left
  - up -- parent
  - down -- first child
  - esc - out of edit mode
 
- search for block

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




