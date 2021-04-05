
let [, , scriptName] = process.argv;

scriptName = scriptName.split('/').pop();
scriptName = scriptName.endsWith('.js') ? scriptName : `${scriptName}.js`;
const { default: fnJob } = await import(`./jobs/${scriptName}`);
await fnJob();

process.exit(0);