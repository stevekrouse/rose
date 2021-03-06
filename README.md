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

When developing Rose's JavaScript, you'll probably want to bundle up the code using webpack.

To bundle the demo:
```bash
webpack --watch rose/src/index.js rose/dist/bundle.js       
```

To bundle the woof:
```bash
webpack --watch rose/src/index.js rose/dist/bundle.js       
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

- things are getting fustrating!
  - editor option input are not behaving themselves, sharing state in a fucking weird way that makes me think Vue has bugs
    - it says: initialName: "function1"
    - name: "input1"
    - but even when I watch for name changes, I can't detect any and yet it magically is changed
  - having a little textbox next to some options is nowhere near complex enough for all the options we have to map out
    - I should think about submenus, searchability, and specifics, like forever() or text() for woof
    - also think about buildng the ast in the menu more as opposed to setting stuff to null everywhere and then having to change it...
  - I don't like the game of adding string options and hooking them up with the bus on the backend, super brittle
    - I should think of ways I can describe the transformations possible at each type of node more programmatically like Workflow's graph of coercion 

- turn null into number, string

- transformations
  - get thing's member
  - call as a function
  - rename variable just here / refactor everywhere
  - create empty array expression / wrap in array expression
  - change AssignmentExpression to set, increase, descease, multiple, divide
  - change BinaryExpression to -, +, /, % and others...
  - call parameters / array expression
    - swap ordering
    - when adding element (and to left/right), give option to select? number, text, null, undefined, object, array, function

- arrow key navigation
  - right and tab - next sibling to right
  - left and shift-tab - next sibling to left
  - up -- parent
  - down -- first child
  - esc - out of edit mode
  - the selected node doesn't recieve keydown events unless you click on it --> maybe we need to focus on it? --> better way to get divs to get keydowns?

- add first-line block so you can add things at the top of file and block statement 
  - or "add line above" / "add line below" option
    - open questin: what about blocks with nothing inside them...?
      - "add line inside?"  

- typing
  - plop you into editing it (with empty name and only goes to _input1 if you leave it empty)
  - numbers and identifiers need validators on keydown / paste

- submit bug to vuejs where contenteditable node replaced with contenteditable node takes old value (deleting key, val of obj  or elem of array with delete key)

- add a character like microsoft word's clippy to ask you things about what you want where

- only be able to add return when a parent somewhere is a function

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