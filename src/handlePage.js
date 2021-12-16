const { flatten } = require('../util/flatten');

exports.handlePage =
    (markdown, json) =>
    ({
        outputFolder,
        folderPrefix,
        content: bodyContent = [],
        footContent = [],
        sideContent = [],
    }) => {
        const commonWork = cc => {
            switch (typeof cc) {
                case 'string':
                case 'number':
                    return '' + cc;
                case 'object':
                    return template(cc, folderPrefix, markdown, json);
            }
        };

        const bodyLines = bodyContent.map(cc => commonWork(cc));
        const footLines = footContent.map(cc => commonWork(cc));
        const sideLines = sideContent.map(cc => commonWork(cc));

        return {
            outputFolder,
            content: flatten(bodyLines),
            footContent: flatten(footLines),
            sideContent: flatten(sideLines),
        };
    };

const template = (block, folderPrefix, markdown, json) => {
    if (typeof block !== 'object') {
        switch (typeof block) {
            case 'string':
            case 'number':
                return [block];
        }
        return [];
    }
    const {
        type,
        file,
        files: tempFiles = [],
        entries,
        levelHeaders = false,
        concatFile = [],
    } = block;
    let lines = [];
    let files = tempFiles;

    if (Array.isArray(concatFile) && concatFile.length) {
        concatFile.forEach(cf => {
            const { content: tempCFArray } = json[cf];

            if (
                Array.isArray(tempCFArray) &&
                tempCFArray.length &&
                Array.isArray(files)
            ) {
                files = files.concat(tempCFArray);
            }
        });

    }

    switch (type) {
        case 'md':
            const mdFile = {
                ...markdown[getPath(folderPrefix, file)],
                filePath: file,
            };
            lines.push(getMarkdownGeneric(mdFile));
            break;
        case 'md-feat':
            const mdFeatFile = {
                ...markdown[getPath(folderPrefix, file)],
                filePath: file,
            };
            lines.push(getMarkdownFeat(mdFeatFile));
            break;
        case 'md-group':
        case 'md-feat-group':
            const mdFeatFileList = files
                .map(f => ({
                    ...markdown[getPath(folderPrefix, f)],
                    fileName: f,
                }))
                .sort(sortFeat);
            lines.push('[section:item-container]');
            if (levelHeaders) {
                const level20 = new Array(20).fill(0);
                level20.forEach((_, lv) => {
                    let levelList = mdFeatFileList.filter(
                        e => e.metadata.level === lv
                    );
                    if (levelList.length) {
                        lines.push(
                            `[section:level-head]${numToNthString(
                                lv
                            )} level[/section]`
                        );

                        lines.push(levelList.map(getMarkdownFeat));
                    }
                });
            } else {
                lines.push(mdFeatFileList.map(getMarkdownFeat));
            }
            lines.push('[/section]');

            break;
        case 'json-feat':
            //TODO
            break;
        case 'json-feat-group':
            //TODO
            break;
        case 'text':
        case 'p':
            lines = lines.concat(
                ['[p]'],
                Array.isArray(entries)
                    ? entries.map(e =>
                          template(e, folderPrefix, markdown, json)
                      )
                    : [],
                ['[/p]']
            );
            break;
        case 'q':
        case 'quote':
            lines = lines.concat(
                ['[quote]'],
                Array.isArray(entries)
                    ? entries.map(e =>
                          template(e, folderPrefix, markdown, json)
                      )
                    : [],
                ['[/quote]']
            );
            break;
    }

    return flatten(lines);
};

