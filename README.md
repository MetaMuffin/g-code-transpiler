# G-Code-Transpiler

Lets you use common programming structures in G-Code.

This project is just developed at a large scale so the code is very bad and slow although you can add your own commands in `commands.ts`. Figure it out on your own or contact me if you really want to make this better (nobody will do this anyway so sorry for wasting your time reading this.)

## Features

- For-loops
- Dynamic values for commands.
- More in the future

## Usage

Clone the repo and either directly run index.ts with `ts-node` or first compile it with `tsc` to Javascript. Then run the file with the source as the first argument and the destination as the second.

# Syntax

The syntax is based of g-code. Just a few additions.
Valid g-code *should* be valid code for this project.

## Variables, Expressions & Evaluating Code

All code blocks and expressions are evaluated with javascript.

```gcode
; The keyword c can be used to execute code
;;c x = 1

; cc does the same but also uses the returned value as g-code
;;cc `M117 X${1+1} Y${2+2} Z${3+3}`

; Use expressions in g-code by surrounding then in curly-brackets
M117 {4 * 6 / 7 % 3}

; The just declare variable can be read by using a expression as well
M117 {x}
```

## For

```gcode
; A for like that counts with i to 10
;;for i=0;i<10;i++

; i can now be used in g-codes
M117 {i}

; end the for block
;;end
```

## If

```gcode
; Self-explainatory
;;if (1 + 1) < 9
M117 1+1 is actually smaller than 9.
;;end

; Or with a else block
;;if a == b
M117 a is equal to b
;;else
M177 it isnt
;;end

```

## Include

```gcode

; This will include g-code from a external file at this position. The file may include functions and has access to all global variables
;;include ./something.gcode

```

## Functions

```gcode
; A function with two parameters.
;;function do_something(a,b)
    M117 {a} times {b} is {a*b}
;;end

; Functions can be called with c and cc.
;;cc do_something(4,5)
```