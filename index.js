const { handlePage } = require('./src/handlePage');
const {
    readJsonFilesSync,
    readMarkdownFilesSync,
    readJsonContentFilesSync,
} = require('./util/readFile');
const { saveFile } = require('./util/saveFile');

const main = () => {
    const pages = readJsonFilesSync('./pages');
    const markdown = readMarkdownFilesSync('./content');
    const json = readJsonContentFilesSync('./content');

    // console.log(pages);
    // console.log(markdown);
    // console.log(json);

    const pageDataArray = pages.map((e) => handlePage(markdown, json)(e));

    pageDataArray.forEach(({ outputFolder, content }) => {
        saveFile(`./output/${outputFolder}`, 'content.txt', content.join('\n\n'));
    });

    //Save pages
};

main();
