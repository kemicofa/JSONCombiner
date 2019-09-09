const fs = require('fs');
const Iconv = require('iconv').Iconv;
const detectCharacterEncoding = require('detect-character-encoding');

const [directory] = process.argv.slice(2);
const encoding = 'UTF8';

if(!directory){
    console.log("A directory with json files was expected. None given.");
    return;
}

console.log("Directory with json files: ", directory);

const files = fs.readdirSync(directory).filter(file=>file.includes('.json'));

console.log("The following files were found : ", files.join("\n"));


const res = files.map(file=>{
    const buffer = fs.readFileSync(directory + '/' + file);
    charasetMatch = detectCharacterEncoding(buffer);
    console.log("Character encoding detected: " + JSON.stringify(charasetMatch));

    const iconv = new Iconv(charasetMatch.encoding, 'UTF-8');
    const decoded = iconv.convert(buffer).toString();

    try {

        const cleaned = decoded
            .replace(/"ad_chooser.*\n\s*/g, (matcher, $1)=>{
                console.log("Matched: ", $1);
                return '';
            });

        const data = JSON.parse(cleaned);

        return Object
            .entries(data)
            .filter(([key])=>!key.includes('ad_chooser'))
            .reduce((a, [key,value])=>({[key]:value, ...a}), {});

    } catch(err){
        console.log(directory, file, err.message)
        return;
    }

});

fs.writeFileSync(directory + `/iab_category.${Date.now()}.json`, `${JSON.stringify(res)}`)