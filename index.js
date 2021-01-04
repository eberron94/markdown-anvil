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

    const pageDataArray = pages.map(e => handlePage(markdown, json)(e));

    pageDataArray.forEach(
        ({ outputFolder, content, footContent, sideContent }) => {
            if (content)
                saveFile(
                    `./output/${outputFolder}`,
                    'content.txt',
                    content.join('\n\n')
                );

            if (footContent)
                saveFile(
                    `./output/${outputFolder}`,
                    'footContent.txt',
                    footContent.join('\n\n')
                );
            if (sideContent)
                saveFile(
                    `./output/${outputFolder}`,
                    'sideContent.txt',
                    sideContent.join('\n\n')
                );
        }
    );

    //Save pages
};

main();
