# Rose

JavaScript without syntax errors

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
  - remove empty line virtualPath (just have add line below, add line above)
    - or: add first-line block so you can add things at the top of file and block statement 
  - add another line
    - functioncall
    - assignment
    - variableDeclaration
    - functionDeclaration
    - return statment
    - if statment / else statement
  - ability to change boolean literal to true or false 
  - call as a function
  - rename variable  
  - array expression
  - change AssignmentExpression to set, increase, descease, multiple, divide
  - change BinaryExpression to -, +, /, % and others...
  - call parameters / array expression
    - swap ordering
    - when adding element (and to left/right), give option to select number, text, null, undefined, object, array, function

- arrow key navigation
  - right and tab - next sibling to right
  - left and shift-tab - next sibling to left
  - up -- parent
  - down -- first child
  - esc - out of edit mode
  - the selected node doesn't recieve keydown events unless you click on it --> maybe we need to focus on it? --> better way to get divs to get keydowns?

- typing
  - plop you into editing it (with empty name and only goes to _input1 if you leave it empty)
  - numbers and identifiers need validators on keydown / paste

- submit bug to vuejs where contenteditable node replaced with contenteditable node takes old value (deleting key, val of obj  or elem of array with delete key)

- layout
  - figure out when arrays and objects should layout in a new line
  - when you have console.log(() => 1), the console.log should be at the top of the blo

- colors
  - identifiers should be colored uniquely with scope

- make the size of input box's more durable by responding to the font size

- distinguish between var, const, let, etc

- cut/copy/paste

- look into https://github.com/codecombat/esper.js

- clipboard 
  - or: recently touched
  - or: recently copied

- think about ways to standardize view customizing
  - turn all camel case into spaces? 
  - sprite.move(10) -> move sprite 10 by 10 steps
  - console.log("hi") -> log "hi" to the console
  - const x = 1 -> create a constant x and set it to 1
  - someArray.forEach(sprite => sprite.move(10)) --> for each sprite in someArray, move that sprite by 10 steps

- when you click around in the text editor, it should select in the blocks selection
  - and vice-versa: selection in the UI should highlight the text in the editor (this will probably be easy-ish)
  - and things should scroll into view on both

- consider making the editor search thingy follow the selection
  - maybe have it appear when you rest on a node for 500 miliseconds and disappear if you don't touch it for 1.5 seconds

- object member computed

- help option in the editor menu to tell you what each node is...?

- validate what you can type into the input boxes when editing number, strings, literals, etc

- string formatting
  - convert string input to multiline input on enter
  - ability to describe/detect string type
    - rgb and "#fefefe" colors should have the colour near them and color picker widgets
    - syntax highlight for code string

- search for block