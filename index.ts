import { readFileSync, writeFileSync } from "fs"
import { compiler_commands } from "./commands";

var re_expr = /\{(.+)\}/gi

var global_eval_context = {}

export function scopedEval(expr) { // by rayscan from https://stackoverflow.com/questions/9781285/specify-scope-for-eval-in-javascript
    const evaluator = Function.apply(null, [...Object.keys(global_eval_context), 'expr', "return eval(expr)"]);
    return evaluator.apply(null, [...Object.values(global_eval_context), expr]);
}

export function evalExpressions(command:string):string {
    var c_split = command.split(" ")
    var out = []
    for (const arg of c_split) {
        out.push(arg.replace(re_expr,(_t1,code) => {
            console.log(`Evaluating: ${code}`);
            var result=""
            try {
                result = scopedEval(code)
            } catch (e) {
                console.error(`Error in Evaluation: ${e}`)
                process.exit(1)
            }
            return result.toString()
        }))
    }

    return out.join(" ")
}


export function transpile(code:Array<string>):string {
    var output:string = ""
    code = code.map(line => line.trim())

    for (var i = 0; i < code.length; i++) {
        const line = code[i]
        if (line.trim() == "") continue
        if (line.startsWith(";")) {
            if (line.startsWith(";;")) { // is a command
                var command_name = line.substr(2).split(" ")[0]
                var command_arg = line.substr(2).split(" ").slice(1).join(" ")
                i += 1
                var cc = compiler_commands[command_name]
                if (cc){
                    var out_segs = []
                    for (const segment of cc.segments) {
                        var istart = i
                        while (1) { // Start scanning for the segment end.
                            i += 1
                            if (i >= code.length) { // no end found: throw error if segment is not optional
                                if (segment[1]) {
                                    i = istart // Reset cursor to rescan for the next segment
                                    out_segs.push(undefined)
                                    break
                                } 
                                console.error(`No segment end ("${segment[0]}") found for compiler command ("${command_name}").`)
                                process.exit(1)
                            }
                            if (code[i] == `;;${segment[0]}`){
                                out_segs.push(code.slice(istart,i))
                                break
                            }
                        }
                    }
                    output += cc.handler(out_segs,command_arg) + "\n"
                } else {
                    console.error(`No compiler command for: ${command_name}`)
                    process.exit(1)
                }
            } else { // is a comment
                output += line + "\n"
            }
        } else {
            output += evalExpressions(line) + "\n"
        }
    }
    return output
}


export function transpileFile(in_file:string,out_file:string){
    console.log(`Transpiling ${in_file} to ${out_file}...`);
    var in_code = readFileSync(in_file).toString()
    var out_code = transpile(in_code.split("\n"))
    writeFileSync(out_file,out_code)
    console.log("Done!");
}

if (process.argv[2] && process.argv[3]){
    transpileFile(process.argv[2],process.argv[3])
} else {
    console.log("Usage: <source> <build-destination>")
}

