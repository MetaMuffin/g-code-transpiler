import { scopedEval, transpile} from "."







export interface CompilerCommand {
    segments: Array<[string,boolean]>, // name, optional
    handler: (segments:Array<Array<string>>, arg) => string
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
    }
}