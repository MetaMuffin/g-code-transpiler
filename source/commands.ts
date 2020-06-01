import { scopedEval, transpile, global_eval_context} from "."
import { existsSync, readFileSync } from "fs"







export interface CompilerCommand {
    segments: Array<[string,boolean]>, // name, optional
    handler: (segments:Array<Array<string>>, arg: string) => string
}




export var compiler_commands:Record<string,CompilerCommand> = {
    for: {
        segments: [["end",false]],
        handler: (segments, arg) => {
            var args = arg.split(";")
            var out = ""
            for (scopedEval(args[0]); scopedEval(args[1]); scopedEval(args[2]) ){
                out += transpile(segments[0])
            }
            return out
        }
    },
    if: {
        segments: [["else",true],["end",false]],
        handler: (segments,arg) => {
            // if there is a else block: seg 0 is if and seg 1 is else
            // if there is no else block: seg 1 is if
            if (segments[0]) {
                if(scopedEval(arg)){
                    return transpile(segments[0])
                } else {
                    return transpile(segments[1])
                }
            } else {
                if (scopedEval(arg)){
                    return transpile(segments[1])
                }
            }
        }
    },
    c: {
        segments: [],
        handler: (segments, arg) => {
            scopedEval(arg)
            return ""
        }
    },
    cc: {
        segments: [],
        handler: (segments, arg) => {
            return scopedEval(arg)
        }
    },
    function: {
        segments: [["end",false]],
        handler: (segments,arg) => {
            var f_re1 = arg.match(/(?<name>\w+)\((?<args>.*)\)/i)
            var f_name = f_re1.groups.name
            if (!f_name){
                console.error(`Line ?: No Name for function: ${arg}`)
                process.exit(1)
            }
            var f_args = f_re1.groups.args.split(",").map((a) => a.trim())

            global_eval_context[f_name] = function(){
                if (f_args.length > arguments.length){
                    console.error(`Line ?: Not Enough arguments passed to "${f_name}": ${arguments}`)
                    process.exit(1)
                }
                var c_global = {} // Save to overwritten vars from the global context to later load them
                for (let i = 0; i < f_args.length; i++) {
                    const arg_name = f_args[i];
                    const arg_value = arguments[i]
                    c_global[arg_name] = global_eval_context[arg_name]
                    global_eval_context[arg_name] = arg_value
                }
                var code = transpile(segments[0])
                for (let i = 0; i < f_args.length; i++) { // Restore saved values
                    const arg_name = f_args[i];
                    global_eval_context[arg_name] = c_global[arg_name]
                }
                return code
            }
            
            return ""
        }
    },
    include: {
        segments: [],
        handler: (segments,arg) => {
            if (!existsSync(arg)){
                console.error(`Line ?: The File ${arg} does not exist. Paths are relative to the directory of the main source file.`);
                process.exit(1)
            }
            var content = readFileSync(arg).toString().split("\n")
            return transpile(content)
        }
    }
}