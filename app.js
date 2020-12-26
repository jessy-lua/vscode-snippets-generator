'use strict';

const fs = require('fs');
const fetch = require("node-fetch");

const BUILTIN_FUNCTIONS_URL = 'https://raw.githubusercontent.com/jessy-lua/docs/master/build/globals.json';

(async()=>{
    const builtin_functions = await fetch(BUILTIN_FUNCTIONS_URL).then(res => res.json());
    let snippets = {};
    for(let table_name in builtin_functions) {

        if(table_name === "cvar") continue;

        for(let function_name in builtin_functions[table_name]) {
            const entry = builtin_functions[table_name][function_name];
            const snippet_command = table_name === "_G" ? function_name : `${table_name}.${function_name}`;
            snippets[snippet_command] = {
                "prefix": table_name === "_G" ? snippet_command : [ snippet_command, function_name ]
            }
            if ('description' in entry) {
                snippets[snippet_command]['description'] = entry.description;
            }

            let args_string = "";
            if ('args' in entry && entry.args.length > 0) {

                let arg_num = 1;
                for(let argument of entry.args) {

                    args_string += "${" + (arg_num).toString() +":"+argument.name+"}";

                    if(arg_num < entry.args.length)
                        args_string +=", ";

                    arg_num++;
                }
            }
            snippets[snippet_command]['body'] = [`${snippet_command}(${args_string})`]
        }
    }

    fs.writeFileSync('result/lua_snippets.json', JSON.stringify(snippets, " ", "\t"));

})();
