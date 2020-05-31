import { scopedEval, transpile} from "."







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
    }
}