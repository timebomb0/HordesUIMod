import sass from 'node-sass';
import browserify from 'browserify';
import fs from 'fs';
import { sep } from 'path';
import esmify from 'esmify';
import stringToStream from 'stream-to-string';

import authors from './authors.js';
import { VERSION } from './utils/version.js';

const SRC_FOLDER = `${process.cwd()}${sep}src`;
const MODS_FOLDER = `${SRC_FOLDER}${sep}mods`;
const OUTPUT_DIR = `${process.cwd()}${sep}build`;
const OUTPUT_FILE = `${OUTPUT_DIR}${sep}userscript.js`;
// Fun fact: We are NOT ALLOWED TO OBFUSCATE/MINIFY our userscript on greasyfork.org

console.log('Building userscript...');

const folders = fs
	.readdirSync(MODS_FOLDER)
	.filter(file => fs.lstatSync(`${MODS_FOLDER}${sep}${file}`).isDirectory());

// Get array of all style.scss files in mods/* folders
const stylePaths = [].concat.apply(
	[],
	folders.map(folder =>
		fs
			.readdirSync(`${MODS_FOLDER}${sep}${folder}`)
			.filter(files => files.includes('styles.scss'))
			.map(() => `${MODS_FOLDER}${sep}${folder}${sep}styles.scss`),
	),
);

// Render the sass files into a single css string
const cssStr = stylePaths
	.map(
		path =>
			sass.renderSync({
				file: path,
			}).css,
	)
	.join('');

const jsStream = browserify(`${SRC_FOLDER}${sep}main.js`, {
	plugin: [esmify],
}).bundle();

async function compile() {
	try {
		const jsStr = await stringToStream(jsStream);

		const userScriptTplStr = fs.readFileSync(`${SRC_FOLDER}${sep}userscript.template`, 'utf8');
		const userScriptStr = userScriptTplStr
			.replace('{{css}}', cssStr)
			.replace('{{javascript}}', jsStr)
			.replace('{{authors}}', authors.join(' & '))
			.replace('{{version}}', VERSION);

		if (!fs.existsSync(OUTPUT_DIR)) {
			fs.mkdirSync(OUTPUT_DIR);
		}
		fs.writeFileSync(OUTPUT_FILE, userScriptStr);
		console.log(`Built to ${OUTPUT_FILE}`);
	} catch (e) {
		console.error('Problem compiling bundle', e);
	}
}
compile();