const getPath = (folder, file) => {
    if (file.startsWith('/')) return file.replace('/', '');
    let x = `${folder}/${file}`;
    if (file.startsWith('.')) {
        x = file.replace(/\.+\//, '');
    }
    console.log('loading file', x);
    return x;
};

const sortFeat = ({ metadata: a = {} }, { metadata: b = {} }) => {
    const aNum = Number(a.level);
    const bNum = Number(b.level);
    if (typeof aNum === 'number' && typeof bNum === 'number') {
        if (aNum < bNum) return -1;
        if (aNum > bNum) return 1;
    }
    if (a.title < b.title) return -1;
    if (a.title > b.title) return 1;
    return 0;
};

const getMetadataFeatTitle = ({
    title,
    traits,
    rarity,
    action,
    level,
    label = 'Feat',
}) => {
    const lines = [];

    //Build title
    let featTitle = `[h3]${title}`;

    switch (action) {
        case 'one-action':
            featTitle += ' [section:one-action] [/section]';
            break;
        case 'two-action':
            featTitle += ' [section:two-action] [/section]';
            break;
        case 'three-action':
            featTitle += ' [section:three-action] [/section]';
            break;
        case 'reaction':
            featTitle += ' [section:reaction] [/section]';
            break;
        case 'free-action':
            featTitle += ' [section:free-action] [/section]';
            break;
    }

    if (level || level === 0) {
        featTitle += `[right]${label} ${Math.max(1,level)}[/right]`;
    }

    featTitle += '[/h3]';

    // featTitle += `[/section]`;

    switch (rarity) {
        case 'common':
            featTitle += '[section:trait]common[/section]';
            break;
        case 'uncommon':
            featTitle += '[section:trait-uncommon]uncommon[/section]';
            break;
        case 'rare':
            featTitle += '[section:trait-rare]rare[/section]';
            break;
        case 'unique':
            featTitle += '[section:trait-unique]unique[/section]';
            break;
    }

    lines.push(featTitle);

    //Build traits

    if (Array.isArray(traits) && traits.length) {
        lines.push(
            traits
                .filter(e => e)
                .sort()
                .map(trait => `[section:trait]${trait}[/section]`)
                .join('')
        );
    }

    return lines.join('');
};

const getMetadataHeaderTitle = ({ title = '', heading = '', link ='' }) => {
    if (!title) {
        return [];
    }

    let headingLevel = Number(String(heading).replace(/[^0-9]/g, ''));

    if (!Number.isFinite(headingLevel) && Number(headingLevel) < 1) {
        headingLevel = 1;
    }

    let strTitle = title;

    if(link){
        strTitle = `[url:${link}]${title}[/url]`
    }

    return [`[h${headingLevel}]${strTitle}[/h${headingLevel}]`];
};

const getMetadataContent = ({
    access,
    prereq,
    req,
    archetype,
    frequency,
    trigger,
    price,
    bulk
}) => {
    const lines = [];

    //Build remaining strings

    if (archetype && typeof archetype === 'string') {
        lines.push(`[b]Archetype[/b] ${archetype}`);
    }

    if (access && typeof access === 'string') {
        lines.push(`[b]Access[/b] ${access}`);
    }

    if (prereq && typeof prereq === 'string') {
        lines.push(`[b]Prerequisites[/b] ${prereq}`);
    }

    if (trigger && typeof trigger === 'string') {
        lines.push(`[b]Trigger[/b] ${trigger}`);
    }

    if (frequency && typeof frequency === 'string') {
        lines.push(`[b]Frequency[/b] ${frequency}`);
    }

    if (req && typeof req === 'string') {
        lines.push(`[b]Requirement[/b] ${req}`);
    }

    if (price && Number(price)) {
        lines.push(`[b]Price[/b] ${Number(price).toLocaleString()} gp`);
    }

    if (bulk && typeof bulk === 'string') {
        lines.push(`[b]Bulk[/b] ${bulk}`);
    }

    return lines;
};

const getMarkdownGeneric = data => {
    try {
        const { metadata, content } = data;
        return [
            getMetadataHeaderTitle(metadata),
            '[p]',
            getMetadataContent(metadata),
            markdownToWorldAnvil(content, metadata).trim(),
            '[/p]',
        ];
    } catch (e) {
        console.log(e.message, data);
    }

    return [];
};

const getMarkdownFeat = data => {
    try {
        const { metadata, content } = data;
        const { type = 'feat' } = metadata;
        return [
            `[section:item-type ${type}]${getMetadataFeatTitle(metadata)}`,
            // '[p]',
            getMetadataContent(metadata),
            markdownToWorldAnvil(content, metadata).trim(),
            // '[/p]',
            '[/section]',
        ];
    } catch (e) {
        console.log(e.message, data);
    }

    return [];
};

const markdownToWorldAnvil = (starStr = '', { title = '' }) => {
    let str = starStr.trim();

    str = str.replace(/(\[[^\[]+\]\([^)]*\))/g, (match, i) => {
        const matches = match.match(/\[([^\[]+)\]\((.*)\)/);

        return `[url=${matches[2]}]${matches[1]}[/url]`;
    });

    str = str.replace(/\*\*\*([^\*\n]+)\*\*\*/g, '[b][i]$1[/i][/b]');

    str = str.replace(/\*\*([^\*\n]+)\*\*/g, '[b]$1[/b]');

    str = str.replace(/\*([^\*\n]+)\*/g, '[i]$1[/i]');

    str = str.replace(/\\\*/g, '*');

    str = str.replace(/\r+\n+/g, '\n');
    str = str.replace(/\xa0+/g, ' ');

    str = str.replace(/\{title\}/g, title);
    str = str.replace(/\{one-action\}/g, '[section:one-action] [/section]');
    str = str.replace(/\{two-action\}/g, '[section:two-action] [/section]');
    str = str.replace(/\{three-action\}/g, '[section:three-action] [/section]');
    str = str.replace(/\{reaction\}/g, '[section:reaction] [/section]');
    str = str.replace(/\{free-action\}/g, '[section:free-action] [/section]');

    // Handle Headers
    str = str.replace(/\n# +([^\n]+)/g, '\n[h1]$1[/h1]');
    str = str.replace(/\n## +([^\n]+)/g, '\n[h2]$1[/h2]');
    str = str.replace(/\n### +([^\n]+)/g, '\n[h3]$1[/h3]');
    str = str.replace(/\n#### +([^\n]+)/g, '\n[h4]$1[/h4]');

    //Handle Lists
    str = str.replace(/\n- +([^\n]+)/g, '\n[li]$1[/li]');
    str = str.replace(/(\[li].+?\[\/li]\n*)+,?/gs, match => {
        return `[ul]\n${match.trim()}\n[/ul]\n\n`;
    });

    // str = str.replace(/\| *th\\([^\|\n]+) +/g, '[th]$1[/th]');
    // str = str.replace(/\| *([^\|\n]+) +/g, '[td]$1[/td]');
    str = str.replace(/\| *([^\|\n]+) */g, (_, p1) => {
        const e = p1.trim().includes('_th_') ? 'th' : 'td';
        const content = p1.replace('\\_th_', '').replace('_th_', '');
        return `[${e}]${content}[/${e}]`;
    });
    str = str.replace(/^([^\|\n]+)\|/gm, '[tr]$1[/tr]');
    str = str.replace(/(\[tr].+?\[\/tr]\n*)+,?/gs, match => {
        return `[table]\n${match.trim()}\n[/table]\n\n`;
    });

    //Handle HR
    str = str.replace(/---/g, '[hr]');

    str.split('\n')
        .map(e => e.trim())
        .filter(e => e)
        .join('\n\n');

    return str;
};

const numToNthString = num => {
    switch (Number(num)) {
        case 1:
            return '1st';
        case 2:
            return '2nd';
        case 3:
            return '3rd';
        default:
            return num + 'th';
    }
};
